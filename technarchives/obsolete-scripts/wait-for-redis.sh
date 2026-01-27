#!/bin/bash
# wait-for-redis.sh
# Attendre que Redis soit disponible avant de continuer
# Usage: ./wait-for-redis.sh [host] [port] [timeout]

HOST=${1:-127.0.0.1}
PORT=${2:-6379}
TIMEOUT=${3:-60}

echo "⏳ Attente Redis ($HOST:$PORT, max ${TIMEOUT}s)..."

timeout_counter=$TIMEOUT
while ! redis-cli -h "$HOST" -p "$PORT" ping > /dev/null 2>&1; do
  if [ "$timeout_counter" -le 0 ]; then
    echo "❌ Redis non disponible après ${TIMEOUT}s"
    exit 1
  fi
  
  echo "⏳ Redis non encore prêt, attente 2s... (${timeout_counter}s restantes)"
  sleep 2
  timeout_counter=$((timeout_counter - 2))
done

echo "✅ Redis prêt ! ($HOST:$PORT)"
exit 0
