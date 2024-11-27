.PHONY: all

build:
	docker compose build

deploy:
	docker stack deploy -c compose.yaml -d viewtube

stop:
	docker stack rm viewtube

pg\:\:start:
	./scripts/start-database.sh

redis\:\:start:
	./scripts/start-redis.sh
