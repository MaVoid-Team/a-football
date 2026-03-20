#!/usr/bin/env sh
set -eu

# Force classic Docker builder to avoid BuildKit/buildx disk cache growth on VPS.
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0
export BUILDX_BAKE=0

echo "Deploying with classic Docker build (BuildKit disabled)..."
if command -v docker-compose >/dev/null 2>&1; then
	docker-compose up -d --build "$@"
else
	docker compose up -d --build "$@"
fi
