#!/bin/bash
# =============================================================================
# NetLens installer — a thin wrapper around the Docker compose command.
#
# Usage (on your VPS, inside the netlens folder):
#     sudo ./install.sh                 # same as: docker compose up -d --build
#     sudo ./install.sh up -d           # plain start, no rebuild
# =============================================================================

# =============================================================================
# Run the real compose command (default: up -d --build)
# =============================================================================
if [ "$#" -eq 0 ]; then
    set -- up -d --build
fi

if docker compose version >/dev/null 2>&1; then
    DOCKER_CMD="docker compose"
else
    DOCKER_CMD="docker-compose"
fi

echo "[INFO] Running: $DOCKER_CMD $*"
echo
exec $DOCKER_CMD "$@"
