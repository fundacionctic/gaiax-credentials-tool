#!/usr/bin/env bash

set -ex

: "${DELTA_DAO_SDSIGNER_COMMIT:?}"

git clone https://github.com/deltaDAO/self-description-signer.git self-description-signer
cd self-description-signer
git checkout ${DELTA_DAO_SDSIGNER_COMMIT}