#!/usr/bin/env bash

set -ex

: ${WEBSERVER_CONTAINER_NAME:="sd-signer-web"}
: ${WEBSERVER_SLEEP:="5"}

CURR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

docker run -d \
    -p 443:443 \
    --name ${WEBSERVER_CONTAINER_NAME} \
    -v ${CURR_DIR}/ssl.conf:/etc/nginx/conf.d/ssl.conf \
    -v ${CURR_DIR}/certs/privkey.pem:/etc/nginx/certs/key.pem \
    -v ${CURR_DIR}/certs/fullchain.pem:/etc/nginx/certs/cert.pem \
    -v ${CURR_DIR}/certs/fullchain.pem:/usr/share/nginx/html/.well-known/x509CertificateChain.pem \
    nginx:1.23

sleep ${WEBSERVER_SLEEP}

SDSIGNER_DIR=${CURR_DIR}/self-description-signer

rm -fr ${SDSIGNER_DIR}/output/*
cp ${CURR_DIR}/self-description.json ${SDSIGNER_DIR}/config/self-description.json

docker run --rm -it \
    -v ${SDSIGNER_DIR}/config:/usr/src/app/config \
    -v ${SDSIGNER_DIR}/output:/usr/src/app/output \
    self-description-signer

docker stop ${WEBSERVER_CONTAINER_NAME} && docker rm ${WEBSERVER_CONTAINER_NAME}

DID_FILE=$(ls ${SDSIGNER_DIR}/output/*_did.json)

docker run -d \
    -p 443:443 \
    --name ${WEBSERVER_CONTAINER_NAME} \
    -v ${CURR_DIR}/ssl.conf:/etc/nginx/conf.d/ssl.conf \
    -v ${CURR_DIR}/certs/privkey.pem:/etc/nginx/certs/key.pem \
    -v ${CURR_DIR}/certs/fullchain.pem:/etc/nginx/certs/cert.pem \
    -v ${CURR_DIR}/certs/fullchain.pem:/usr/share/nginx/html/.well-known/x509CertificateChain.pem \
    -v ${DID_FILE}:/usr/share/nginx/html/.well-known/did.json \
    nginx:1.23

sleep ${WEBSERVER_SLEEP}

docker run --rm -it \
    -v ${SDSIGNER_DIR}/config:/usr/src/app/config \
    -v ${SDSIGNER_DIR}/output:/usr/src/app/output \
    self-description-signer

docker stop ${WEBSERVER_CONTAINER_NAME} && docker rm ${WEBSERVER_CONTAINER_NAME}
