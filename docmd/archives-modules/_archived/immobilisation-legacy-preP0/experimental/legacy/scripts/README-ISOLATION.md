# 🔒 ISOLATION: SCRIPTS LEGACY — MODULE IMMOBILISATION

**Date d'isolation** : 2 février 2026  
**Raison** : Code hors périmètre contractuel SPOFE  
**Statut** : 🔴 **HORS SERVICE PRODUCTION**

---

## 📋 RÉSUMÉ

Ces scripts de génération OpenAPI ont été **isolés du périmètre contractuel** car ils sont désormais remplacés par le système de build automatique SPOFE.

## 📂 FICHIERS ISOLÉS

- `generate-openapi.ts` — Générateur OpenAPI manuel (remplacé par build auto)
- `generate-openapi-from-nestjs.ts` — Générateur depuis NestJS (idem)

## ⚠️ IMPORTANT

- **❌ NE PAS utiliser en production**
- **❌ NE PAS modifier ces fichiers** 
- **❌ NE PAS les réintégrer sans validation SPOFE**

## 🔄 RÉVERSIBILITÉ

Pour restaurer (déconseillé) :
```bash
cd cascade/modules/immobilisation
git mv experimental/legacy/scripts/ ./
```

## 📖 CONTEXTE

Ces scripts étaient utilisés en phase de développement pour générer manuellement les spécifications OpenAPI. Avec l'intégration du système SPOFE v1.1.0, la génération est maintenant automatisée et intégrée au pipeline BUILD_PROOF.

**✅ Le module reste GO PROD avec BUILD_PROOF vert**