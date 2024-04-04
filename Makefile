API_DIR='./Okane.Api'
CLIENT_DIR='./Okane.Client'

.PHONY: deps
deps:
	asdf install
	npm install

# Run commands in the Makefiles located in the sub-directories.
# e.g. "make run-api" is equivalent to "make run" in the Api project.
.PHONY: %-api
%-api:
	$(MAKE) -C $(API_DIR) $*

.PHONY: %-client
%-client:
	$(MAKE) -C $(CLIENT_DIR) $*
