#!/usr/bin/env bash

set -e

: "${CERTBOT_DOMAIN:?}"

CONFIG_PATH=./self-description-signer/config/.env
touch ${CONFIG_PATH}
>${CONFIG_PATH}

echo "PRIVATE_KEY=\"$(cat ./certs/privkey.pem)\"" >${CONFIG_PATH}
echo "CERTIFICATE=\"$(cat ./certs/cert.pem)\"" >>${CONFIG_PATH}
echo "VERIFICATION_METHOD=\"did:web:${CERTBOT_DOMAIN}#X509\"" >>${CONFIG_PATH}
echo "X5U_URL=\"https://${CERTBOT_DOMAIN}/.well-known/x509CertificateChain.pem\"" >>${CONFIG_PATH}
echo "API_VERSION=\"2206\"" >>${CONFIG_PATH}
echo "BASE_URL=\"https://compliance.gaia-x.eu\"" >>${CONFIG_PATH}
echo "CONTROLLER=\"did:web:${CERTBOT_DOMAIN}\"" >>${CONFIG_PATH}
