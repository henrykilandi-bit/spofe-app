#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
echo "🧠 Audit SPOFE (frontend)..."
npm run spofe:audit || {
  echo "🚫 Push bloqué : incohérences détectées."
  echo "📋 Consultez ./logs/conventions_audit.log"
  exit 1
}
echo "✅ Audit réussi. Push autorisé."
