.PHONY: all

build:
	docker buildx build -t ghcr.io/viewtubeapp/web:latest . \
		--platform linux/arm64,linux/amd64 \
		--build-arg POSTGRES_HOST=db \
		--build-arg POSTGRES_DB=viewtube \
		--build-arg POSTGRES_PORT=5432 \
		--build-arg POSTGRES_USER=postgres \
		--build-arg POSTGRES_PASSWORD_FILE=/run/secrets/db-password

deploy:
	docker stack deploy -c compose.yaml -d viewtube --with-registry-auth

stop:
	docker stack rm viewtube

push:
	docker push ghcr.io/viewtubeapp/web:latest

pull:
	docker pull ghcr.io/viewtubeapp/web:latest

start_pg:
	./scripts/start-database.sh

start_redis:
	./scripts/start-redis.sh

context_default:
	docker context use default

context_remote:
	docker context use viewtube

context_create:
	docker context create viewtube --docker "host=ssh://root@62.72.22.222"
