include .env
export $(shell sed 's/=.*//' .env)

certs:
	./certbot-certonly.sh

self-description-signer:
	./clone-sdsigner.sh

clean:
	sudo rm -fr letsencrypt self-description-signer certs

.PHONY: clean