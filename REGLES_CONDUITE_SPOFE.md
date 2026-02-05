# 🚨 RÈGLES DE CONDUITE SPOFE v2.1

**Date de mise à jour :** 2 février 2026  
**Version :** 2.1.0-CHIRURGIE-IMMOBILISATION  
**Statut :** OBLIGATOIRE - BUILD_PROOF BLOCKING  

---

## 🔒 RÈGLES DE SÉCURITÉ ÉVÉNEMENTIELLE

### ❗ EVENT STANDARD CANONIQUE

**Tout Event métier DOIT implémenter DomainEvent du kernel.**

```typescript
// ✅ CONFORME
export interface AssetCreatedPayload {
  assetId: string;
  tenantId: string;
  // ... autres propriétés
}

export const createAssetCreatedEvent = (params: {
  assetId: string;
  tenantId: string;
  actorId: string;
  payload: AssetCreatedPayload;
}): DomainEvent<AssetCreatedPayload> =>
  createDomainEvent({
    eventType: 'IMMOBILISATION_ASSET_CREATED',
    aggregateId: params.assetId,
    tenantId: params.tenantId,
    actorId: params.actorId,
    payload: params.payload,
  });

// ❌ INTERDIT
interface CustomEvent {
  assetId: string;
  createdAt: Date; // ❌ manque metadata obligatoires
}
```

### 🔴 VIOLATIONS DE BUILD_PROOF

**Toute redéfinition locale invalide le BUILD_PROOF automatiquement.**

Les violations suivantes déclenchent un **ROLLBACK AUTOMATIQUE** :

1. **Events sans metadata complètes**
2. **Factory sans tenantId obligatoire**  
3. **Propriétés manquantes (eventId, eventType, aggregateId, occurredAt)**

---

## 📋 PROPRIÉTÉS OBLIGATOIRES DOMAINEVVENT

### 🎯 Interface standard

```typescript
export interface DomainEvent<TPayload = unknown> {
  readonly eventId: string;        // ✅ UUID obligatoire
  readonly eventType: string;      // ✅ Stable, versionnable
  readonly aggregateId: string;    // ✅ Clé métier, pas technique
  readonly occurredAt: Date;       // ✅ Timestamp précis

  readonly metadata: {
    tenantId: string;              // ✅ OBLIGATOIRE P0
    actorId?: string;              // ✅ Traçabilité
    correlationId?: string;        // ✅ Chaînage
    causationId?: string;          // ✅ Causalité
    version?: number;              // ✅ Evolution
  };

  readonly payload: TPayload;      // ✅ Jamais vide
}
```

### ⚠️ Règles NON NÉGOCIABLES

| **Propriété** | **Exigence** | **Contrôle** |
|---------------|--------------|--------------|
| **eventType** | String stable, versionnable | BUILD_PROOF |
| **metadata.tenantId** | Obligatoire | GUARDIAN P0 |
| **payload** | Jamais vide | GUARDIAN P0 |
| **aggregateId** | Clé métier, pas technique | GUARDIAN P0 |

---

## 🧪 VALIDATION BUILD_PROOF

### ✅ Tests obligatoires

```bash
# Guardian 100% OK
npm test -- --testPathPatterns=".*guardian.*spec.ts"

# Repository compile
npx tsc --noEmit [module]/write/repository/*.ts

# Aucune erreur Events
npx tsc --noEmit [module]/domain/events.ts
```

### 📊 Métriques de validation

| **Composant** | **Seuil minimum** | **Tolérance** |
|---------------|-------------------|---------------|
| **Guardian tests** | 100% passing | 0 échec |
| **Repository** | 0 erreur TS | 0 warning |
| **Events** | 0 erreur TS | 0 warning |

---

## 🚑 PROCÉDURE D'URGENCE

### 🔥 En cas de violation

1. **ARRÊT IMMÉDIAT** du module en cours
2. **Correction des Events** selon pattern canonique
3. **Validation Guardian** obligatoire
4. **BUILD_PROOF** uniquement après validation complète

### 📋 Checklist correction

- [ ] Interface DomainEvent implémentée
- [ ] Factory createDomainEvent utilisée
- [ ] metadata.tenantId présent
- [ ] Tests Guardian 100% OK
- [ ] Repository compile sans erreur
- [ ] Aucune redéfinition locale d'Events

---

## 🎯 RESPONSABILITÉS

### 👥 Équipes

| **Rôle** | **Responsabilité** |
|----------|-------------------|
| **Dev Module** | Implémenter pattern DomainEvent canonique |
| **Guardian** | Valider invariants métier P0 |
| **BUILD_PROOF** | Bloquer si non-conformité Events |

### 🔍 Contrôles

- **Pre-commit :** Validation EventTypes
- **CI/CD :** Tests Guardian obligatoires  
- **BUILD_PROOF :** Compilation Events sans erreur

---

**🔴 RAPPEL CRITIQUE :** 
*Ces règles sont la conséquence directe de la panne du 2 février 2026 sur le module Immobilisation. Leur non-respect expose l'écosystème SPOFE entier à des pannes systémiques.*

---

**Fin des règles SPOFE — Gouvernance technique stricte**