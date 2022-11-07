include .env
export $(shell sed 's/=.*//' .env)

ifneq (,$(wildcard ./.env.local))
	include .env.local
	export $(shell sed 's/=.*//' .env.local)
endif

.DEFAULT_GOAL=up

up:
	sleep 2

.PHONY: up