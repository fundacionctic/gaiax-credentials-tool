import axios from "axios";
import { logger } from "./log.js";
import { createProof, getProperty, sha256, writeFile } from "./utils.js";

const LICENSE_EUPL12 =
  "https://joinup.ec.europa.eu/sites/default/files/custom-page/attachment/2020-03/EUPL-1.2%20EN.txt";

export async function buildOpenAPIResources({
  openAPIUrl,
  didIssuer,
  participantUrl,
  virtResourceUrl,
  virtResourceWritePath = undefined,
  instVirtResourceUrl,
  instVirtResourceWritePath = undefined,
  license = LICENSE_EUPL12,
}) {
  const issuanceDate = new Date().toISOString();

  const context = [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/jws-2020/v1",
    "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
  ];

  const virtualResource = {
    "@context": context,
    type: "VerifiableCredential",
    id: virtResourceUrl,
    issuer: didIssuer,
    issuanceDate: issuanceDate,
    credentialSubject: {
      id: virtResourceUrl,
      type: "gx:VirtualResource",
      "gx:description": `HTTP API that is formally described using the OpenAPI schema at ${openAPIUrl}`,
      "gx:copyrightOwnedBy": [participantUrl],
      "gx:license": [license],
      "gx:policy": [""],
    },
  };

  logger.debug("Fetching OpenAPI schema: %s", openAPIUrl);
  const apiSchemaRes = await axios.get(openAPIUrl);
  const apiSchema = apiSchemaRes.data;

  const instVirtResourceSubject = {
    id: instVirtResourceUrl,
    type: ["gx:InstantiatedVirtualResource", "dcat:DataService"],
    "gx:maintainedBy": [participantUrl],
    "gx:hostedOn": virtResourceUrl,
    "gx:instanceOf": virtResourceUrl,
    "gx:tenantOwnedBy": [participantUrl],
    "gx:serviceAccessPoint": [openAPIUrl],
    "dcat:endpointDescription": openAPIUrl,
  };

  if (apiSchema.servers && apiSchema.servers.length > 0) {
    const server = apiSchema.servers[0];
    const serverUrl = getProperty(server, "url");

    if (serverUrl) {
      Object.assign(instVirtResourceSubject, {
        "dcat:endpointURL": serverUrl,
      });
    }
  }

  const instantiatedVirtualResource = {
    "@context": [...context, "https://www.w3.org/ns/dcat.jsonld"],
    type: "VerifiableCredential",
    id: instVirtResourceUrl,
    issuer: didIssuer,
    issuanceDate: issuanceDate,
    credentialSubject: instVirtResourceSubject,
  };

  for (const [doc, writePath] of [
    [virtualResource, virtResourceWritePath],
    [instantiatedVirtualResource, instVirtResourceWritePath],
  ]) {
    Object.assign(doc, { proof: await createProof(doc) });

    if (writePath) {
      await writeFile(writePath, doc);
    }
  }

  return {
    instantiatedVirtualResource,
    virtualResource,
  };
}

export async function buildServiceOffering({
  didIssuer,
  legalParticipantUrl,
  termsConditionsUrl,
  termsConditionsHash = undefined,
  serviceOfferingUrl,
  serviceOfferingWritePath = undefined,
  aggregatedResourceUrls = undefined,
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

  // ToDo: Remove comment
  // We started getting errors like the following:
  // Error: Error in Compliance API request:
  // {"statusCode":409,"message":{"conforms":false,"results":["ERROR: https://gaiax.cticpoc.com/.well-known/serviceoffering.json null: "]},"error":"Conflict"}
  // It seems the conformance errors come from gx:aggregationOf
  // if (aggregatedResourceUrls) {
  //   Object.assign(doc.credentialSubject, {
  //     "gx:aggregationOf": aggregatedResourceUrls,
  //   });
  // }

  const proof = await createProof(doc);
  Object.assign(doc, { proof });

  if (serviceOfferingWritePath) {
    await writeFile(serviceOfferingWritePath, doc);
  }

  return doc;
}
