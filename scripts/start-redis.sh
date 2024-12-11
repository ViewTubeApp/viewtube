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
REDIS_PORT="${REDIS_PORT:-6379}"

docker run -d \
  --name "$REDIS_CONTAINER_NAME" \
  -p "$REDIS_PORT":6379 \
  redis:alpine \
  --save 60 1 \
  --loglevel debug && echo "Redis container '$REDIS_CONTAINER_NAME' was successfully created." 