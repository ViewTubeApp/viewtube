# Public brand
CODENAME := viewtube
PUBLIC_BRAND := porngid

# Remote host URLs
REMOTE_HOST_URL := https://$(PUBLIC_BRAND).xyz

# Remote configuration
REMOTE_HOST_SSH := deploy@$(REMOTE_HOST_URL)

.PHONY: help \
	dev db-start hermes-start rabbitmq-start auth-start redis-start \
	env-local env-remote env-setup

# Default target
.DEFAULT_GOAL := help

# Colors
BOLD := \033[1m
RESET := \033[0m
GREEN := \033[32m
YELLOW := \033[33m

# The table width inside the borders is 53 characters total:
# Left column: 16 chars + 2 chars for padding = 18 chars total width
# Right column: 32 chars + 2 chars for padding = 34 chars total width
# Combined width: 18 + 1 (separator) + 34 = 53 chars

help: ## Show available commands with Unicode box-drawing centered header
	@printf "\n\n"
	@printf "┌─────────────────────────────────────────────────────┐\n"
	@printf "│$(YELLOW)$(BOLD)%*s%s%*s$(RESET)│\n" 17 "" "Available Commands" 18 ""
	@printf "├──────────────────┬──────────────────────────────────┤\n"
	@printf "│ $(GREEN)$(BOLD)%-16s$(RESET) │ %-32s │\n" "Development" ""
	@printf "├──────────────────┼──────────────────────────────────┤\n"
	@printf "│ %-16s │ %-32s │\n" "dev" "Run all development services"
	@printf "│ %-16s │ %-32s │\n" "db-start" "Start PostgreSQL database"
	@printf "│ %-16s │ %-32s │\n" "redis-start" "Start Redis server"
	@printf "│ %-16s │ %-32s │\n" "auth-start" "Start Authentik services"
	@printf "│ %-16s │ %-32s │\n" "hermes-start" "Run Hermes Go server"
	@printf "│ %-16s │ %-32s │\n" "rabbitmq-start" "Start RabbitMQ server"
	@printf "├──────────────────┼──────────────────────────────────┤\n"
	@printf "│ $(GREEN)$(BOLD)%-16s$(RESET) │ %-32s │\n" "Environment" ""
	@printf "├──────────────────┼──────────────────────────────────┤\n"
	@printf "│ %-16s │ %-32s │\n" "env-local" "Switch to local environment"
	@printf "│ %-16s │ %-32s │\n" "env-remote" "Switch to remote environment"
	@printf "│ %-16s │ %-32s │\n" "env-setup" "Setup remote environment"
	@printf "└──────────────────┴──────────────────────────────────┘\n\n"

# Development commands
db-start: ## Start PostgreSQL database
	@if [ -f ./scripts/start-database.sh ]; then \
		./scripts/start-database.sh; \
	else \
		echo "Error: start-database.sh script not found"; \
		exit 1; \
	fi

redis-start: ## Start Redis server
	@if [ -f ./scripts/start-redis.sh ]; then \
		./scripts/start-redis.sh; \
	else \
		echo "Error: start-redis.sh script not found"; \
		exit 1; \
	fi

auth-start: ## Start Authentik services
	@if [ -f ./scripts/start-authentik.sh ]; then \
		./scripts/start-authentik.sh; \
	else \
		echo "Error: start-authentik.sh script not found"; \
		exit 1; \
	fi

rabbitmq-start: ## Start RabbitMQ server
	@if [ -f ./scripts/start-rabbitmq.sh ]; then \
		./scripts/start-rabbitmq.sh; \
	else \
		echo "Error: start-rabbitmq.sh script not found"; \
		exit 1; \
	fi

hermes-start: ## Develop Hermes Go server
	cd extra/hermes && go install github.com/air-verse/air@latest && $(HOME)/go/bin/air

# Environment commands
env-local: ## Switch to local environment
	docker context use default

env-remote: ## Switch to remote environment
	docker context use $(CODENAME)

env-setup: ## Setup remote environment
	docker context create $(CODENAME) --docker "host=ssh://$(REMOTE_HOST_SSH)"

# Run all development services
dev:
	@echo "Starting databases..."
	@make db-start
	@make rabbitmq-start
	@echo "Running database migrations..."
	@pnpm run db:migrate
	@echo "Starting development servers..."
	@trap 'echo "Stopping databases..." && docker stop viewtube-postgres viewtube-rabbitmq' EXIT && \
	pnpm concurrently \
		-n "hermes,web" \
		-c "yellow,green" \
		"make hermes-start" \
		"pnpm run dev"
