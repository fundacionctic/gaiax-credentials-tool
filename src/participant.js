import axios from "axios";
import chalk from "chalk";
import * as jose from "jose";
import fs from "node:fs/promises";
import path from "node:path";
import {
  getIssuerDID,
  getLegalRegistrationNumberUrl,
  getParticipantUrl,
  getTermsConditionsUrl,
} from "./config.js";
import {
  ALGORITHM_RSASSA_PSS,
  createProof,
  joinUrl,
  publicKeyMatchesCertificate,
  writeFile,
} from "./utils.js";

export async function writeDIDFile() {
  const certificatePem = await fs.readFile(process.env.PATH_CERTIFICATE, {
    encoding: "utf8",
  });

  const x509 = await jose.importX509(certificatePem, ALGORITHM_RSASSA_PSS);
  const publicKeyJwk = await jose.exportJWK(x509);
  publicKeyJwk.alg = ALGORITHM_RSASSA_PSS;
  publicKeyJwk.x5u = joinUrl(process.env.BASE_URL, process.env.FILENAME_X5U);

  // A sanity check to catch upstream errors in the Compliance API calls
  if (!publicKeyMatchesCertificate(publicKeyJwk, certificatePem)) {
    throw new Error("Public key does not match certificate");
  }

  const did = {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: process.env.DID_WEB_ID,
    verificationMethod: [
      {
        "@context": "https://w3c-ccg.github.io/lds-jws2020/contexts/v1/",
        id: process.env.DID_WEB_ID,
        type: "JsonWebKey2020",
        publicKeyJwk,
      },
    ],
    assertionMethod: [`${process.env.DID_WEB_ID}#JWK2020`],
  };

  const filePath = path.join(
    process.env.WEBSERVER_DIR,
    process.env.FILENAME_DID
  );

  await writeFile(filePath, did);
}

export async function buildParticipantVC() {
  const issuanceDate = new Date().toISOString();

  const doc = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
      "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
    ],
    type: ["VerifiableCredential"],
    id: getParticipantUrl(),
    issuer: getIssuerDID(),
    issuanceDate: issuanceDate,
    credentialSubject: {
      type: "gx:LegalParticipant",
      "gx:legalName": process.env.LEGAL_NAME,
      "gx:legalRegistrationNumber": {
        id: getLegalRegistrationNumberUrl(),
      },
      "gx:headquarterAddress": {
        "gx:countrySubdivisionCode": process.env.COUNTRY_SUBDIVISION_CODE,
      },
      "gx:legalAddress": {
        "gx:countrySubdivisionCode": process.env.COUNTRY_SUBDIVISION_CODE,
      },
      "gx-terms-and-conditions:gaiaxTermsAndConditions":
        getTermsConditionsUrl(),
      id: getParticipantUrl(),
    },
  };

  const proof = await createProof(doc);
  Object.assign(doc, { proof });

  const filePath = path.join(
    process.env.WEBSERVER_DIR,
    process.env.FILENAME_PARTICIPANT
  );

  await writeFile(filePath, doc);

  return doc;
}

export async function buildLegalRegistrationNumberVC() {
  const issuanceDate = new Date().toISOString();

  const doc = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
    ],
    type: "VerifiableCredential",
    id: getLegalRegistrationNumberUrl(),
    issuer: getIssuerDID(),
    issuanceDate: issuanceDate,
    credentialSubject: {
      id: getLegalRegistrationNumberUrl(),
      "@context":
        "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
      type: "gx:legalRegistrationNumber",
      "gx:vatID": process.env.VAT_ID,
      "gx:vatID-countryCode": process.env.COUNTRY_CODE,
    },
  };

  const proof = await createProof(doc);
  Object.assign(doc, { proof });

  const filePath = path.join(
    process.env.WEBSERVER_DIR,
    process.env.FILENAME_LRN
  );

  await writeFile(filePath, doc);

  return doc;
}

export async function buildTermsConditionsVC() {
  const issuanceDate = new Date().toISOString();

  const termsAndConditions =
    "The PARTICIPANT signing the Self-Description agrees as follows:\n- " +
    "to update its descriptions about any changes, " +
    "be it technical, organizational, or legal - " +
    "especially but not limited to contractual in regards to " +
    "the indicated attributes present in the descriptions.\n\n" +
    "The keypair used to sign Verifiable Credentials will be revoked " +
    "where Gaia-X Association becomes aware of any inaccurate statements " +
    "in regards to the claims which result in a non-compliance " +
    "with the Trust Framework and policy rules defined " +
    "in the Policy Rules and Labelling Document (PRLD).";

  const doc = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
      "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
    ],
    type: "VerifiableCredential",
    id: getTermsConditionsUrl(),
    issuer: getIssuerDID(),
    issuanceDate: issuanceDate,
    credentialSubject: {
      "@context":
        "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
      type: "gx:GaiaXTermsAndConditions",
      id: getTermsConditionsUrl(),
      "gx:termsAndConditions": termsAndConditions,
    },
  };

  const proof = await createProof(doc);
  Object.assign(doc, { proof });

  const filePath = path.join(
    process.env.WEBSERVER_DIR,
    process.env.FILENAME_TC
  );

  await writeFile(filePath, doc);

  return doc;
}

export async function writeParticipantCredentials() {
  console.log("Building Participant Verifiable Credential");
  const vcParticipant = await buildParticipantVC();
  console.log(vcParticipant);

  console.log("Building Legal Registration Number Verifiable Credential");
  const vcLRN = await buildLegalRegistrationNumberVC();
  console.log(vcLRN);

  console.log("Building Terms and Conditions Verifiable Credential");
  const vcTC = await buildTermsConditionsVC();
  console.log(vcTC);

  const verifiablePresentation = {
    "@context": "https://www.w3.org/2018/credentials/v1",
    type: "VerifiablePresentation",
    verifiableCredential: [vcParticipant, vcLRN, vcTC],
  };

  console.log("Sending Verifiable Presentation to Compliance API");
  console.log(`POST -> ${process.env.API_COMPLIANCE_CREDENTIAL_OFFER}`);
  console.log(verifiablePresentation);

  try {
    const res = await axios.post(
      process.env.API_COMPLIANCE_CREDENTIAL_OFFER,
      verifiablePresentation
    );

    console.log(chalk.green("✅ Compliance success"));
    console.log(res.data);

    Object.assign(verifiablePresentation, {
      verifiableCredential: [vcParticipant, vcLRN, vcTC, res.data],
    });

    const filePath = path.join(
      process.env.WEBSERVER_DIR,
      process.env.FILENAME_VP
    );

    console.log(`Writing resulting Verifiable Presentation to ${filePath}`);

    await writeFile(filePath, verifiablePresentation);
  } catch (err) {
    console.error(chalk.red("🔴 Compliance error"));
    console.error(err.response.data);
    throw err;
  }
}
