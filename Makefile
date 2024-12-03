# Docker image configuration
PUBLIC_BRAND := porngid
CODENAME := viewtube
DOCKER_REGISTRY := ghcr.io
DOCKER_ORG := viewtubeapp
WEB_IMAGE_NAME := web
NGINX_IMAGE_NAME := nginx
HERMES_IMAGE_NAME := hermes
IMAGE_TAG := latest
REMOTE_HOST := $(PUBLIC_BRAND).xyz
CDN_HOST := cdn.$(PUBLIC_BRAND).xyz
REMOTE_HOST_URL := https://$(PUBLIC_BRAND).xyz
CDN_HOST_URL := https://cdn.$(PUBLIC_BRAND).xyz

# Environment-specific configuration
CDN_URL := $(shell docker context inspect --format '{{.Name}}' 2>/dev/null | grep -q '$(CODENAME)' && echo '$(CDN_HOST_URL)' || echo 'http://cdn.docker.localhost')
PUBLIC_URL := $(shell docker context inspect --format '{{.Name}}' 2>/dev/null | grep -q '$(CODENAME)' && echo '$(REMOTE_HOST_URL)' || echo 'http://$(CODENAME).docker.localhost')
GIT_COMMIT := $(shell git rev-parse --short HEAD)

FULL_WEB_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(WEB_IMAGE_NAME):$(IMAGE_TAG)
FULL_NGINX_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(NGINX_IMAGE_NAME):$(IMAGE_TAG)
FULL_HERMES_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(HERMES_IMAGE_NAME):$(IMAGE_TAG)
COMMIT_WEB_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(WEB_IMAGE_NAME):$(GIT_COMMIT)
COMMIT_NGINX_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(NGINX_IMAGE_NAME):$(GIT_COMMIT)
COMMIT_HERMES_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(HERMES_IMAGE_NAME):$(GIT_COMMIT)

# Docker build arguments for web image
WEB_BUILD_ARGS := \
	--build-arg NEXT_PUBLIC_CDN_URL=$(CDN_URL) \
	--build-arg NEXT_PUBLIC_URL=$(PUBLIC_URL) \
	--build-arg NEXT_PUBLIC_BRAND=$(PUBLIC_BRAND) \
	--build-arg POSTGRES_HOST=db \
	--build-arg POSTGRES_DB=$(CODENAME) \
	--build-arg POSTGRES_PORT=5432 \
	--build-arg POSTGRES_USER=postgres \
	--build-arg POSTGRES_PASSWORD_FILE=/run/secrets/db-password

HERMES_BUILD_ARGS := \
	--build-arg REDIS_HOST=redis \
	--build-arg REDIS_PORT=6379 \
	--build-arg REDIS_PASSWORD_FILE=/run/secrets/redis-password \
	--build-arg UPLOADS_VOLUME=/app/uploads

# Remote configuration
REMOTE_HOST_SSH := deploy@$(REMOTE_HOST_URL)

.PHONY: help \
	docker-build docker-push docker-pull docker-publish \
	app-deploy app-stop \
	dev-db dev-redis \
	env-local env-remote env-setup \
	hermes-build hermes-run hermes-dev hermes-clean \
	dev setup-dev

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
	@echo '  dev                 Run all development services'
	@echo ''
	@echo 'Environment:'
	@echo '  env-local           Switch to local environment'
	@echo '  env-remote          Switch to remote environment'
	@echo '  env-setup           Setup remote environment'
	@echo 'Hermes Go server targets:'
	@echo '  hermes-build        Build Hermes Go server'
	@echo '  hermes-run          Run Hermes Go server'
	@echo '  hermes-dev          Develop Hermes Go server'
	@echo '  hermes-clean        Clean Hermes Go server'

# Docker commands
web-build: ## Build multi-platform Docker image
	docker build -t $(FULL_WEB_IMAGE_NAME) \
		-t $(COMMIT_WEB_IMAGE_NAME) \
		-f ./Dockerfile.web . \
		--no-cache \
		$(WEB_BUILD_ARGS)

nginx-build: ## Build multi-platform Docker image
	docker build -t $(FULL_NGINX_IMAGE_NAME) \
		-t $(COMMIT_NGINX_IMAGE_NAME) \
		-f ./Dockerfile.nginx . \
		--no-cache

docker-push: ## Push image to registry
	docker push $(FULL_WEB_IMAGE_NAME)
	docker push $(COMMIT_WEB_IMAGE_NAME)
	docker push $(FULL_NGINX_IMAGE_NAME)
	docker push $(COMMIT_NGINX_IMAGE_NAME)

docker-pull: ## Pull image from registry
	docker pull $(FULL_WEB_IMAGE_NAME)
	docker pull $(FULL_NGINX_IMAGE_NAME)

docker-publish: web-build nginx-build docker-push ## Build and push image

# Application commands
app-deploy: ## Deploy application stack
	CDN_HOST=$(CDN_HOST) REMOTE_HOST=$(REMOTE_HOST) CODENAME=$(CODENAME) \
	docker stack deploy -c compose.yaml -d $(CODENAME) --with-registry-auth

app-stop: ## Stop application stack
	CDN_HOST=$(CDN_HOST) REMOTE_HOST=$(REMOTE_HOST) CODENAME=$(CODENAME) \
	docker stack rm $(CODENAME)

# Development commands
db-start: ## Start PostgreSQL database
	@if [ -f ./scripts/start-database.sh ]; then \
		./scripts/start-database.sh; \
	else \
		echo "Error: start-database.sh script not found"; \
		exit 1; \
	fi

nginx-start: ## Start Nginx server
	docker run -d --name nginx \
		-v $(PWD)/nginx.conf:/etc/nginx/nginx.conf:ro \
		-v $(PWD)/public:/usr/share/nginx/html:ro \
		-p 8000:80 \
		nginx:alpine

redis-start: ## Start Redis server
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
	docker context use $(CODENAME)

env-setup: ## Setup remote environment
	docker context create $(CODENAME) --docker "host=ssh://$(REMOTE_HOST_SSH)"

# Hermes Go server targets
hermes-build:
	docker build -t $(FULL_HERMES_IMAGE_NAME) \
		-t $(COMMIT_HERMES_IMAGE_NAME) \
		-f Dockerfile.hermes . \
		--no-cache \
		$(HERMES_BUILD_ARGS)

hermes-dev:
	cd extra/hermes && go install github.com/air-verse/air@latest && $(HOME)/go/bin/air

# Run all development services
dev: setup-dev
	@echo "Starting databases..."
	@make db-start
	@make redis-start
	@echo "Running database migrations..."
	@pnpm run db:migrate
	@echo "Starting development servers..."
	@trap 'echo "Stopping databases..." && docker stop viewtube-postgres viewtube-redis' EXIT && \
	pnpm concurrently \
		-n "hermes,web" \
		-c "yellow,green" \
		"make hermes-dev" \
		"pnpm run dev"
