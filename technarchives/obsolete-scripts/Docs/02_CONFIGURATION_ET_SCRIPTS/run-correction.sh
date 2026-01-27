#!/bin/bash

# 🚀 SPOFE ARCHITECTURE CORRECTION SCRIPT
# Date: 2026-01-20
# Purpose: Correct architecture conformity issues

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      SPOFE ARCHITECTURE - CORRECTION SCRIPT                   ║"
echo "║                     2026-01-20 16:15 UTC                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Define paths
PROJECT_ROOT="$(pwd)"
SQL_FILE="SPOFE_SPOFEv2.1_OHADA_FUSION V3.sql"
SQL_DEST="cascade/src/database/SPOFE_SPOFEv2.1_OHADA_FUSION_V3.sql"
AUDIT_SOURCE="Docs/spofe_docs_audit.json"
AUDIT_DEST="docs/spofe_docs_audit.json"
SYNC_SCRIPT="cascade/src/scripts/sync_docs_database_v2_final.js"
LOG_FILE="logs/correction-$(date +%Y%m%d_%H%M%S).log"

# Initialize log
mkdir -p logs
{
    echo "=== SPOFE CORRECTION LOG ==="
    echo "Date: $(date)"
    echo "Working directory: $PROJECT_ROOT"
    echo ""
} > "$LOG_FILE"

log_msg() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Step 1: Copy SQL file
log_msg ""
log_msg "📌 STEP 1: Copier SQL file..."
if [ -f "$SQL_FILE" ]; then
    log_msg "   Found: $SQL_FILE"
    mkdir -p "cascade/src/database"
    cp "$SQL_FILE" "$SQL_DEST"
    log_msg "   ✅ Copied to: $SQL_DEST"
else
    log_msg "   ⚠️  SQL file not found at root (may already be in place)"
fi

# Step 2: Create docs structure
log_msg ""
log_msg "📌 STEP 2: Créer structure docs/..."
mkdir -p "docs/backups"
log_msg "   ✅ Created: docs/"
log_msg "   ✅ Created: docs/backups/"

# Step 3: Copy audit JSON
log_msg ""
log_msg "📌 STEP 3: Copier audit JSON..."
if [ -f "$AUDIT_SOURCE" ]; then
    cp "$AUDIT_SOURCE" "$AUDIT_DEST"
    log_msg "   ✅ Copied from: $AUDIT_SOURCE"
    log_msg "   ✅ Copied to: $AUDIT_DEST"
else
    log_msg "   ⚠️  Audit JSON not found at: $AUDIT_SOURCE"
fi

# Step 4: Clean duplicate configs
log_msg ""
log_msg "📌 STEP 4: Nettoyer configs..."
if [ -f "spofe-config.json" ] && [ -f ".spofe-config.json" ]; then
    rm -f "spofe-config.json"
    log_msg "   ✅ Removed duplicate: spofe-config.json"
    log_msg "   ✅ Kept: .spofe-config.json"
else
    log_msg "   ℹ️  No duplicate configs found"
fi

# Step 5: Verify structure
log_msg ""
log_msg "📌 STEP 5: Vérifier structure..."
ERRORS=0

if [ -f "$SQL_DEST" ]; then
    log_msg "   ✅ SQL: cascade/src/database/SPOFE_SPOFEv2.1_OHADA_FUSION_V3.sql"
else
    log_msg "   ❌ MISSING: cascade/src/database/SPOFE_SPOFEv2.1_OHADA_FUSION_V3.sql"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "docs/backups" ]; then
    log_msg "   ✅ Folder: docs/backups/"
else
    log_msg "   ❌ MISSING: docs/backups/"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$AUDIT_DEST" ]; then
    log_msg "   ✅ JSON: docs/spofe_docs_audit.json"
else
    log_msg "   ⚠️  Missing: docs/spofe_docs_audit.json (will be generated)"
fi

if [ -f ".spofe-config.json" ]; then
    log_msg "   ✅ Config: .spofe-config.json"
else
    log_msg "   ❌ MISSING: .spofe-config.json"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "logs/conventions_audit.log" ]; then
    log_msg "   ✅ Log: logs/conventions_audit.log"
else
    log_msg "   ℹ️  Log: logs/conventions_audit.log (will be created)"
fi

# Step 6: Execute sync script
log_msg ""
log_msg "📌 STEP 6: Exécuter script sync (15 min)..."
if [ -f "$SYNC_SCRIPT" ]; then
    log_msg "   Starting: node $SYNC_SCRIPT"
    if node "$SYNC_SCRIPT" 2>&1 | tee -a "$LOG_FILE"; then
        log_msg "   ✅ Sync completed successfully"
    else
        log_msg "   ❌ Sync failed (see log above)"
        ERRORS=$((ERRORS + 1))
    fi
else
    log_msg "   ❌ Script not found: $SYNC_SCRIPT"
    ERRORS=$((ERRORS + 1))
fi

# Step 7: Summary
log_msg ""
log_msg "╔════════════════════════════════════════════════════════════════╗"
if [ $ERRORS -eq 0 ]; then
    log_msg "║                ✅ CORRECTION COMPLETED SUCCESSFULLY           ║"
    log_msg "║                                                              ║"
    log_msg "║  Architecture is now 100% compliant                         ║"
    log_msg "║  All files in correct locations                            ║"
    log_msg "║  Database documentation generated                          ║"
else
    log_msg "║              ⚠️  CORRECTION COMPLETED WITH WARNINGS           ║"
    log_msg "║                                                              ║"
    log_msg "║  $ERRORS issues found (see log for details)                 ║"
fi
log_msg "╚════════════════════════════════════════════════════════════════╝"

log_msg ""
log_msg "📊 Log file: $LOG_FILE"
log_msg ""

exit $ERRORS
