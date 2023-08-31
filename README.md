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

* `CERTBOT_DOMAIN`: The domain name of your server for which you want to generate the Let's Encrypt certificate.
* `CERTBOT_EMAIL`: The email of the owner of the domain name.

Then, install the dependencies and request the certificates with the following commands:

```console
$ npm install
$ sudo task get-certs
```

This will generate the certificates and store them in the `certs` folder. You can now build the Verifiable Credentials of your _Participant_ and  _Legal Registration Number_ and submit the resulting Verifiable Presentation to the Compliance API:

```console
$ task request-compliance

[...]

Building Participant Verifiable Credential...
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/jws-2020/v1",
    "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
  ],
  "type": [
    "VerifiableCredential"
  ],
  "id": "https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com",
  "issuer": "did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com",
  "issuanceDate": "2023-08-29T09:46:12.529Z",
  "credentialSubject": {
    "type": "gx:LegalParticipant",
    "gx:legalName": "CTIC Technology Centre",
    "gx:legalRegistrationNumber": {
      "id": "https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com#lrn"
    },
    "gx:headquarterAddress": {
      "gx:countrySubdivisionCode": "ES-AS"
    },
    "gx:legalAddress": {
      "gx:countrySubdivisionCode": "ES-AS"
    },
    "gx-terms-and-conditions:gaiaxTermsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700",
    "id": "https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com"
  },
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-08-29T09:46:13.444Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com#JWK2020",
    "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..XS7YtcnNCxsoW2B6iFsd_PuIdOyQEzVn4uq7-I6Jb6AKOa2zchEteRPhaUEKcVHiAkCUd5ZbzYQu1kAQgX3HJ06HjQVad9MIec0fGvBq19-2_aM9TQEf4ohX8AVdEaxm8SRm4gBEr25kU2OYb49fpaFzNZqcDUPHqc2NonxjRkU9gdTAFQEuOMe7Wk202cPd9kypHB3Jw_Fma5SN_gJ7ekyBgPhuombsNWjFxN7wNe6sNlU_ZmZAK0XkQrR-b4BtPH8hGjCdtjzJXONIYp_oaCn6_ugQFDEuEn0-RYTlbOJJmYkFG6oE6JbPM0-nap4INJv0rKuWGIDvKc679pNOmg"
  }
}
Building Legal Registration Number Verifiable Credential...
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/jws-2020/v1"
  ],
  "type": "VerifiableCredential",
  "id": "https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com#lrn",
  "issuer": "did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com",
  "issuanceDate": "2023-08-29T09:46:13.450Z",
  "credentialSubject": {
    "id": "https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com#lrn",
    "@context": "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#",
    "type": "gx:legalRegistrationNumber",
    "gx:vatID": "ESX1234567X",
    "gx:vatID-countryCode": "ES"
  },
  "evidence": [
    {
      "gx:evidenceURL": "http://ec.europa.eu/taxation_customs/vies/services/checkVatService",
      "gx:executionDate": "2023-07-12T09:05:00.819Z",
      "gx:evidenceOf": "gx:vatID"
    }
  ],
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-08-29T09:46:14.100Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com#JWK2020",
    "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..GtXh_Zb1DQhYqxdy16dM2EFv67dOVIlb9YH5eEJj2-bxNa_hnCC-avIHFtcvpliJh1PtSyTxkvxqp3so63tScE3fs3yxAF5sYGINblaT9-rMmJeGW34FKQ0s9usUo7-aCkbB1NR98bjyE6_CXprnLmGHthmmT76SpZMLgfF_ezj1hZmZAKKzIB0ZZuXKaPMEn5bI6WzeByr9nR1EDD5KVfNrPhsKbBf8kzmIs5dxvWYe0pwnmxWIe85K8sY2m4aOoGNm0ifnE11JODAxyfVqy3Aook1lBx0WBElffwdWofKFV23qhinKTOiNNI0GO1lHdJlohPMOoDgRtz2le5K50g"
  }
}
Sending Verifiable Presentation to Compliance API...
POST https://compliance.lab.gaia-x.eu/main/api/credential-offers
✅ Compliance success
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/jws-2020/v1",
    "https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#"
  ],
  "type": [
    "VerifiableCredential"
  ],
  "id": "https://compliance.lab.gaia-x.eu/main/credential-offers/7dd2cb68-b8ca-4a6c-8de3-c824b67db00e",
  "issuer": "did:web:compliance.lab.gaia-x.eu:main",
  "issuanceDate": "2023-08-29T09:46:17.948Z",
  "expirationDate": "2023-11-27T09:46:17.948Z",
  "credentialSubject": [
    {
      "type": "gx:compliance",
      "id": "https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com",
      "gx:integrity": "sha256-cce025e1fdeb249c3faa9a898d14d4dc6e3c7095a1409ed7edac62e5a20bd9bb",
      "gx:version": "22.10"
    },
    {
      "type": "gx:compliance",
      "id": "https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com#lrn",
      "gx:integrity": "sha256-e62cf6a91e0398c07f893d98621905975a941a3518a25b740a8a0a5de3aad3fa",
      "gx:version": "22.10"
    }
  ],
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2023-08-29T09:46:18.326Z",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Jp4JGeohl977ovc9wGlZatYCWsatUQS3Bma_SnE_Q20fz-k1w7Hpiar2EEiZouI8e1Ibsq-BQDWwWe3xK08GfjATZa81USJW9hILbGW6eXv-hNtvd5hjCbmkrvud_aCdfexGbY-M14p5v1bJ6uaI4h52U0KDVKUlOTukEZFgwEZ_hxInhnAqWak8tI1Mm1vhS6B3hkEOmmcP816JVQddsUnEltAoLEEFtrO2MkdXdstGLTo3aNMuug8lE2ijwzCxh25Gnbg1HP8HVGYQqzDrQOr4P26gWXn5GFYdDIM7D2QnRhi6dpTNdeb8wNfhohQUBgbkDIlnfBs4XNmPnVViFA",
    "verificationMethod": "did:web:compliance.lab.gaia-x.eu:main#X509-JWK2020"
  }
}
```

## References

| Reference | Description |
| --- | --- |
| [Gaia-X Lab Registry API](https://registry.lab.gaia-x.eu/main/docs) | A public deployment of the [Gaia-X Registry of Trust Anchors](https://gitlab.com/gaia-x/lab/compliance/gx-registry) that can be used for development purposes. |
| [Gaia-X Lab Compliance API](https://compliance.lab.gaia-x.eu/main/docs/) | A public deployment of the [Gaia-X Compliance Service](https://gitlab.com/gaia-x/lab/compliance/gx-compliance) that can be used for development purposes. |
| [Gaia-X GitLab](https://gitlab.com/gaia-x) | A GitLab organization that contains the repositories for the software implementations and documentation materials of Gaia-X. | 1
| [Gaia-X Wizard](https://wizard.lab.gaia-x.eu/) | A user-friendly web application for creating Gaia-X credentials (i.e., self-descriptions). This is invaluable for educational purposes and for gaining insight into the concepts of Gaia-X. |
| [Gaia-X Glossary](https://gaia-x.gitlab.io/glossary/) | A comprehensive list of Gaia-X terms. |
| [Gaia-X Digital Clearing House](https://gaia-x.eu/gxdch/) | A closer look at the services required to achieve Gaia-X compliance. |
| [Gaia-X Trust Framework](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/) | Detailed documentation of the minimal set of rules to be part of Gaia-X Ecosystem. |
| [Simplified Gaia-X credentials usage flow](https://gitlab.com/gaia-x/lab/compliance/gx-compliance/-/blob/02928741c7071de30c9c9295599e1caad760c47a/README-api.md) | A diagram that shows how the Notary, Compliance Service and Registry fit together in the process of building and signing Gaia-X credentials (i.e., self-descriptions). |
