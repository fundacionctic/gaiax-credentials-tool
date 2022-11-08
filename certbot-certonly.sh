#!/usr/bin/env bash

set -ex

: "${CERTBOT_EMAIL:?}"
: "${CERTBOT_DOMAIN:?}"

# The Compliance Service complains when the root is 'DST Root CA X3'
# (what appears to be the default) instead of 'ISRG Root X1'

docker run -it --rm \
    -p 80:80 \
    -v "$(pwd)/letsencrypt:/etc/letsencrypt" \
    certbot/certbot \
    --preferred-chain="ISRG Root X1" \
    certonly --standalone -n --agree-tos --email ${CERTBOT_EMAIL} -d ${CERTBOT_DOMAIN}

CERT=$(sudo cat ./letsencrypt/live/${CERTBOT_DOMAIN}/cert.pem)
PRIVKEY=$(sudo cat ./letsencrypt/live/${CERTBOT_DOMAIN}/privkey.pem)
FULLCHAIN=$(sudo cat ./letsencrypt/live/${CERTBOT_DOMAIN}/fullchain.pem)

mkdir -p ./certs/
echo $"${CERT}" >./certs/cert.pem
echo $"${PRIVKEY}" >./certs/privkey.pem
echo $"${FULLCHAIN}" >./certs/fullchain.pem
