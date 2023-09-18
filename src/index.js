import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import path from "node:path";
import {
  getConfig,
  getInstantiatedVirtualResourceName,
  getVirtualResourceName,
} from "./config.js";
import { logger } from "./log.js";
import {
  buildLegalRegistrationNumberVC,
  buildParticipantVC,
  buildTermsConditionsVC,
  writeDIDFile,
} from "./participant.js";
import { buildOpenAPIResources, buildServiceOffering } from "./service.js";
import { buildVerifiablePresentation, joinUrl, writeFile } from "./utils.js";

export async function signCredentials({ verifiableCredentials }) {
  const config = getConfig();

  const verifiablePresentation = buildVerifiablePresentation({
    verifiableCredentials,
  });

  logger.info("Sending Verifiable Presentation to Compliance API");
  logger.info(`POST -> ${config.urlAPICompliance}`);
  logger.debug(verifiablePresentation);

  try {
    const res = await axios.post(
      config.urlAPICompliance,
      verifiablePresentation
    );

    logger.info(chalk.green("✅ Compliance success"));
    logger.debug(res.data);

    return res.data;
  } catch (err) {
    logger.error(chalk.red("🔴 Compliance error"));
    const errMsg = (err.response && err.response.data) || err;
    logger.error(errMsg);
    throw err;
  }
}

async function actionCredentials() {
  logger.info("Building Participant Verifiable Credential");
  const vcParticipant = await buildParticipantVC();
  logger.debug(vcParticipant);

  logger.info("Building Legal Registration Number Verifiable Credential");
  const vcLRN = await buildLegalRegistrationNumberVC();
  logger.debug(vcLRN);

  logger.info("Building Terms and Conditions Verifiable Credential");
  const vcTC = await buildTermsConditionsVC();
  logger.debug(vcTC);

  logger.info("Building Verifiable Credentials for Resources");

  const config = getConfig();

  const virtResourceName = getVirtualResourceName({
    openAPISpec: config.openAPISpec,
  });

  const instVirtResourceName = getInstantiatedVirtualResourceName({
    openAPISpec: config.openAPISpec,
  });

  const virtResourceUrl = joinUrl(config.baseUrl, `${virtResourceName}.json`);

  const instVirtResourceUrl = joinUrl(
    config.baseUrl,
    `${instVirtResourceName}.json`
  );

  const virtResourceWritePath = path.join(
    config.webserverDir,
    `${virtResourceName}.json`
  );

  const instVirtResourceWritePath = path.join(
    config.webserverDir,
    `${instVirtResourceName}.json`
  );

  const { instantiatedVirtualResource: vcIVR, virtualResource: vcVR } =
    await buildOpenAPIResources({
      openAPIUrl: config.openAPISpec,
      didIssuer: config.didWebId,
      participantUrl: config.urlParticipant,
      virtResourceUrl,
      virtResourceWritePath,
      instVirtResourceUrl,
      instVirtResourceWritePath,
    });

  logger.debug(vcIVR);
  logger.debug(vcVR);

  logger.info("Building Verifiable Credential for Service Offering");

  const vcSO = await buildServiceOffering({
    didIssuer: config.didWebId,
    legalParticipantUrl: config.urlParticipant,
    termsConditionsUrl: config.urlTermsConditions,
    serviceOfferingUrl: config.urlServiceOffering,
    serviceOfferingWritePath: config.pathServiceOffering,
    aggregatedResourceUrls: [virtResourceUrl],
  });

  logger.debug(vcSO);

  const verifiableCredentials = [vcParticipant, vcLRN, vcTC, vcSO];

  const vcCompliance = await signCredentials({
    verifiableCredentials,
  });

  const vpResult = buildVerifiablePresentation({
    verifiableCredentials: [
      ...verifiableCredentials,
      vcCompliance,
      vcVR,
      vcIVR,
    ],
  });

  logger.info(
    `Writing resulting Verifiable Presentation to ${config.pathVerifiablePresentation}`
  );

  await writeFile(config.pathVerifiablePresentation, vpResult);
}

const program = new Command();

program
  .name("gaiax-credentials-cli")
  .description(
    "CLI to help in the process of building and signing Gaia-X credentials"
  )
  .version("0.1.0");

program
  .command("did")
  .description(
    "Build the DID document that represents the identity of the participant"
  )
  .action(writeDIDFile);

program
  .command("credentials")
  .description("Build and sign the Verifiable Credentials")
  .action(actionCredentials);

program.parse();
