# ==================================================================================== #
# HELPERS
# ==================================================================================== #

## help: print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'

# ==================================================================================== #
# DEVELOPMENT
# ==================================================================================== #

## run: start the frontend dev server 
.PHONY: run
run:
	pnpm dev

## install: install deps
.PHONY: install
install:
	pnpm install

## lint
.PHONY: lint
lint:
	pnpm lint

## test
.PHONY: test
test:
	pnpm test

# ==================================================================================== #
# PRODUCTION
# ==================================================================================== #

## build
.PHONY: build
build:
	pnpm build
