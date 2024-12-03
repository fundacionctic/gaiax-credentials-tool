# Gaia-X Self-Descriptions

A simple proof of concept of the process to build and sign a Self-Description using the [Gaia-X Compliance Service](https://gitlab.com/gaia-x/lab/compliance/gx-compliance).

The main contribution of this repository is demonstrating how to programmatically build [Gaia-X Self-Description](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/gaia-x_trust_framework/#gaia-x-self-description) documents, which are then validated by the [Gaia-X Lab Compliance API](https://compliance.lab.gaia-x.eu/v1-staging/docs). We leverage the fact that Let’s Encrypt is able to issue free certificates signed by a [valid Trust Anchor](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/trust_anchors/#list-of-defined-trust-anchors), ensuring compliance without incurring extra costs.

## Prerequisites

### Running from Docker

* A Linux server with _sudo_ access that has ports 80 and 443 exposed to the Internet.
* A public DNS domain that points to the IP address of the previous Linux server.
* Docker.

### Running from code

* The prerequisites above.
* [Node 18+](https://nodejs.org/en/download/package-manager).
* [Taskfile](https://taskfile.dev/installation/).

## Building the Docker image

To build the Docker image, run the following command in the root of the repository:

```console
$ docker build -t gaia-x .
```

## Usage

First you need to update the configuration to match your environment. Copy the file `.env.default` from this repository to `.env` and, at least, update the following variables:

| Variable | Description |
| --- | --- |
| `CERTBOT_DOMAIN` | The domain name of your server for which you want to generate the Let's Encrypt certificate. |
| `CERTBOT_EMAIL` | The email of the owner of the domain name. |
| `RESOURCE_OPENAPI_SPEC` | This variable should point to an OpenAPI schema that describes the HTTP API that you want to model as a [Gaia-X Resource](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/resource_and_subclasses/#virtual-resource). |

### Running from Docker

To make the process easier, we recommend defining the following alias in your shell:

```console
alias gaia-x='docker run --rm -it -p 80:80 -p 443:443 -v "$PWD/.env:/app/.env" -v "$PWD/htdocs:/app/htdocs" -v "$PWD/certs:/app/certs" -v "$PWD:/out" gaia-x'
```

You should run the commands the rest of commands in this guide from the directory where the `.env` file is located.

Request the certificates with the following command:

```console
$ gaia-x get-certs
```

This will generate the certificates and store them in the `certs` folder.

Generate the DID with the following command:

```console
$ gaia-x build-did
```

Generate the Verifiable Credentials with the following command:

```console
$ gaia-x build-credentials
```

You can now build submit the resulting Verifiable Presentation to the Compliance API:

```console
$ gaia-x build-vp
```

Alternatively, you can create a container image that will generate the Verifiable Presentation and submit it to the Compliance API every time it is run:

```console
$ gaia-x build-credential-server-image
```

This will create a file named `image.tar` in the current directory. You can load this image into your Docker daemon with the following command:

```console
$ docker load -i image.tar
```

You can now run the container with the following command:

```console
docker run -it --rm -p 443:443 gaiax-credential-server
```

### Running from code

Install the dependencies and request the certificates with the following commands:

```console
$ npm install
$ sudo task get-certs
```

This will generate the certificates and store them in the `certs` folder.

Generate the DID with the following command:

```console
$ task build-did
```

Generate the Verifiable Credentials with the following command:

```console
$ task build-credentials
```

You can now build submit the resulting Verifiable Presentation to the Compliance API:

```console
$ task build-vp
```

Alternatively, you can create a container image that will generate the Verifiable Presentation and submit it to the Compliance API every time it is run:

```console
$ task build-credential-server-image
```

This will build a Docker image named `gaiax-credential-server`. You can now run the container with the following command:

```console
$ docker run -it --rm -p 443:443 gaiax-credential-server
```

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
