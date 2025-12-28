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

## run/host: start the frontend dev server and expose to the network
.PHONY: run-host
run-host:
	pnpm dev --host

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
build: dist

# Excluding node_modules and dist, don't rebuild unless a source code file changes.
SOURCE_FILES := $(shell find . \( -name node_modules -o -name dist \) -prune -o -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.vue" -o -name "*.scss" -o -name "*.html" \) -print)

dist: $(SOURCE_FILES)
	pnpm build
