#!/usr/bin/env bash
# Use this script to start docker containers for local development Authentik instance

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-authentik.sh`

# On Linux and macOS you can run this script directly - `./start-authentik.sh`

AUTH_SERVER_CONTAINER_NAME="viewtube-auth-server"
AUTH_WORKER_CONTAINER_NAME="viewtube-auth-worker"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

# Import environment variables from .env
set -a
source .env

# Set default values if variables are not set
AUTHENTIK_PORT="${AUTHENTIK_PORT:-9000}"
AUTHENTIK_SECRET_KEY="${AUTHENTIK_SECRET_KEY:-$(openssl rand -base64 36)}"

# Check if Redis is running
if ! docker ps -q --filter name=viewtube-redis >/dev/null 2>&1; then
  echo "Redis is required but not running. Please start Redis first using ./start-redis.sh"
  exit 1
fi

# Check if PostgreSQL is running
if ! docker ps -q --filter name=viewtube-postgres >/dev/null 2>&1; then
  echo "PostgreSQL is required but not running. Please start PostgreSQL first using ./start-database.sh"
  exit 1
fi

# Start auth-server if not running
if [ "$(docker ps -q -f name=$AUTH_SERVER_CONTAINER_NAME)" ]; then
  echo "Auth server container '$AUTH_SERVER_CONTAINER_NAME' is already running."
else
  if [ "$(docker ps -q -a -f name=$AUTH_SERVER_CONTAINER_NAME)" ]; then
    docker start "$AUTH_SERVER_CONTAINER_NAME"
    echo "Existing auth server container '$AUTH_SERVER_CONTAINER_NAME' started."
  else
    docker run -d \
      --name "$AUTH_SERVER_CONTAINER_NAME" \
      -p "$AUTHENTIK_PORT":9000 \
      -e AUTHENTIK_LOG_LEVEL=debug \
      -e AUTHENTIK_REDIS__HOST=host.docker.internal \
      -e AUTHENTIK_ERROR_REPORTING__ENABLED=true \
      -e AUTHENTIK_POSTGRESQL__HOST=host.docker.internal \
      -e AUTHENTIK_POSTGRESQL__USER="$POSTGRES_USER" \
      -e AUTHENTIK_POSTGRESQL__NAME="$POSTGRES_DB" \
      -e AUTHENTIK_POSTGRESQL__PASSWORD="$POSTGRES_PASSWORD" \
      -e AUTHENTIK_SECRET_KEY="$AUTHENTIK_SECRET_KEY" \
      ghcr.io/goauthentik/server:2024.10.5 \
      server && echo "Auth server container '$AUTH_SERVER_CONTAINER_NAME' was successfully created."
  fi
fi

# Start auth-worker if not running
if [ "$(docker ps -q -f name=$AUTH_WORKER_CONTAINER_NAME)" ]; then
  echo "Auth worker container '$AUTH_WORKER_CONTAINER_NAME' is already running."
else
  if [ "$(docker ps -q -a -f name=$AUTH_WORKER_CONTAINER_NAME)" ]; then
    docker start "$AUTH_WORKER_CONTAINER_NAME"
    echo "Existing auth worker container '$AUTH_WORKER_CONTAINER_NAME' started."
  else
    docker run -d \
      --name "$AUTH_WORKER_CONTAINER_NAME" \
      -e AUTHENTIK_LOG_LEVEL=debug \
      -e AUTHENTIK_REDIS__HOST=host.docker.internal \
      -e AUTHENTIK_ERROR_REPORTING__ENABLED=true \
      -e AUTHENTIK_POSTGRESQL__HOST=host.docker.internal \
      -e AUTHENTIK_POSTGRESQL__USER="$POSTGRES_USER" \
      -e AUTHENTIK_POSTGRESQL__NAME="$POSTGRES_DB" \
      -e AUTHENTIK_POSTGRESQL__PASSWORD="$POSTGRES_PASSWORD" \
      -e AUTHENTIK_SECRET_KEY="$AUTHENTIK_SECRET_KEY" \
      ghcr.io/goauthentik/server:2024.10.5 \
      worker && echo "Auth worker container '$AUTH_WORKER_CONTAINER_NAME' was successfully created."
  fi
fi 