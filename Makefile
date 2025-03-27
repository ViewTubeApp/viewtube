CODENAME := viewtube
PUBLIC_BRAND := porngid

REMOTE_HOST_URL := https://$(PUBLIC_BRAND).xyz
REMOTE_HOST_SSH := deploy@$(REMOTE_HOST_URL)

.PHONY: help env-local env-remote env-setup

.DEFAULT_GOAL := help

BOLD := \033[1m
RESET := \033[0m
GREEN := \033[32m
YELLOW := \033[33m

help:
	@printf "\n\n"
	@printf "┌─────────────────────────────────────────────────────┐\n"
	@printf "│$(YELLOW)$(BOLD)%*s%s%*s$(RESET)│\n" 17 "" "Available Commands" 18 ""
	@printf "├──────────────────┼──────────────────────────────────┤\n"
	@printf "│ $(GREEN)$(BOLD)%-16s$(RESET) │ %-32s │\n" "env-local" "Switch to local environment"
	@printf "│ $(GREEN)$(BOLD)%-16s$(RESET) │ %-32s │\n" "env-remote" "Switch to remote environment"
	@printf "│ $(GREEN)$(BOLD)%-16s$(RESET) │ %-32s │\n" "env-setup" "Setup remote environment"
	@printf "└──────────────────┴──────────────────────────────────┘\n\n"

env-local:
	docker context use default

env-remote:
	docker context use $(CODENAME)

env-setup:
	docker context create $(CODENAME) --docker "host=ssh://$(REMOTE_HOST_SSH)"
