import { Command } from "commander";
import { writeDIDFile, writeParticipantCredentials } from "./participant.js";

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
  .command("participant")
  .description("Build and sign the Verifiable Credentials of the participant")
  .action(writeParticipantCredentials);

program.parse();
