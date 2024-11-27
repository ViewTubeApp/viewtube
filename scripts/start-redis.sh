#!/usr/bin/env bash
# Use this script to start a docker container for a local development Redis instance

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-redis.sh`

# On Linux and macOS you can run this script directly - `./start-redis.sh`

REDIS_CONTAINER_NAME="viewtube-redis"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

if [ "$(docker ps -q -f name=$REDIS_CONTAINER_NAME)" ]; then
  echo "Redis container '$REDIS_CONTAINER_NAME' is already running."
  exit 0
fi

if [ "$(docker ps -q -a -f name=$REDIS_CONTAINER_NAME)" ]; then
  docker start "$REDIS_CONTAINER_NAME"
  echo "Existing Redis container '$REDIS_CONTAINER_NAME' started."
  exit 0
fi

# Import environment variables from .env
set -a
source .env

# Set default values if variables are not set
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-password}"

if [ -z "$REDIS_PASSWORD" ] || [ "$REDIS_PASSWORD" = "password" ]; then
  echo "You are using the default or empty Redis password."
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Generate a random URL-safe password
    REDIS_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
    # Update the .env file with the new password
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' -e "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" .env
    else
      sed -i -e "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" .env
    fi
    echo "REDIS_PASSWORD updated in .env file."
  else
    echo "Please set a secure password in the .env file and try again."
    exit 1
  fi
fi

if [ -n "$REDIS_PASSWORD" ]; then
  docker run -d \
    --name "$REDIS_CONTAINER_NAME" \
    -p "$REDIS_PORT":6379 \
    redis redis-server --requirepass "$REDIS_PASSWORD" && echo "Redis container '$REDIS_CONTAINER_NAME' was successfully created."
else
  docker run -d \
    --name "$REDIS_CONTAINER_NAME" \
    -p "$REDIS_PORT":6379 \
    redis && echo "Redis container '$REDIS_CONTAINER_NAME' was successfully created."
fi
