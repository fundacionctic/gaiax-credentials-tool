import axios from "axios";
import { createProof, sha256, writeFile } from "./utils.js";

export async function buildServiceOffering({
  didIssuer,
  legalParticipantUrl,
  termsConditionsUrl,
  termsConditionsHash = undefined,
  serviceOfferingUrl,
  serviceOfferingWritePath = undefined,
}) {
  const issuanceDate = new Date().toISOString();

  if (!termsConditionsHash) {
    const tcRes = await axios.get(termsConditionsUrl, {
      responseType: "arraybuffer",
    });

    termsConditionsHash = sha256(tcRes.data);
  }

  const doc = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
      "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
    ],
    type: "VerifiableCredential",
    id: serviceOfferingUrl,
    issuer: didIssuer,
    issuanceDate: issuanceDate,
    credentialSubject: {
      id: serviceOfferingUrl,
      type: "gx:ServiceOffering",
      "gx:providedBy": {
        id: legalParticipantUrl,
      },
      "gx:policy": "",
      "gx:termsAndConditions": {
        "gx:URL": termsConditionsUrl,
        "gx:hash": termsConditionsHash,
      },
      "gx:dataAccountExport": {
        "gx:requestType": "API",
        "gx:accessType": "digital",
        "gx:formatType": "application/json",
      },
    },
  };

  const proof = await createProof(doc);
  Object.assign(doc, { proof });

  if (serviceOfferingWritePath) {
    await writeFile(serviceOfferingWritePath, doc);
  }

  return doc;
}
