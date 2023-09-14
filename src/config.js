import { joinUrl } from "./utils.js";

export function getIssuerDID() {
  return process.env.DID_WEB_ID;
}

export function getParticipantUrl() {
  return joinUrl(process.env.BASE_URL, process.env.FILENAME_PARTICIPANT);
}

export function getLegalRegistrationNumberUrl() {
  return joinUrl(process.env.BASE_URL, process.env.FILENAME_LRN);
}

export function getTermsConditionsUrl() {
  return joinUrl(process.env.BASE_URL, process.env.FILENAME_TC);
}
