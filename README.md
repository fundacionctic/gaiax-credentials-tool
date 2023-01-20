# Gaia-X Self-Descriptions

A simple proof of concept of the process to build and sign a Self-Description using the [Gaia-X Compliance Service](https://gitlab.com/gaia-x/lab/compliance/gx-compliance).

## Prerequisites

* A Linux server that has ports 80 and 443 exposed to the Internet. You also need _sudo_ access.
* Make.
* Docker.
* Git.
* A public DNS domain that points to the IP address of the previous Linux server.

## Configuration

Create an `.env` file in the root folder that defines the following variables:

| Variable                    | Description                                                                                                                                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CERTBOT_DOMAIN`            | The domain for which a [Let's Encrypt](https://letsencrypt.org/) certificate will be obtained.                                                                                                                                                 |
| `CERTBOT_EMAIL`             | The email of the domain owner.                                                                                                                                                                                                                 |
| `DELTA_DAO_SDSIGNER_COMMIT` | [deltaDAO/self-description-signer](https://github.com/deltaDAO/self-description-signer) is a tool that simplifies the signing and validation of a Self-Description. This variable represents the commit hash that will be checked out locally. |

Check out the `.env.example` file to see an example.

> Please note that the `DELTA_DAO_SDSIGNER_COMMIT` hash that appears in `.env.example` is the version that we used to validate this proof of concept. This means that you should probably use the same value unless you explicitly want to test another version of self-description-signer.

Then, update the provided `self-description.json` file to match the information of your [_Participant_](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/participant/).

## Run the project

Simply run:

```
make run-self-description-signer
```

The output will look something like the following:

```
./clone-sdsigner.sh
+ : f220dc1e2c1b0c302b10e58a0ad9c467d6c5ad37
+ git clone https://github.com/deltaDAO/self-description-signer.git self-description-signer
Cloning into 'self-description-signer'...
remote: Enumerating objects: 244, done.

[...]

🔒 SD signed successfully (local)
✅ Verification successful (local)
📁 ./output/1668009334582_self-signed_LegalPerson.json saved
📁 ./output/1668009334582_did.json saved 

🔍 Checking Self Description with the Compliance Service...
'Something went wrong:'
{
  statusCode: 409,
  message: 'Could not load document for given did:web: "did:web:gaiax.ctic.es#X509"',
  error: 'Conflict'
}

[...]

🔒 SD signed successfully (local)
✅ Verification successful (local)
📁 ./output/1668009348412_self-signed_LegalPerson.json saved
📁 ./output/1668009348412_did.json saved 

🔍 Checking Self Description with the Compliance Service...
🔒 SD signed successfully (compliance service)
✅ Verification successful (compliance service)
📁 ./output/1668009348412_complete_LegalPerson.json saved
```

The final, validated self description will be located in:

```
self-description-signer/output/<timestamp>_complete_LegalPerson.json
```

A simplified version of this process is shown in the following diagram:

![Self-Description sign process](/sd-sign-process.png)
