include .env
export $(shell sed 's/=.*//' .env)

.env.certs:
	./certbot-certonly.sh

sdsigner:
	./clone-sdsigner.sh

# .PHONY: certs