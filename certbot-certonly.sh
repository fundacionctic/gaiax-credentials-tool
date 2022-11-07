#!/usr/bin/env bash

set -ex

: "${PUBLIC_CERTBOT_PORT:?}"

docker run -it --rm \
    -p ${PUBLIC_CERTBOT_PORT}:80 \
    -v "$(pwd)/letsencrypt:/etc/letsencrypt" \
    certbot/certbot certonly --standalone
