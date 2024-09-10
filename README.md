# Gaia-X Self-Descriptions

A simple proof of concept of the process to build and sign a Self-Description using the [Gaia-X Compliance Service](https://gitlab.com/gaia-x/lab/compliance/gx-compliance).

The main contribution of this repository is demonstrating how to programmatically build [Gaia-X Self-Description](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/gaia-x_trust_framework/#gaia-x-self-description) documents, which are then validated by the [public test instance of the Gaia-X Compliance Service](https://compliance.lab.gaia-x.eu/main/docs/). We leverage the fact that Let’s Encrypt is able to issue free certificates signed by a [valid Trust Anchor](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/trust_anchors/#list-of-defined-trust-anchors), ensuring compliance without incurring extra costs.

## Prerequisites

* A Linux server with _sudo_ access that has ports 80 and 443 exposed to the Internet.
* A public DNS domain that points to the IP address of the previous Linux server.
* Docker.
* [Node 18+](https://nodejs.org/en/download/package-manager).
* [Taskfile](https://taskfile.dev/installation/).

## Usage

First you need to update the configuration to match your environment. Copy the file `.env.default` to `.env` and, at least, update the following variables:

| Variable | Description |
| --- | --- |
| `CERTBOT_DOMAIN` | The domain name of your server for which you want to generate the Let's Encrypt certificate. |
| `CERTBOT_EMAIL` | The email of the owner of the domain name. |
| `RESOURCE_OPENAPI_SPEC` | This variable should point to an OpenAPI schema that describes the HTTP API that you want to model as a [Gaia-X Resource](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/resource_and_subclasses/#virtual-resource). |

Then, install the dependencies and request the certificates with the following commands:

```console
$ npm install
$ sudo task get-certs
```

This will generate the certificates and store them in the `certs` folder. You can now build your Verifiable Credentials and submit the resulting Verifiable Presentation to the Compliance API:

```console
$ task build-credentials
```

The output should be something similar to the following:

<details>
<summary>Show example log</summary>
  
```console
$ LOG_LEVEL=debug task build-credentials
task: [build-did] mkdir -p /home/user/gaiax-self-description-poc/htdocs/.well-known
task: [build-did] npm run build-did

> gaiax-self-description-poc@1.0.0 build-did
> node ./src/index.js did

task: [build-did] cp /home/user/gaiax-self-description-poc/certs/fullchain.pem /home/user/gaiax-self-description-poc/htdocs/.well-known/${FILENAME_X5U}
task: [build-did] wget https://letsencrypt.org/certs/isrgrootx1.pem -O /home/user/gaiax-self-description-poc/certs/isrgrootx1.pem
--2023-09-15 12:15:52--  https://letsencrypt.org/certs/isrgrootx1.pem
Resolving letsencrypt.org (letsencrypt.org)... 3.70.101.28, 18.192.231.252, 2a05:d014:275:cb02::c8, ...
Connecting to letsencrypt.org (letsencrypt.org)|3.70.101.28|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1939 (1.9K) [application/x-pem-file]
Saving to: '/home/user/gaiax-self-description-poc/certs/isrgrootx1.pem'

/home/user/gaiax-self-description-poc/certs/isrgrootx1 100%[======================================================================================================================================>]   1.89K  --.-KB/s    in 0s

2023-09-15 12:15:52 (9.49 MB/s) - '/home/user/gaiax-self-description-poc/certs/isrgrootx1.pem' saved [1939/1939]

task: [build-did] cat /home/user/gaiax-self-description-poc/certs/isrgrootx1.pem >> /home/user/gaiax-self-description-poc/htdocs/.well-known/${FILENAME_X5U}
task: [start-webserver] docker stop gaiax_nginx
gaiax_nginx
task: [start-webserver] docker rm -f gaiax_nginx
gaiax_nginx
task: [start-webserver] docker run -d -p 443:443  --restart unless-stopped  --name gaiax_nginx  -v /home/user/gaiax-self-description-poc/ssl.conf:/etc/nginx/conf.d/ssl.conf  -v /home/user/gaiax-self-description-poc/certs/privkey.pem:/etc/nginx/certs/key.pem  -v /home/user/gaiax-self-description-poc/certs/fullchain.pem:/etc/nginx/certs/cert.pem  -v /home/user/gaiax-self-description-poc/htdocs:/usr/share/nginx/html/  nginx:1.23

5b6bb705a0b3e9871e2c32f37f616dab44f7829c59cee3597894a91e73ffcf27
task: [build-credentials] npm run build-credentials

> gaiax-self-description-poc@1.0.0 build-credentials
> node ./src/index.js credentials

[12:15:54.469] INFO (19161): Building Participant Verifiable Credential
[12:15:55.581] DEBUG (19161):
    @context: [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
      "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
    ]
    type: [
      "VerifiableCredential"
    ]
    id: "https://dev.cticpoc.com/.well-known/participant.json"
    issuer: "did:web:dev.cticpoc.com"
    issuanceDate: "2023-09-15T12:15:54.478Z"
    credentialSubject: {
      "type": "gx:LegalParticipant",
      "gx:legalName": "CTIC Technology Centre",
      "gx:legalRegistrationNumber": {
        "id": "https://dev.cticpoc.com/.well-known/lrn.json"
      },
      "gx:headquarterAddress": {
        "gx:countrySubdivisionCode": "ES-AS"
      },
      "gx:legalAddress": {
        "gx:countrySubdivisionCode": "ES-AS"
      },
      "gx-terms-and-conditions:gaiaxTermsAndConditions": "https://dev.cticpoc.com/.well-known/tsandcs.json",
      "id": "https://dev.cticpoc.com/.well-known/participant.json"
    }
    proof: {
      "type": "JsonWebSignature2020",
      "created": "2023-09-15T12:15:55.562Z",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "did:web:dev.cticpoc.com#JWK2020",
      "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..ZhEN08JZL6g26wYRVvqB29HW3YZLnvPAwzqXrtr5P9lfWeFTcA76_LdOIOC7jiJFbe29oXzC3VkrlG70Y6o691UQVpjhTrrkPn1731MnmV-266-vtHuiSD3IJQyqeDhKAZIjDVpjtLVwtOen13sDdO-kK3uZU2KDp-9uda9ODyfkjlebHfHJcO-MOqhkESQjLV-tn3pT8MT50X8tXxqjG7ElncbosE8ECdxZwauOZB4i_oBC3kAbV8Y6mmYg0o6yIcmM-1NVXD7inACJTVsPiTkYfvvb4-12MQsaxyiWw5kxj6n8pQ_sMGH9x4AcNYTwHQVNsyh2xmPGktB6iEuyAw"
    }
[12:15:55.581] INFO (19161): Building Legal Registration Number Verifiable Credential
[12:15:56.424] DEBUG (19161):
    @context: [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1"
    ]
    type: "VerifiableCredential"
    id: "https://dev.cticpoc.com/.well-known/lrn.json"
    issuer: "did:web:dev.cticpoc.com"
    issuanceDate: "2023-09-15T12:15:55.584Z"
    credentialSubject: {
      "id": "https://dev.cticpoc.com/.well-known/lrn.json",
      "@context": "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
      "type": "gx:legalRegistrationNumber",
      "gx:vatID": "ESX1234567X",
      "gx:vatID-countryCode": "ES"
    }
    proof: {
      "type": "JsonWebSignature2020",
      "created": "2023-09-15T12:15:56.415Z",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "did:web:dev.cticpoc.com#JWK2020",
      "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..qywhYCE6vn_PtoQxGML-z8Wjfd6HSn-UUsVYLVCaA55Cq0gwVYij0pdPdvgf5H-5mCkPKUD85C9oxLT1izj_oEAd_zIc-RxrOcLTyBy6fIIv1fMZBU1p3MqURV4-uehnm3IcD19TqiX5oNCJflo2PQ0bMmFq034ts2S2sBumJ3jyIlq38GuRBUyFfCxIMbKPYctn0HYl2FXFf9GJrhxorVrKDN_DwTYJj6LbTj7-SwVQTCPX12TFSIuMKaNZliu3H3TM_1XXC7zkXWTrvQ0_VFRDRdwRXDdPE0-afeQ16wgg1Vgo05S0lrKCVDwjedu1VVMOAVUgwWf4FF2P9jlePQ"
    }
[12:15:56.425] INFO (19161): Building Terms and Conditions Verifiable Credential
[12:15:57.253] DEBUG (19161):
    @context: [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
      "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
    ]
    type: "VerifiableCredential"
    id: "https://dev.cticpoc.com/.well-known/tsandcs.json"
    issuer: "did:web:dev.cticpoc.com"
    issuanceDate: "2023-09-15T12:15:56.427Z"
    credentialSubject: {
      "@context": "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
      "type": "gx:GaiaXTermsAndConditions",
      "id": "https://dev.cticpoc.com/.well-known/tsandcs.json",
      "gx:termsAndConditions": "The PARTICIPANT signing the Self-Description agrees as follows:\n- to update its descriptions about any changes, be it technical, organizational, or legal - especially but not limited to contractual in regards to the indicated attributes present in the descriptions.\n\nThe keypair used to sign Verifiable Credentials will be revoked where Gaia-X Association becomes aware of any inaccurate statements in regards to the claims which result in a non-compliance with the Trust Framework and policy rules defined in the Policy Rules and Labelling Document (PRLD)."
    }
    proof: {
      "type": "JsonWebSignature2020",
      "created": "2023-09-15T12:15:57.245Z",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "did:web:dev.cticpoc.com#JWK2020",
      "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..F9fBGoHiJ-40h9tFFP-ayozGMcKYdj72pAcKcjhS3zu9qbZG1vPBRzxowK1L3pzMxRZ2lda7u6pKpmISIVYHnhBYfj8cbybf-F2JpwOxQxvT_oMteUShEa0SFrmTEpIVBUA5cEwUMB2p4F_cSedRQcJHDdp_QdnPzL1aNr2b84RRrKF50_Z1fC8caTm7iL2jL9-4RA-FazHeLkzemt4bQyoC6bQtEtWX39225gSb-LYoWhkli6NNQnz1Yk1qz7FJt5Cq9emPa9B6FJE6QFphsbVUCs474In_-LW13yVusU9G7AU830r-P8-pI0nwRlqnI8-D8RfR1Nb2cW36JUUS2w"
    }
[12:15:57.253] INFO (19161): Building Service Offering Verifiable Credential
[12:15:58.128] DEBUG (19161):
    @context: [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
      "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
    ]
    type: "VerifiableCredential"
    id: "https://dev.cticpoc.com/.well-known/serviceoffering.json"
    issuer: "did:web:dev.cticpoc.com"
    issuanceDate: "2023-09-15T12:15:57.270Z"
    credentialSubject: {
      "id": "https://dev.cticpoc.com/.well-known/serviceoffering.json",
      "type": "gx:ServiceOffering",
      "gx:providedBy": {
        "id": "https://dev.cticpoc.com/.well-known/participant.json"
      },
      "gx:policy": "",
      "gx:termsAndConditions": {
        "gx:URL": "https://dev.cticpoc.com/.well-known/tsandcs.json",
        "gx:hash": "b04e3496b6103bab2100478d3d313fe60579befabc6d077e4afa149f8fe310e4"
      },
      "gx:dataAccountExport": {
        "gx:requestType": "API",
        "gx:accessType": "digital",
        "gx:formatType": "application/json"
      }
    }
    proof: {
      "type": "JsonWebSignature2020",
      "created": "2023-09-15T12:15:58.104Z",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "did:web:dev.cticpoc.com#JWK2020",
      "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..OXNYWXrkiBLA3TGSj-6oC41ky-Nc1AkxAsxLZsnCT1QUXdQ3Vel8h2nshHDd7qPhyMl_0pOafcpcHryjiVOU1g0eTYKLsQy2ApcenB3dOsSW0kx7Fu4_tWPuW264q-i2oj2zBsiwoZClwSkoIuud9-5TIBbgIs932dcIShU49vpv_TeRROYZs7oW5tx4QSMCUgO6196GRNrukenksFtLrDsG3FCVynPM8xAc8pwK2-cPNXqsK4b21hNkoMpgGApCMiX_iglvYSl-QZYBj3yukHBNxGNfXo7ohOBuw894-rTT1E-A1o1XoflGeXNqrzyTKgTTgoEXWcGkVrcttGkSPg"
    }
[12:15:58.129] INFO (19161): Sending Verifiable Presentation to Compliance API
[12:15:58.129] INFO (19161): POST -> https://compliance.lab.gaia-x.eu/main/api/credential-offers
[12:15:58.129] DEBUG (19161):
    @context: "https://www.w3.org/2018/credentials/v1"
    type: "VerifiablePresentation"
    verifiableCredential: [
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://w3id.org/security/suites/jws-2020/v1",
          "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
        ],
        "type": [
          "VerifiableCredential"
        ],
        "id": "https://dev.cticpoc.com/.well-known/participant.json",
        "issuer": "did:web:dev.cticpoc.com",
        "issuanceDate": "2023-09-15T12:15:54.478Z",
        "credentialSubject": {
          "type": "gx:LegalParticipant",
          "gx:legalName": "CTIC Technology Centre",
          "gx:legalRegistrationNumber": {
            "id": "https://dev.cticpoc.com/.well-known/lrn.json"
          },
          "gx:headquarterAddress": {
            "gx:countrySubdivisionCode": "ES-AS"
          },
          "gx:legalAddress": {
            "gx:countrySubdivisionCode": "ES-AS"
          },
          "gx-terms-and-conditions:gaiaxTermsAndConditions": "https://dev.cticpoc.com/.well-known/tsandcs.json",
          "id": "https://dev.cticpoc.com/.well-known/participant.json"
        },
        "proof": {
          "type": "JsonWebSignature2020",
          "created": "2023-09-15T12:15:55.562Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:dev.cticpoc.com#JWK2020",
          "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..ZhEN08JZL6g26wYRVvqB29HW3YZLnvPAwzqXrtr5P9lfWeFTcA76_LdOIOC7jiJFbe29oXzC3VkrlG70Y6o691UQVpjhTrrkPn1731MnmV-266-vtHuiSD3IJQyqeDhKAZIjDVpjtLVwtOen13sDdO-kK3uZU2KDp-9uda9ODyfkjlebHfHJcO-MOqhkESQjLV-tn3pT8MT50X8tXxqjG7ElncbosE8ECdxZwauOZB4i_oBC3kAbV8Y6mmYg0o6yIcmM-1NVXD7inACJTVsPiTkYfvvb4-12MQsaxyiWw5kxj6n8pQ_sMGH9x4AcNYTwHQVNsyh2xmPGktB6iEuyAw"
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://w3id.org/security/suites/jws-2020/v1"
        ],
        "type": "VerifiableCredential",
        "id": "https://dev.cticpoc.com/.well-known/lrn.json",
        "issuer": "did:web:dev.cticpoc.com",
        "issuanceDate": "2023-09-15T12:15:55.584Z",
        "credentialSubject": {
          "id": "https://dev.cticpoc.com/.well-known/lrn.json",
          "@context": "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
          "type": "gx:legalRegistrationNumber",
          "gx:vatID": "ESX1234567X",
          "gx:vatID-countryCode": "ES"
        },
        "proof": {
          "type": "JsonWebSignature2020",
          "created": "2023-09-15T12:15:56.415Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:dev.cticpoc.com#JWK2020",
          "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..qywhYCE6vn_PtoQxGML-z8Wjfd6HSn-UUsVYLVCaA55Cq0gwVYij0pdPdvgf5H-5mCkPKUD85C9oxLT1izj_oEAd_zIc-RxrOcLTyBy6fIIv1fMZBU1p3MqURV4-uehnm3IcD19TqiX5oNCJflo2PQ0bMmFq034ts2S2sBumJ3jyIlq38GuRBUyFfCxIMbKPYctn0HYl2FXFf9GJrhxorVrKDN_DwTYJj6LbTj7-SwVQTCPX12TFSIuMKaNZliu3H3TM_1XXC7zkXWTrvQ0_VFRDRdwRXDdPE0-afeQ16wgg1Vgo05S0lrKCVDwjedu1VVMOAVUgwWf4FF2P9jlePQ"
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://w3id.org/security/suites/jws-2020/v1",
          "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
        ],
        "type": "VerifiableCredential",
        "id": "https://dev.cticpoc.com/.well-known/tsandcs.json",
        "issuer": "did:web:dev.cticpoc.com",
        "issuanceDate": "2023-09-15T12:15:56.427Z",
        "credentialSubject": {
          "@context": "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
          "type": "gx:GaiaXTermsAndConditions",
          "id": "https://dev.cticpoc.com/.well-known/tsandcs.json",
          "gx:termsAndConditions": "The PARTICIPANT signing the Self-Description agrees as follows:\n- to update its descriptions about any changes, be it technical, organizational, or legal - especially but not limited to contractual in regards to the indicated attributes present in the descriptions.\n\nThe keypair used to sign Verifiable Credentials will be revoked where Gaia-X Association becomes aware of any inaccurate statements in regards to the claims which result in a non-compliance with the Trust Framework and policy rules defined in the Policy Rules and Labelling Document (PRLD)."
        },
        "proof": {
          "type": "JsonWebSignature2020",
          "created": "2023-09-15T12:15:57.245Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:dev.cticpoc.com#JWK2020",
          "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..F9fBGoHiJ-40h9tFFP-ayozGMcKYdj72pAcKcjhS3zu9qbZG1vPBRzxowK1L3pzMxRZ2lda7u6pKpmISIVYHnhBYfj8cbybf-F2JpwOxQxvT_oMteUShEa0SFrmTEpIVBUA5cEwUMB2p4F_cSedRQcJHDdp_QdnPzL1aNr2b84RRrKF50_Z1fC8caTm7iL2jL9-4RA-FazHeLkzemt4bQyoC6bQtEtWX39225gSb-LYoWhkli6NNQnz1Yk1qz7FJt5Cq9emPa9B6FJE6QFphsbVUCs474In_-LW13yVusU9G7AU830r-P8-pI0nwRlqnI8-D8RfR1Nb2cW36JUUS2w"
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://w3id.org/security/suites/jws-2020/v1",
          "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
        ],
        "type": "VerifiableCredential",
        "id": "https://dev.cticpoc.com/.well-known/serviceoffering.json",
        "issuer": "did:web:dev.cticpoc.com",
        "issuanceDate": "2023-09-15T12:15:57.270Z",
        "credentialSubject": {
          "id": "https://dev.cticpoc.com/.well-known/serviceoffering.json",
          "type": "gx:ServiceOffering",
          "gx:providedBy": {
            "id": "https://dev.cticpoc.com/.well-known/participant.json"
          },
          "gx:policy": "",
          "gx:termsAndConditions": {
            "gx:URL": "https://dev.cticpoc.com/.well-known/tsandcs.json",
            "gx:hash": "b04e3496b6103bab2100478d3d313fe60579befabc6d077e4afa149f8fe310e4"
          },
          "gx:dataAccountExport": {
            "gx:requestType": "API",
            "gx:accessType": "digital",
            "gx:formatType": "application/json"
          }
        },
        "proof": {
          "type": "JsonWebSignature2020",
          "created": "2023-09-15T12:15:58.104Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": "did:web:dev.cticpoc.com#JWK2020",
          "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..OXNYWXrkiBLA3TGSj-6oC41ky-Nc1AkxAsxLZsnCT1QUXdQ3Vel8h2nshHDd7qPhyMl_0pOafcpcHryjiVOU1g0eTYKLsQy2ApcenB3dOsSW0kx7Fu4_tWPuW264q-i2oj2zBsiwoZClwSkoIuud9-5TIBbgIs932dcIShU49vpv_TeRROYZs7oW5tx4QSMCUgO6196GRNrukenksFtLrDsG3FCVynPM8xAc8pwK2-cPNXqsK4b21hNkoMpgGApCMiX_iglvYSl-QZYBj3yukHBNxGNfXo7ohOBuw894-rTT1E-A1o1XoflGeXNqrzyTKgTTgoEXWcGkVrcttGkSPg"
        }
      }
    ]
[12:16:00.712] INFO (19161): ✅ Compliance success
[12:16:00.712] DEBUG (19161):
    @context: [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
      "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
    ]
    type: [
      "VerifiableCredential"
    ]
    id: "https://compliance.lab.gaia-x.eu/main/credential-offers/0840d210-41d5-44cf-80b3-2931e91e7016"
    issuer: "did:web:compliance.lab.gaia-x.eu:main"
    issuanceDate: "2023-09-15T12:16:00.671Z"
    expirationDate: "2023-12-14T12:16:00.671Z"
    credentialSubject: [
      {
        "type": "gx:compliance",
        "id": "https://dev.cticpoc.com/.well-known/participant.json",
        "gx:integrity": "sha256-24f6e962aeee9cf784b056a33b8a17be27a0d1d132f7d135c9113aca0d2b43af",
        "gx:integrityNormalization": "RFC8785:JCS",
        "gx:version": "22.10",
        "gx:type": "gx:LegalParticipant"
      },
      {
        "type": "gx:compliance",
        "id": "https://dev.cticpoc.com/.well-known/lrn.json",
        "gx:integrity": "sha256-2a10b8ff79a8a588ec22ebdb757143e39d3a720c0b028f37f58ae7f5691921c4",
        "gx:integrityNormalization": "RFC8785:JCS",
        "gx:version": "22.10",
        "gx:type": "gx:legalRegistrationNumber"
      },
      {
        "type": "gx:compliance",
        "id": "https://dev.cticpoc.com/.well-known/tsandcs.json",
        "gx:integrity": "sha256-e27f92dde5ff8c44b81c29409ddd078008da1776775c97d39a5b59894a07d60e",
        "gx:integrityNormalization": "RFC8785:JCS",
        "gx:version": "22.10",
        "gx:type": "gx:GaiaXTermsAndConditions"
      },
      {
        "type": "gx:compliance",
        "id": "https://dev.cticpoc.com/.well-known/serviceoffering.json",
        "gx:integrity": "sha256-0884dad8149d6e93acfa2fa2395070854baac2c3c3dba45446d299b968488396",
        "gx:integrityNormalization": "RFC8785:JCS",
        "gx:version": "22.10",
        "gx:type": "gx:ServiceOffering"
      }
    ]
    proof: {
      "type": "JsonWebSignature2020",
      "created": "2023-09-15T12:16:00.683Z",
      "proofPurpose": "assertionMethod",
      "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..gkyw7P_ApFvlOJMQP3c3hKpRynI-j-koDfl36DnaoPSkeLbX7Qo-vvW7DFiQaUkb-5lls0Ge93fCkvLmrW3MaCuBgCa-SDv3a69Zm_dnO-Q665hBTec3oUzs9_WRS075-dgKdHNzPuFn_IucSDdGKqWI5k59z2jgXIZ9VCOYY72UofM11k1uoAkqg-W_KvFRvZmDEe6dIpUOahpxvZr3QpNPVQVv9kc_3mQlLyg62M6YqNOvEdUxjLEiqXEoXc4VArB6Tkki9KPeSCC2UTzVyhx9XumuSQG20dfkVr0CvFyocsXVApZq6VQEgVCvLbftV1Qklm-ZPucaNvwk9VKERg",
      "verificationMethod": "did:web:compliance.lab.gaia-x.eu:main#X509-JWK2020"
    }
[12:16:00.712] INFO (19161): Writing resulting Verifiable Presentation to /home/user/gaiax-self-description-poc/htdocs/.well-known/vp.json
```
</details>

## References

| Reference | Description |
| --- | --- |
| [Gaia-X GitLab](https://gitlab.com/gaia-x) | A GitLab organization that contains the repositories for the software implementations and documentation materials of Gaia-X. | 1
| [Gaia-X Glossary](https://gaia-x.gitlab.io/glossary/) | A comprehensive list of Gaia-X terms. |
| [Gaia-X Digital Clearing House](https://gaia-x.eu/gxdch/) | A closer look at the services required to achieve Gaia-X compliance. |
| [Gaia-X Digital Clearing House Status](https://docs.gaia-x.eu/framework/) | Public instances of the Gaia-X Digital Clearing House, including availability and status metrics. |
| [Gaia-X Trust Framework](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/) | Detailed documentation of the minimal set of rules to be part of Gaia-X Ecosystem. |
| [Simplified Gaia-X credentials usage flow](https://gitlab.com/gaia-x/lab/compliance/gx-compliance/-/blob/02928741c7071de30c9c9295599e1caad760c47a/README-api.md) | A diagram that shows how the Notary, Compliance Service and Registry fit together in the process of building and signing Gaia-X credentials (i.e., self-descriptions). |
| [deltaDAO/self-description-signer](https://github.com/deltaDAO/self-description-signer) | The original repository that served as an inspiration and reference for this proof of concept. |
