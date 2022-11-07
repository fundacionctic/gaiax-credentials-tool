include .env
export $(shell sed 's/=.*//' .env)

.env.certs:
	./certbot-certonly.sh

self-description-signer:
	./clone-sdsigner.sh

# .PHONY: certs