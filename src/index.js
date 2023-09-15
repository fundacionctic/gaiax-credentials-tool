import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import {
  getConfig,
  getIssuerDID,
  getParticipantUrl,
  getServiceOfferingUrl,
  getTermsConditionsUrl,
} from "./config.js";
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

  console.log("Sending Verifiable Presentation to Compliance API");
  console.log(`POST -> ${config.urlAPICompliance}`);
  console.log(verifiablePresentation);

  try {
    const res = await axios.post(
      config.urlAPICompliance,
      verifiablePresentation
    );

    console.log(chalk.green("✅ Compliance success"));
    console.log(res.data);

    Object.assign(verifiablePresentation, {
      verifiableCredential: [...verifiableCredentials, res.data],
    });

    console.log(
      `Writing resulting Verifiable Presentation to ${config.pathVerifiablePresentation}`
    );

    await writeFile(config.pathVerifiablePresentation, verifiablePresentation);
  } catch (err) {
    console.error(chalk.red("🔴 Compliance error"));
    const errMsg = (err.response && err.response.data) || err;
    console.error(errMsg);
    throw err;
  }
}

async function actionCredentials() {
  console.log("Building Participant Verifiable Credential");
  const vcParticipant = await buildParticipantVC();
  console.log(vcParticipant);

  console.log("Building Legal Registration Number Verifiable Credential");
  const vcLRN = await buildLegalRegistrationNumberVC();
  console.log(vcLRN);

  console.log("Building Terms and Conditions Verifiable Credential");
  const vcTC = await buildTermsConditionsVC();
  console.log(vcTC);

  console.log("Building Service Offering Verifiable Credential");

  const config = getConfig();

  const vcSO = await buildServiceOffering({
    didIssuer: getIssuerDID(),
    legalParticipantUrl: getParticipantUrl(),
    termsConditionsUrl: getTermsConditionsUrl(),
    serviceOfferingUrl: getServiceOfferingUrl(),
    serviceOfferingWritePath: config.pathServiceOffering,
  });

  console.log(vcSO);

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
