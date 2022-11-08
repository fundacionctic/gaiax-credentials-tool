include .env
export $(shell sed 's/=.*//' .env)

certs:
	./certbot-certonly.sh

self-description-signer:
	./clone-sdsigner.sh

self-description-signer-config: self-description-signer certs
	./create-sdsigner-conf.sh

run-self-description-signer: self-description-signer-config
	./run-sdsigner.sh

clean:
	sudo rm -fr letsencrypt self-description-signer certs

.PHONY: self-description-signer-config run-self-description-signer clean