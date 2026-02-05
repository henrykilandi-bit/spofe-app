-- =====================================================
-- Immobilisation Module - Full Schema
-- Conformité: READ_MODELS.md v1.0.0
-- 
-- Ce fichier regroupe toutes les migrations pour
-- faciliter le déploiement initial.
-- =====================================================

-- Include migrations in order
\i 001_create_tables_write_side.sql
\i 002_create_read_models.sql
\i 003_create_rls_security.sql
