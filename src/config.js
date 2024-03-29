import path from "node:path";
import yup from "yup";
import { joinUrl } from "./utils.js";

export function getConfig() {
  const envConfig = {
    baseUrl: process.env.BASE_URL,
    legalName: process.env.LEGAL_NAME,
    countryCode: process.env.COUNTRY_CODE,
    countrySubdivisionCode: process.env.COUNTRY_SUBDIVISION_CODE,
    vatID: process.env.VAT_ID,
    didWebId: process.env.DID_WEB_ID,
    baseUrl: process.env.BASE_URL,
    fileX5U: process.env.FILENAME_X5U,
    fileDID: process.env.FILENAME_DID,
    fileVerifiablePresentation: process.env.FILENAME_VP,
    fileLRN: process.env.FILENAME_LRN,
    fileTermsConditions: process.env.FILENAME_TC,
    fileParticipant: process.env.FILENAME_PARTICIPANT,
    fileServiceOffering: process.env.FILENAME_SO,
    urlAPICompliance: process.env.API_COMPLIANCE_CREDENTIAL_OFFER,
    webserverDir: process.env.WEBSERVER_DIR,
    pathCertificate: process.env.PATH_CERTIFICATE,
    pathPrivateKey: process.env.PATH_PRIVATE_KEY,
    openAPISpec: process.env.RESOURCE_OPENAPI_SPEC,
  };

  const schemaSpec = Object.fromEntries(
    Object.keys(envConfig).map((key) => [key, yup.string().required()])
  );

  const envSchema = yup.object(schemaSpec);
  envSchema.validateSync(envConfig);

  const config = Object.assign(envConfig, {
    urlParticipant: joinUrl(envConfig.baseUrl, envConfig.fileParticipant),
    urlLRN: joinUrl(envConfig.baseUrl, envConfig.fileLRN),
    urlX5U: joinUrl(envConfig.baseUrl, envConfig.fileX5U),
    urlTermsConditions: joinUrl(
      envConfig.baseUrl,
      envConfig.fileTermsConditions
    ),
    urlServiceOffering: joinUrl(
      envConfig.baseUrl,
      envConfig.fileServiceOffering
    ),
    pathVerifiablePresentation: path.join(
      envConfig.webserverDir,
      envConfig.fileVerifiablePresentation
    ),
    pathServiceOffering: path.join(
      envConfig.webserverDir,
      envConfig.fileServiceOffering
    ),
    pathDID: path.join(envConfig.webserverDir, envConfig.fileDID),
    pathParticipant: path.join(
      envConfig.webserverDir,
      envConfig.fileParticipant
    ),
    pathLRN: path.join(envConfig.webserverDir, envConfig.fileLRN),
    pathTermsConditions: path.join(
      envConfig.webserverDir,
      envConfig.fileTermsConditions
    ),
  });

  return config;
}

function slugify(val) {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
}

export function getVirtualResourceName({ openAPISpec }) {
  return `vr-${slugify(openAPISpec)}`;
}

export function getInstantiatedVirtualResourceName({ openAPISpec }) {
  return `ivr-${slugify(openAPISpec)}`;
}
