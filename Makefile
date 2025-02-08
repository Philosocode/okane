API_DIR = Okane.Api
CLIENT_DIR = Okane.Client

# ==================================================================================== #
# HELPERS
# ==================================================================================== #

## help: print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'

## confirm: prompt the user to confirm before performing a command
.PHONY: confirm
confirm:
	@echo -n 'Are you sure? [y/N] ' && read ans && [ $${ans:-N} = y ]

# ==================================================================================== #
# DEVELOPMENT
# ==================================================================================== #

## deps: install deps and set up Git hooks
.PHONY: deps
deps:
	mise install
	pnpm install

## api/%: run commands in the Okane.Api Makefile. e.g. make run/api, make build/api
.PHONY: api/%
api/%:
	$(MAKE) -C $(API_DIR) $*

## client/%: run commands in the Okane.Client Makefile. e.g. make run/client, make test/client
.PHONY: client/%
client/%:
	$(MAKE) -C $(CLIENT_DIR) $*


# ==================================================================================== #
# PRODUCTION
# ==================================================================================== #

## prod/connect: connect to the production server
.PHONY: prod/connect
prod/connect:
	ssh ${SSH_TARGET}

## prod/deploy
.PHONY: prod/deploy
prod/deploy:
	@echo 'Building the backend...'
	make api/publish
	@echo 'Building the frontend...'
	make client/build
	@echo 'Transferring files...'
	rsync -qrP ${API_DIR}/bin/Release/net8.0/linux-x64/Publish ${SSH_TARGET}:~
	rsync -qrP ${CLIENT_DIR}/dist ${SSH_TARGET}:~
	rsync -qP ./Remote/okane-api.service ${SSH_TARGET}:~
	rsync -qP ./Remote/Caddyfile ${SSH_TARGET}:~
	ssh -t ${SSH_TARGET} '\
		sudo rm -rf /var/www/okane/Api \
		&& sudo rm -rf /var/www/okane/Client \
		&& sudo mv Publish /var/www/okane/Api \
		&& sudo mv dist /var/www/okane/Client \
		&& sudo mv ~/okane-api.service /etc/systemd/system/ \
		&& sudo systemctl enable okane-api \
		&& sudo systemctl restart okane-api \
		&& sudo mv ~/Caddyfile /etc/caddy/ \
		&& sudo systemctl reload caddy \
	'
