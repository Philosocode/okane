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

## restore: download Nuget packages and ensure they're referenced correctly
.PHONY: restore
build:
	dotnet restore

## run: restore, build, and run the API
.PHONY: run
run:
	dotnet run

## watch
.PHONY: watch
watch:
	dotnet watch

## test
.PHONY: test
test:
	dotnet test ../Okane.Api.Tests

# ==================================================================================== #
# PRODUCTION
# ==================================================================================== #

## publish/linux-x64
.PHONY: publish/linux-x64
publish/linux-x64:
	dotnet publish --configuration Release --runtime linux-x64 --verbosity quiet

## publish/linux-arm: publish for Linux ARM 32-bit.
.PHONY: publish/linux-arm
publish/linux-arm:
	dotnet publish --configuration Release --runtime linux-arm --self-contained true --verbosity quiet
