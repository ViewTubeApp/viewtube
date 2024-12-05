#!/usr/bin/env bash
# Use this script to start a docker container for a local development RabbitMQ instance

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-rabbitmq.sh`

# On Linux and macOS you can run this script directly - `./start-rabbitmq.sh`

RABBITMQ_CONTAINER_NAME="viewtube-rabbitmq"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

if [ "$(docker ps -q -f name=$RABBITMQ_CONTAINER_NAME)" ]; then
  echo "RabbitMQ container '$RABBITMQ_CONTAINER_NAME' is already running."
  exit 0
fi

if [ "$(docker ps -q -a -f name=$RABBITMQ_CONTAINER_NAME)" ]; then
  docker start "$RABBITMQ_CONTAINER_NAME"
  echo "Existing RabbitMQ container '$RABBITMQ_CONTAINER_NAME' started."
  exit 0
fi

# Import environment variables from .env
set -a
source .env

# Set default values if variables are not set
RABBITMQ_HOST="${RABBITMQ_HOST:-localhost}"
RABBITMQ_PORT="${RABBITMQ_PORT:-5672}"
RABBITMQ_USER="${RABBITMQ_USER:-guest}"
RABBITMQ_PASSWORD="${RABBITMQ_PASSWORD:-guest}"

docker run -d \
  --name "$RABBITMQ_CONTAINER_NAME" \
  -p "$RABBITMQ_PORT":5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER="$RABBITMQ_USER" \
  -e RABBITMQ_DEFAULT_PASS="$RABBITMQ_PASSWORD" \
  rabbitmq:management && echo "RabbitMQ container '$RABBITMQ_CONTAINER_NAME' was successfully created." 