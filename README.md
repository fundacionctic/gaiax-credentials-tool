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
```

The output should be something similar to the following:

<details>
<summary>Show example log</summary>
  
```console
task: [build-did] mkdir -p /home/agmangas/gaiax-self-description-poc/htdocs/.well-known
task: [build-did] npm run build-did

> gaiax-self-description-poc@1.0.0 build-did
> node index.js did

task: [build-did] cp /home/agmangas/gaiax-self-description-poc/certs/fullchain.pem /home/agmangas/gaiax-self-description-poc/htdocs/.well-known/x5u.pem
task: [build-did] wget https://letsencrypt.org/certs/isrgrootx1.pem -O /home/agmangas/gaiax-self-description-poc/certs/isrgrootx1.pem
--2023-09-05 07:09:01--  https://letsencrypt.org/certs/isrgrootx1.pem
Resolving letsencrypt.org (letsencrypt.org)... 35.156.224.161, 3.70.101.28, 2a05:d014:275:cb01::c8, ...
Connecting to letsencrypt.org (letsencrypt.org)|35.156.224.161|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1939 (1.9K) [application/x-pem-file]
Saving to: '/home/agmangas/gaiax-self-description-poc/certs/isrgrootx1.pem'

/home/agmangas/gaiax-self-description-poc/certs/isrg 100%[====================================================================================================================>]   1.89K  --.-KB/s    in 0s

2023-09-05 07:09:01 (21.0 MB/s) - '/home/agmangas/gaiax-self-description-poc/certs/isrgrootx1.pem' saved [1939/1939]

task: [build-did] cat /home/agmangas/gaiax-self-description-poc/certs/isrgrootx1.pem >> /home/agmangas/gaiax-self-description-poc/htdocs/.well-known/x5u.pem
task: [start-webserver] docker stop gaiax_nginx
gaiax_nginx
task: [start-webserver] docker rm -f gaiax_nginx
gaiax_nginx
task: [start-webserver] docker run -d -p 443:443  --restart unless-stopped  --name gaiax_nginx  -v /home/agmangas/gaiax-self-description-poc/ssl.conf:/etc/nginx/conf.d/ssl.conf  -v /home/agmangas/gaiax-self-description-poc/certs/privkey.pem:/etc/nginx/certs/key.pem  -v /home/agmangas/gaiax-self-description-poc/certs/fullchain.pem:/etc/nginx/certs/cert.pem  -v /home/agmangas/gaiax-self-description-poc/htdocs:/usr/share/nginx/html/  nginx:1.23

dce3b3971bf505a933ff2b6a265a57fa63b9484576d2cd3e8989a70b10a86e93
task: [request-compliance] npm run validate-compliance

> gaiax-self-description-poc@1.0.0 validate-compliance
> node index.js validate

Building Participant Verifiable Credential
{
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/jws-2020/v1',
    'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#'
  ],
  type: [ 'VerifiableCredential' ],
  id: 'https://gaiax.cticpoc.com/.well-known/participant.json',
  issuer: 'did:web:gaiax.cticpoc.com',
  issuanceDate: '2023-09-05T07:09:02.699Z',
  credentialSubject: {
    type: 'gx:LegalParticipant',
    'gx:legalName': 'CTIC Technology Centre',
    'gx:legalRegistrationNumber': { id: 'https://gaiax.cticpoc.com/.well-known/lrn.json' },
    'gx:headquarterAddress': { 'gx:countrySubdivisionCode': 'ES-AS' },
    'gx:legalAddress': { 'gx:countrySubdivisionCode': 'ES-AS' },
    'gx-terms-and-conditions:gaiaxTermsAndConditions': 'https://gaiax.cticpoc.com/.well-known/tsandcs.json',
    id: 'https://gaiax.cticpoc.com/.well-known/participant.json'
  },
  proof: {
    type: 'JsonWebSignature2020',
    created: '2023-09-05T07:09:03.743Z',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:web:gaiax.cticpoc.com#JWK2020',
    jws: 'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..aZxD14HEySk0Au2o2yn7CTeyHhJBEiIEzeHiYTvLgfw24mpDwsEZdU8QLkKr5oNxF391FUbX_PY5FUAAciO8QmVJoCfCBT0qNPIV4FzDRWLc2nl9EeA4y06Wwy1hyMN3qZWDRMqRu9unSGyBK4M8Ny4TsXdSNnz9Om4zwZsebx7-j72RKaxBB0UxMqvd3Dt_nZVOf3nUsNLvTJMSBQs7MQxJprJ9fXzAYp7uWTNZpHpwDYRGAHsddxvuXeM8vGDoUy6mYaNO-be1pPuFBTCJieHvQAdst3CORYlVWxsx9tMwMD_vpyz7fSXYaaj9nUnwyY4QmQ6H3RMtxVnZvrnW3Q'
  }
}
Building Legal Registration Number Verifiable Credential
{
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/jws-2020/v1'
  ],
  type: 'VerifiableCredential',
  id: 'https://gaiax.cticpoc.com/.well-known/lrn.json',
  issuer: 'did:web:gaiax.cticpoc.com',
  issuanceDate: '2023-09-05T07:09:03.753Z',
  credentialSubject: {
    id: 'https://gaiax.cticpoc.com/.well-known/lrn.json',
    '@context': 'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#',
    type: 'gx:legalRegistrationNumber',
    'gx:vatID': 'ESX1234567X',
    'gx:vatID-countryCode': 'ES'
  },
  proof: {
    type: 'JsonWebSignature2020',
    created: '2023-09-05T07:09:04.459Z',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:web:gaiax.cticpoc.com#JWK2020',
    jws: 'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..KzRWJ1vPsYJRwU17qWggpuu468IoLvhEC9UcEvW2qNyvrRPjluqe2FotDVXTFxQ3FgEwhQc7wUy9fZ8C1I-rijPSqM7GVaqUe-NAcu0f1jqJgtMkcrrLl0HTpFOIETxX6ifiuDRx-DaT4O5U8uvRhPQApDS6EgWw6vckjV6B8ywbHYXJfAEdjVu19lHos674yNflHc6nD2f9Ehoeixdwgw0xAe5tSdVpCkp8hi2iL0JUOZ9il_s35aQSfZgoKuq_d8hcNVxJ3o3-tkTWD2lBepkx3NCKYy4_nbhv9GAioYxgffFVG1i4rBzaR9_9_uMexyHP7KQaObl_qJ8ctXtdLw'
  }
}
Building Terms and Conditions Verifiable Credential
{
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/jws-2020/v1',
    'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#'
  ],
  type: 'VerifiableCredential',
  id: 'https://gaiax.cticpoc.com/.well-known/tsandcs.json',
  issuer: 'did:web:gaiax.cticpoc.com',
  issuanceDate: '2023-09-05T07:09:04.464Z',
  credentialSubject: {
    '@context': 'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#',
    type: 'gx:GaiaXTermsAndConditions',
    id: 'https://gaiax.cticpoc.com/.well-known/tsandcs.json',
    'gx:termsAndConditions': 'The PARTICIPANT signing the Self-Description agrees as follows:\n' +
      '- to update its descriptions about any changes, be it technical, organizational, or legal - especially but not limited to contractual in regards to the indicated attributes present in the descriptions.\n' +
      '\n' +
      'The keypair used to sign Verifiable Credentials will be revoked where Gaia-X Association becomes aware of any inaccurate statements in regards to the claims which result in a non-compliance with the Trust Framework and policy rules defined in the Policy Rules and Labelling Document (PRLD).'
  },
  proof: {
    type: 'JsonWebSignature2020',
    created: '2023-09-05T07:09:05.132Z',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:web:gaiax.cticpoc.com#JWK2020',
    jws: 'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..h5FzQyBJU_LePlYvOFQhCMcdzRRSsPw6iWSgPOnIH6hsVku6-nLemmPJE_RG_YtLYiVBIrdtQcwwEzQAbK0h797n5pdPcJEftL_y30Y5Axhfb9ywxGYdRes2oyGoXsyEduawhsjyh7wtTX1AsnFjK3luSQSYkmCCA6UixPJhtVpH7kzJaWr4VDqotdptqFrfmMpVgXpqm9GssQiZk_-JLO0q9JIi3BKh8cODscqNYv5F_-fksVcw2QisbY6eMH8ViYz68dzda_q6F4XkZQr-8xx9PEDt3nFmPTgqzfnjl8whg-1HiPpYcIZvjplDfllN98IEU3PMvPwvOSTVVCLrfw'
  }
}
Sending Verifiable Presentation to Compliance API
POST -> https://compliance.lab.gaia-x.eu/main/api/credential-offers
{
  '@context': 'https://www.w3.org/2018/credentials/v1',
  type: 'VerifiablePresentation',
  verifiableCredential: [
    {
      '@context': [Array],
      type: [Array],
      id: 'https://gaiax.cticpoc.com/.well-known/participant.json',
      issuer: 'did:web:gaiax.cticpoc.com',
      issuanceDate: '2023-09-05T07:09:02.699Z',
      credentialSubject: [Object],
      proof: [Object]
    },
    {
      '@context': [Array],
      type: 'VerifiableCredential',
      id: 'https://gaiax.cticpoc.com/.well-known/lrn.json',
      issuer: 'did:web:gaiax.cticpoc.com',
      issuanceDate: '2023-09-05T07:09:03.753Z',
      credentialSubject: [Object],
      proof: [Object]
    },
    {
      '@context': [Array],
      type: 'VerifiableCredential',
      id: 'https://gaiax.cticpoc.com/.well-known/tsandcs.json',
      issuer: 'did:web:gaiax.cticpoc.com',
      issuanceDate: '2023-09-05T07:09:04.464Z',
      credentialSubject: [Object],
      proof: [Object]
    }
  ]
}
✅ Compliance success
{
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/jws-2020/v1',
    'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#'
  ],
  type: [ 'VerifiableCredential' ],
  id: 'https://compliance.lab.gaia-x.eu/main/credential-offers/1a522efa-f3cc-45b9-bb47-8f608016e675',
  issuer: 'did:web:compliance.lab.gaia-x.eu:main',
  issuanceDate: '2023-09-05T07:09:15.088Z',
  expirationDate: '2023-12-04T07:09:15.088Z',
  credentialSubject: [
    {
      type: 'gx:compliance',
      id: 'https://gaiax.cticpoc.com/.well-known/participant.json',
      'gx:integrity': 'sha256-a841fa3bf1fe14f7282dea597239520fda876106fe20467f36e33eedbcd571b7',
      'gx:version': '22.10'
    },
    {
      type: 'gx:compliance',
      id: 'https://gaiax.cticpoc.com/.well-known/lrn.json',
      'gx:integrity': 'sha256-f78fcc087ec275acbbec3206a96f921ad7627bec8d5a46e18cc3c61b911e5af3',
      'gx:version': '22.10'
    },
    {
      type: 'gx:compliance',
      id: 'https://gaiax.cticpoc.com/.well-known/tsandcs.json',
      'gx:integrity': 'sha256-685070da1b8f0176ee9707ed4b321515e1a228768d7a9e04a9f5d0a102379358',
      'gx:version': '22.10'
    }
  ],
  proof: {
    type: 'JsonWebSignature2020',
    created: '2023-09-05T07:09:15.498Z',
    proofPurpose: 'assertionMethod',
    jws: 'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Fa_3nwDBE01_l3XO0XoVrYd86R_teyl_n-HkQW-I-lPTHRfYVZ30ztDbZhLB6RAmdy1O763tuRX3YEqw0_a-2rOecZ38rAMThQwmW04mjPjAmjD_SlxVmO9L2s3U38nOc6vv6ERDsKjH1O5yqms8roeoTuxeZiRNcuJlETJuxsARbzQ2CPMLQjxI9DCRiplOSDzXnf3Tr7GS1yf-VUkBVPucagArLNSskkYoiDdI-dp1AW0s9YYKeQq_Kv9OzFvbM8xs3JTbSEYn5xN2JTVLHwQMNVIXSN0v1QQM3cwEme8nK8DA-xwHKI9gllVd94a38fRsYykAQD7hpbeWodPGVg',
    verificationMethod: 'did:web:compliance.lab.gaia-x.eu:main#X509-JWK2020'
  }
}
Writing resulting Verifiable Presentation to /home/agmangas/gaiax-self-description-poc/htdocs/.well-known/vp.json
```
</details>

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
| [deltaDAO/self-description-signer](https://github.com/deltaDAO/self-description-signer) | The original repository that served as an inspiration and reference for this proof of concept. |
