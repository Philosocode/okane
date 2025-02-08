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

## publish: publish for Linux x64
.PHONY: publish
publish:
	dotnet publish --configuration Release --runtime linux-x64 --verbosity quiet
