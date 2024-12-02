# Docker image configuration
DOCKER_REGISTRY := ghcr.io
DOCKER_ORG := viewtubeapp
IMAGE_NAME := web
IMAGE_TAG := latest
FULL_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(IMAGE_NAME):$(IMAGE_TAG)

# Docker build arguments
BUILD_ARGS := \
	--build-arg POSTGRES_HOST=db \
	--build-arg POSTGRES_DB=viewtube \
	--build-arg POSTGRES_PORT=5432 \
	--build-arg POSTGRES_USER=postgres \
	--build-arg POSTGRES_PASSWORD_FILE=/run/secrets/db-password

# Platform configuration
PLATFORMS := linux/arm64,linux/amd64

# Remote configuration
REMOTE_HOST := root@62.72.22.222

.PHONY: help \
	docker-build docker-push docker-pull docker-publish \
	app-deploy app-stop \
	dev-db dev-redis \
	env-local env-remote env-setup

# Default target
.DEFAULT_GOAL := help

help: ## Show available commands
	@echo 'Available commands:'
	@echo ''
	@echo 'Docker:'
	@echo '  docker-build        Build multi-platform Docker image'
	@echo '  docker-push         Push image to registry'
	@echo '  docker-pull         Pull image from registry'
	@echo '  docker-publish      Build and push image'
	@echo ''
	@echo 'Application:'
	@echo '  app-deploy          Deploy application stack'
	@echo '  app-stop            Stop application stack'
	@echo ''
	@echo 'Development:'
	@echo '  dev-db              Start PostgreSQL database'
	@echo '  dev-redis           Start Redis server'
	@echo ''
	@echo 'Environment:'
	@echo '  env-local           Switch to local environment'
	@echo '  env-remote          Switch to remote environment'
	@echo '  env-setup           Setup remote environment'

# Docker commands
docker-build: ## Build multi-platform Docker image
	docker buildx build -t $(FULL_IMAGE_NAME) . \
		--platform $(PLATFORMS) \
		$(BUILD_ARGS)

docker-push: ## Push image to registry
	docker push $(FULL_IMAGE_NAME)

docker-pull: ## Pull image from registry
	docker pull $(FULL_IMAGE_NAME)

docker-publish: docker-build docker-push ## Build and push image

# Application commands
app-deploy: ## Deploy application stack
	docker stack deploy -c compose.yaml -d viewtube --with-registry-auth

app-stop: ## Stop application stack
	docker stack rm viewtube

# Development commands
dev-db: ## Start PostgreSQL database
	@if [ -f ./scripts/start-database.sh ]; then \
		./scripts/start-database.sh; \
	else \
		echo "Error: start-database.sh script not found"; \
		exit 1; \
	fi

dev-redis: ## Start Redis server
	@if [ -f ./scripts/start-redis.sh ]; then \
		./scripts/start-redis.sh; \
	else \
		echo "Error: start-redis.sh script not found"; \
		exit 1; \
	fi

# Environment commands
env-local: ## Switch to local environment
	docker context use default

env-remote: ## Switch to remote environment
	docker context use viewtube

env-setup: ## Setup remote environment
	docker context create viewtube --docker "host=ssh://$(REMOTE_HOST)"
