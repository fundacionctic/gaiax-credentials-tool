import * as jose from "jose";
import jsonld from "jsonld";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { getConfig } from "./config.js";
import { logger } from "./log.js";

export const ALGORITHM_RSASSA_PSS = "PS256";
export const ALGORITHM_URDNA2015 = "URDNA2015";

export async function publicKeyMatchesCertificate(
  publicKeyJwk,
  certificatePem
) {
  try {
    const pk = await jose.importJWK(publicKeyJwk);
    const spki = await jose.exportSPKI(pk);
    const x509 = await jose.importX509(certificatePem, ALGORITHM_RSASSA_PSS);
    const spkiX509 = await jose.exportSPKI(x509);
    return spki === spkiX509;
  } catch (error) {
    logger.error(error);

    throw new Error(
      "Could not confirm X509 public key with certificate chain."
    );
  }
}

export async function writeFile(filePath, obj) {
  const data = JSON.stringify(obj, null, 2);
  await fs.writeFile(filePath, data);
}

export function joinUrl(...parts) {
  return parts.map((item) => item.trimEnd("/")).join("/");
}

export function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function canonize(doc) {
  return await jsonld.canonize(doc, {
    algorithm: ALGORITHM_URDNA2015,
  });
}

export async function sign(hash) {
  const config = getConfig();

  const privkeyPem = await fs.readFile(config.pathPrivateKey, {
    encoding: "utf8",
  });

  const rsaPrivateKey = await jose.importPKCS8(
    privkeyPem,
    ALGORITHM_RSASSA_PSS
  );

  const jws = await new jose.CompactSign(new TextEncoder().encode(hash))
    .setProtectedHeader({
      alg: ALGORITHM_RSASSA_PSS,
      b64: false,
      crit: ["b64"],
    })
    .sign(rsaPrivateKey);

  return jws;
}

export async function createProof(doc) {
  const config = getConfig();
  const canonized = await canonize(doc);
  const hash = sha256(canonized);
  const created = new Date().toISOString();

  const proof = {
    type: "JsonWebSignature2020",
    created,
    proofPurpose: "assertionMethod",
    verificationMethod: `${config.didWebId}#JWK2020`,
    jws: await sign(hash),
  };

  return proof;
}
