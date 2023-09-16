import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import { getConfig } from "./config.js";
import { logger } from "./log.js";
import {
  buildLegalRegistrationNumberVC,
  buildParticipantVC,
  buildTermsConditionsVC,
  writeDIDFile,
} from "./participant.js";
import { buildServiceOffering } from "./service.js";
import { writeFile } from "./utils.js";

export async function signCredentials({ verifiableCredentials }) {
  const config = getConfig();

  const verifiablePresentation = {
    "@context": "https://www.w3.org/2018/credentials/v1",
    type: "VerifiablePresentation",
    verifiableCredential: verifiableCredentials,
  };

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

    Object.assign(verifiablePresentation, {
      verifiableCredential: [...verifiableCredentials, res.data],
    });

    logger.info(
      `Writing resulting Verifiable Presentation to ${config.pathVerifiablePresentation}`
    );

    await writeFile(config.pathVerifiablePresentation, verifiablePresentation);
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

  logger.info("Building Service Offering Verifiable Credential");

  const config = getConfig();

  const vcSO = await buildServiceOffering({
    didIssuer: config.didWebId,
    legalParticipantUrl: config.urlParticipant,
    termsConditionsUrl: config.urlTermsConditions,
    serviceOfferingUrl: config.urlServiceOffering,
    serviceOfferingWritePath: config.pathServiceOffering,
  });

  logger.debug(vcSO);

  await signCredentials({
    verifiableCredentials: [vcParticipant, vcLRN, vcTC, vcSO],
  });
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
