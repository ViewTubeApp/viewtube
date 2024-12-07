# Docker image configuration
CODENAME := viewtube

# Check if environment is remote
IS_REMOTE := $(shell docker context inspect --format '{{.Name}}' 2>/dev/null | grep -q '$(CODENAME)' && echo 'true' || echo 'false')

# Public brand
PUBLIC_BRAND := porngid

# Docker organization
DOCKER_ORG := viewtubeapp
DOCKER_REGISTRY := ghcr.io

# Docker image names
IMAGE_TAG := latest
WEB_IMAGE_NAME := web
NGINX_IMAGE_NAME := nginx
HERMES_IMAGE_NAME := hermes
PROMETHEUS_IMAGE_NAME := prometheus

# Remote host URLs
CDN_HOST_URL := https://cdn.$(PUBLIC_BRAND).xyz
REMOTE_HOST_URL := https://$(PUBLIC_BRAND).xyz

# Environment-specific configuration
GIT_COMMIT := $(shell git rev-parse --short HEAD)
REMOTE_HOST := $(if $(filter true,$(IS_REMOTE)),$(PUBLIC_BRAND).xyz,web.docker.localhost)
CDN_HOST := $(if $(filter true,$(IS_REMOTE)),cdn.$(PUBLIC_BRAND).xyz,cdn.docker.localhost)
CDN_URL := $(if $(filter true,$(IS_REMOTE)),$(CDN_HOST_URL),http://cdn.docker.localhost)
PUBLIC_URL := $(if $(filter true,$(IS_REMOTE)),$(REMOTE_HOST_URL),http://$(CODENAME).docker.localhost)

# Web image
FULL_WEB_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(WEB_IMAGE_NAME):$(IMAGE_TAG)
COMMIT_WEB_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(WEB_IMAGE_NAME):$(GIT_COMMIT)

# Nginx image
FULL_NGINX_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(NGINX_IMAGE_NAME):$(IMAGE_TAG)
COMMIT_NGINX_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(NGINX_IMAGE_NAME):$(GIT_COMMIT)

# Hermes image
FULL_HERMES_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(HERMES_IMAGE_NAME):$(IMAGE_TAG)
COMMIT_HERMES_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(HERMES_IMAGE_NAME):$(GIT_COMMIT)

# Prometheus image
FULL_PROMETHEUS_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(PROMETHEUS_IMAGE_NAME):$(IMAGE_TAG)
COMMIT_PROMETHEUS_IMAGE_NAME := $(DOCKER_REGISTRY)/$(DOCKER_ORG)/$(PROMETHEUS_IMAGE_NAME):$(GIT_COMMIT)

SHARED_BUILD_ARGS := \
	--build-arg POSTGRES_HOST=db \
	--build-arg POSTGRES_DB=$(CODENAME) \
	--build-arg POSTGRES_PORT=5432 \
	--build-arg POSTGRES_USER=postgres \
	--build-arg POSTGRES_PASSWORD_FILE=/run/secrets/db-password \
	--build-arg RABBITMQ_HOST=rabbitmq \
	--build-arg RABBITMQ_PORT=5672 \
	--build-arg RABBITMQ_USER=rabbitmq \
	--build-arg RABBITMQ_PASSWORD_FILE=/run/secrets/rabbitmq-password

# Docker build arguments for web image
WEB_BUILD_ARGS := \
	--build-arg NEXT_PUBLIC_URL=$(PUBLIC_URL) \
	--build-arg NEXT_PUBLIC_CDN_URL=$(CDN_URL) \
	--build-arg NEXT_PUBLIC_BRAND=$(PUBLIC_BRAND) \
	$(SHARED_BUILD_ARGS)

HERMES_BUILD_ARGS := \
	--build-arg UPLOADS_VOLUME=/app/uploads \
	$(SHARED_BUILD_ARGS)

# Remote configuration
REMOTE_HOST_SSH := deploy@$(REMOTE_HOST_URL)

.PHONY: help \
	web-build nginx-build hermes-build prometheus-build \
	all-build docker-push docker-pull docker-publish \
	app-deploy app-stop \
	dev-db dev-rabbitmq \
	env-local env-remote env-setup \
	nginx-start rabbitmq-start hermes-start \
	dev setup-dev

# Default target
.DEFAULT_GOAL := help

help: ## Show available commands
	@echo 'Available commands:'
	@echo ''
	@echo 'Docker:'
	@echo '  docker-push         Push image to registry'
	@echo '  docker-pull         Pull image from registry'
	@echo '  docker-publish      Build and push image'
	@echo '  all-build           Build all images'
	@echo ''
	@echo 'Application:'
	@echo '  app-deploy          Deploy application stack'
	@echo '  app-stop            Stop application stack'
	@echo ''
	@echo 'Development:'
	@echo '  dev-db              Start PostgreSQL database'
	@echo '  dev-rabbitmq        Start RabbitMQ server'
	@echo '  dev                 Run all development services'
	@echo ''
	@echo 'Environment:'
	@echo '  env-local           Switch to local environment'
	@echo '  env-remote          Switch to remote environment'
	@echo '  env-setup           Setup remote environment'
	@echo ''
	@echo 'Hermes Go server targets:'
	@echo '  hermes-build        Build Hermes Go server'
	@echo '  hermes-start        Run Hermes Go server'

# Next.js web image targets
web-build:
	docker build -t $(FULL_WEB_IMAGE_NAME) \
		-t $(COMMIT_WEB_IMAGE_NAME) \
		-f ./Dockerfile.web . \
		--no-cache \
		$(WEB_BUILD_ARGS)

# Nginx image targets
nginx-build:
	docker build -t $(FULL_NGINX_IMAGE_NAME) \
		-t $(COMMIT_NGINX_IMAGE_NAME) \
		-f ./Dockerfile.nginx . \
		--no-cache

# Hermes Go server targets
hermes-build:
	docker build -t $(FULL_HERMES_IMAGE_NAME) \
		-t $(COMMIT_HERMES_IMAGE_NAME) \
		-f Dockerfile.hermes . \
		--no-cache \
		$(HERMES_BUILD_ARGS)

# Prometheus image targets
prometheus-build:
	docker build -t $(FULL_PROMETHEUS_IMAGE_NAME) \
		-t $(COMMIT_PROMETHEUS_IMAGE_NAME) \
		-f Dockerfile.prometheus . \
		--no-cache

# Build all images
all-build: web-build nginx-build hermes-build prometheus-build

docker-push: ## Push image to registry
	docker push $(FULL_WEB_IMAGE_NAME)
	docker push $(COMMIT_WEB_IMAGE_NAME)
	docker push $(FULL_NGINX_IMAGE_NAME)
	docker push $(COMMIT_NGINX_IMAGE_NAME)
	docker push $(FULL_HERMES_IMAGE_NAME)
	docker push $(COMMIT_HERMES_IMAGE_NAME)
	docker push $(FULL_PROMETHEUS_IMAGE_NAME)
	docker push $(COMMIT_PROMETHEUS_IMAGE_NAME)

docker-pull: ## Pull image from registry
	docker pull $(FULL_WEB_IMAGE_NAME)
	docker pull $(FULL_NGINX_IMAGE_NAME)
	docker pull $(FULL_HERMES_IMAGE_NAME)
	docker pull $(FULL_PROMETHEUS_IMAGE_NAME)

docker-publish: all-build docker-push ## Build and push image

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
dev: setup-dev
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
