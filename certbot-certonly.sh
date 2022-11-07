#!/usr/bin/env bash

set -ex

: "${CERTBOT_PUBLIC_PORT:?}"
: "${CERTBOT_EMAIL:?}"
: "${CERTBOT_DOMAIN:?}"

docker run -it --rm \
    -p ${CERTBOT_PUBLIC_PORT}:80 \
    -v "$(pwd)/letsencrypt:/etc/letsencrypt" \
    certbot/certbot certonly --standalone -n --agree-tos --email ${CERTBOT_EMAIL} -d ${CERTBOT_DOMAIN}

CERT=$(sudo cat ./letsencrypt/live/${CERTBOT_DOMAIN}/cert.pem)
PRIVKEY=$(sudo cat ./letsencrypt/live/${CERTBOT_DOMAIN}/privkey.pem)
FULLCHAIN=$(sudo cat ./letsencrypt/live/${CERTBOT_DOMAIN}/fullchain.pem)

touch .env.certs

echo "CERTIFICATE=\"${CERT}\"" >>.env.certs
echo $'\n' >>.env.certs
echo "PRIVATE_KEY=\"${PRIVKEY}\"" >>.env.certs
echo $'\n' >>.env.certs
echo "FULLCHAIN=\"${FULLCHAIN}\"" >>.env.certs
