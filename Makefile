# Docker image configuration
DOCKER_REGISTRY := ghcr.io
DOCKER_ORG := viewtubeapp
WEB_IMAGE_NAME := web
NGINX_IMAGE_NAME := nginx
IMAGE_TAG := latest
REMOTE_HOST_URL := http://62.72.22.222

# Environment-specific configuration
CDN_URL := $(shell docker context inspect --format '{{.Name}}' 2>/dev/null | grep -q 'viewtube' && echo '$(HOST_URL):8888' || echo 'http://cdn.docker.localhost:8888')
PUBLIC_URL := $(shell docker context inspect --format '{{.Name}}' 2>/dev/null | grep -q 'viewtube' && echo '$(HOST_URL)' || echo 'http://viewtube.docker.localhost')
GIT_COMMIT := $(shell git rev-parse --short HEAD)

FULL_WEB_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(WEB_IMAGE_NAME):$(IMAGE_TAG)
FULL_NGINX_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(NGINX_IMAGE_NAME):$(IMAGE_TAG)
COMMIT_WEB_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(WEB_IMAGE_NAME):$(GIT_COMMIT)
COMMIT_NGINX_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(NGINX_IMAGE_NAME):$(GIT_COMMIT)

# Docker build arguments
BUILD_ARGS := \
	--build-arg NEXT_PUBLIC_CDN_URL=$(CDN_URL) \
	--build-arg NEXT_PUBLIC_URL=$(PUBLIC_URL) \
	--build-arg POSTGRES_HOST=db \
	--build-arg POSTGRES_DB=viewtube \
	--build-arg POSTGRES_PORT=5432 \
	--build-arg POSTGRES_USER=postgres \
	--build-arg POSTGRES_PASSWORD_FILE=/run/secrets/db-password

# Platform configuration
PLATFORMS := linux/arm64,linux/amd64

# Remote configuration
REMOTE_HOST := root@$(REMOTE_HOST_URL)

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
web-build: ## Build multi-platform Docker image
	docker build -t $(FULL_WEB_IMAGE_NAME) \
		-t $(COMMIT_WEB_IMAGE_NAME) \
		-f ./Dockerfile.web . \
		--platform $(PLATFORMS) \
		--no-cache \
		$(BUILD_ARGS)

nginx-build: ## Build multi-platform Docker image
	docker build -t $(FULL_NGINX_IMAGE_NAME) \
		-t $(COMMIT_NGINX_IMAGE_NAME) \
		-f ./Dockerfile.nginx . \
		--platform $(PLATFORMS) \
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

dev-nginx: ## Start Nginx server
	docker run -d --name nginx \
		-v $(PWD)/nginx.conf:/etc/nginx/nginx.conf:ro \
		-v $(PWD)/public:/usr/share/nginx/html:ro \
		-p 8888:80 \
		nginx:alpine

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
