#!/bin/bash
# wait-for-mysql.sh
# Attendre que MySQL soit disponible avant de continuer
# Usage: ./wait-for-mysql.sh [host] [port] [timeout]

HOST=${1:-127.0.0.1}
PORT=${2:-3306}
TIMEOUT=${3:-60}

echo "⏳ Attente MySQL ($HOST:$PORT, max ${TIMEOUT}s)..."

timeout_counter=$TIMEOUT
while ! nc -z "$HOST" "$PORT" 2>/dev/null; do
  if [ "$timeout_counter" -le 0 ]; then
    echo "❌ MySQL non disponible après ${TIMEOUT}s"
    exit 1
  fi
  
  echo "⏳ MySQL non encore prêt, attente 2s... (${timeout_counter}s restantes)"
  sleep 2
  timeout_counter=$((timeout_counter - 2))
done

echo "✅ MySQL prêt ! ($HOST:$PORT)"
exit 0
