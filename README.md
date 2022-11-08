# Gaia-X Self-Descriptions

A simple proof-of-concept of the process to build and sign a Self-Description using the [Gaia-X Compliance Service](https://gitlab.com/gaia-x/lab/compliance/gx-compliance).

| Variable | Description |
| --- | --- |
| `CERTBOT_DOMAIN` | The domain for which a [Let's Encrypt](https://letsencrypt.org/) certificate will be obtained. |
| `CERTBOT_EMAIL` | The email of the domain owner. |
| `DELTA_DAO_SDSIGNER_COMMIT` | [deltaDAO/self-description-signer](https://github.com/deltaDAO/self-description-signer) is a tool that simplifies the signing and validation of a Self-Description. This variable represents the commit hash that will be checked out locally. |
