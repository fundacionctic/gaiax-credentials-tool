include .env
export $(shell sed 's/=.*//' .env)

certs:
	./certbot-certonly.sh

.PHONY: certs