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
[...]

Building Participant Verifiable Credential
{
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/jws-2020/v1',
    'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#'
  ],
  type: [ 'VerifiableCredential' ],
  id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/participant.json',
  issuer: 'did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com',
  issuanceDate: '2023-09-04T16:05:00.391Z',
  credentialSubject: {
    type: 'gx:LegalParticipant',
    'gx:legalName': 'CTIC Technology Centre',
    'gx:legalRegistrationNumber': { id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/lrn.json' },
    'gx:headquarterAddress': { 'gx:countrySubdivisionCode': 'ES-AS' },
    'gx:legalAddress': { 'gx:countrySubdivisionCode': 'ES-AS' },
    'gx-terms-and-conditions:gaiaxTermsAndConditions': 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/tsandcs.json',
    id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/participant.json'
  },
  proof: {
    type: 'JsonWebSignature2020',
    created: '2023-09-04T16:05:01.361Z',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com#JWK2020',
    jws: 'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..X_LcblWeb9o_Mkcpppm6GhDNnT22z7uoAuds_0QkEpWXYqxKwtLl_OtNzl-RPfhd2iIOCV1YinKlJWHyEFDM5ylhBwdM3KwiHYSKjSyDVtwvYP29GXuesyoHAiQuZtxrLDe0jPq0LhOdeGGtXU0aD_3a5uoNv9rmXDJmMZAIM7TFzol6lug-UIV178ROviA1GLV1fSxc0jnk7GUrYv3OMoorAGAkcXaV8-fx8cGaeyI0eMiY-OpyvKwrbFmukgkSc32QdcwfOsieDDOUsMFv4_MXN3IRYiXNrA3scv-p7FxHsdBFdz3k6yhWUTIn6pp1lNrNDuwW5Y6nrr_6jbVAsA'
  }
}
Building Legal Registration Number Verifiable Credential
{
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/jws-2020/v1'
  ],
  type: 'VerifiableCredential',
  id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/lrn.json',
  issuer: 'did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com',
  issuanceDate: '2023-09-04T16:05:01.372Z',
  credentialSubject: {
    id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/lrn.json',
    '@context': 'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#',
    type: 'gx:legalRegistrationNumber',
    'gx:vatID': 'ESX1234567X',
    'gx:vatID-countryCode': 'ES'
  },
  proof: {
    type: 'JsonWebSignature2020',
    created: '2023-09-04T16:05:02.057Z',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com#JWK2020',
    jws: 'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..iUyklRg3WNrlMp_lr-7pp2KbTatCYGgyg6BuATCRM46no6TwSAooN81HaZYOcy93p1d8W2uVMBqABq_bHdZJW7wQDblLPMP-s-wriexUpNyF6x6Hxh8YwMO1CVhesfUoKoib3_gMX7nY4gaVBvPWxq8GaX3z4dxeGWZfWQhaGcEDr6UPRX0qFC2tH0P6BMJvRalvO5M6jbmI-cKp3tzwsXnW-O-2HUjZFFnd_w_Sip_WzTh7LcyOEi2N0aPqmYFUnns9hyN98NG7oqdokG0Mle-DNH5zJ3cpk2zWUtrtFoQS3H4gg2VPJXRYg5Qd_lYLRFCu2jCiSXV1esveoQwqqA'
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
  id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/tsandcs.json',
  issuer: 'did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com',
  issuanceDate: '2023-09-04T16:05:02.063Z',
  credentialSubject: {
    '@context': 'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#',
    type: 'gx:GaiaXTermsAndConditions',
    id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/tsandcs.json',
    'gx:termsAndConditions': 'The PARTICIPANT signing the Self-Description agrees as follows:\n' +
      '- to update its descriptions about any changes, be it technical, organizational, or legal - especially but not limited to contractual in regards to the indicated attributes present in the descriptions.\n' +
      '\n' +
      'The keypair used to sign Verifiable Credentials will be revoked where Gaia-X Association becomes aware of any inaccurate statements in regards to the claims which result in a non-compliance with the Trust Framework and policy rules defined in the Policy Rules and Labelling Document (PRLD).'
  },
  proof: {
    type: 'JsonWebSignature2020',
    created: '2023-09-04T16:05:02.729Z',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com#JWK2020',
    jws: 'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..L2lawtLyiTVfzducBRuNU0RJad3VaqyIqt1AwM5tEO28m7hqtCCFf2raYRLzzJ6jv0CyjTkqn5pL_6fp8D1hu0bKSt6Z-XBHMd8PvwlLb0nxPqO3VGyYI_qfY13sIAmPGM_iFo2sgPb4tOCPrE6qgud4MptU1qR_6oRXsaZm9uwjiWBuH2TJ87HaaldNwcc_cONKrruaaaITBKuQUnfMuDHdcnda4JBdTPohrUSF4VSHh70oCaCl3hdv8qGguSs65jzx4lTKVd0LLJ2mTqb0u5_v1VMsK6k3-GitJoXaahqj2-L1y7gevytaeiGpAWEefjFdUHokIttirsjCHevLdw'
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
      id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/participant.json',
      issuer: 'did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com',
      issuanceDate: '2023-09-04T16:05:00.391Z',
      credentialSubject: [Object],
      proof: [Object]
    },
    {
      '@context': [Array],
      type: 'VerifiableCredential',
      id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/lrn.json',
      issuer: 'did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com',
      issuanceDate: '2023-09-04T16:05:01.372Z',
      credentialSubject: [Object],
      proof: [Object]
    },
    {
      '@context': [Array],
      type: 'VerifiableCredential',
      id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/tsandcs.json',
      issuer: 'did:web:gaiaxsd.cticpoc.com:gaiaxsd-cticpoc-com',
      issuanceDate: '2023-09-04T16:05:02.063Z',
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
  id: 'https://compliance.lab.gaia-x.eu/main/credential-offers/999c15cf-a343-4e6f-a638-9fae3ea4c5cc',
  issuer: 'did:web:compliance.lab.gaia-x.eu:main',
  issuanceDate: '2023-09-04T16:05:08.889Z',
  expirationDate: '2023-12-03T16:05:08.889Z',
  credentialSubject: [
    {
      type: 'gx:compliance',
      id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/participant.json',
      'gx:integrity': 'sha256-e342869540fedc44b83c5e3f527c597fca3307166585a01a7bba8e7447c68186',
      'gx:version': '22.10'
    },
    {
      type: 'gx:compliance',
      id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/lrn.json',
      'gx:integrity': 'sha256-163eb5878dd05a7509a39a03fede4e5556979020c624e9f37a6bca2b67a99f2f',
      'gx:version': '22.10'
    },
    {
      type: 'gx:compliance',
      id: 'https://gaiaxsd.cticpoc.com/gaiaxsd-cticpoc-com/tsandcs.json',
      'gx:integrity': 'sha256-20b1fa18b499e17316933aec8af9a0a43d8ef3fd53daa73b2cc66f6bcbf607e4',
      'gx:version': '22.10'
    }
  ],
  proof: {
    type: 'JsonWebSignature2020',
    created: '2023-09-04T16:05:09.307Z',
    proofPurpose: 'assertionMethod',
    jws: 'eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..QNyVDmRXBh4yCaXv3hY9UK1inIhid6YRlR9Eetw0SJE2SzyVFl3blaB7GGocza4toSQmxRoMrgS2MN-x5kYPJV0b7zCjhygqAI17q5yW3hOi7BiFrGS2jhGIrEdaUfK-Yl0bnQ-VkhCz3tJBi-sWRVf7khgPwX67i-ImgB8OoUlGD0-yMszSdltboMCRiAJK8McPHD5ZQpcQLrKjJubUZM2DIY1B0NtJiIK-EKPKlUxJmRbfA_jWJiS5KVQdg6ucrY5cKAakhESOyOhAHgNVyuDa3pTjQcxVxqvKPtpPSQNa_fh4IAeXf2p-l7nvah_9bjYIYZO_KrN3P6-n94P74Q',
    verificationMethod: 'did:web:compliance.lab.gaia-x.eu:main#X509-JWK2020'
  }
}
Writing resulting Verifiable Presentation to /home/htdocs/gaiaxsd-cticpoc-com/vp.json
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
