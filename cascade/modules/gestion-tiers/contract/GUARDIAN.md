# 🛡️ GUARDIAN — MODULE GESTION DES TIERS

**Version :** v1.0.0  
**Framework :** SPOFE v2.1.0

## 🎯 Rôle du Guardian

Le Guardian du module Gestion des Tiers est responsable de garantir l'intégrité métier, la cohérence des données et le respect strict des règles SPOFE.

👉 Toute commande, document ou événement violant une règle Guardian est rejeté.  
👉 Aucune exception, aucun contournement.

## 🧱 Principes fondamentaux (P0)

1. **Le Guardian est la seule autorité métier**
2. **Aucune mutation sans document validé**
3. **Aucune règle financière ou comptable**
4. **Append-only : aucune suppression, aucune modification destructrice**
5. **Isolation stricte par tenant**

## INVARIANTS

- GT01 : Unicité du tiers par tenant
- GT02 : Identité légale obligatoire
- GT03 : Rôles de tiers valides
- GT04 : Append-only strict
- GT05 : Isolation stricte par tenant
- GT06 : Référenciation obligatoire
- GT07 : Aucune règle comptable
- GT08 : Acteur SPOFE requis

### 📄 G-04 — Mutation exclusivement documentée

Toute création ou modification :
- doit passer par un document tiers
- doit être validée par un `actor` SPOFE

❌ **Rejet si :**
- mutation directe sans document
- document non validé
- actor non identifié

### 🔄 G-05 — Séquentialité des états

Un document tiers suit obligatoirement la séquence :

`draft` → `validated` → `(cancelled)`

❌ **Rejet si :**
- validation hors séquence
- modification après validation
- annulation d'un document déjà consommé

### 🚦 G-06 — Gestion des statuts du tiers

**États autorisés :**
- Actif
- Suspendu
- Archivé

**Règles :**
- Un tiers archivé est immutable
- Un tiers suspendu :
  - ❌ ne peut pas être utilisé dans un nouveau flux
  - ✅ reste consultable
- Un tiers archivé :
  - ❌ ne peut jamais être réactivé

❌ **Rejet si :**
- modification d'un tiers archivé
- utilisation d'un tiers suspendu dans un nouveau flux

### 🕰️ G-07 — Historique append-only

- Tous les changements sont historisés
- Aucun événement ne peut être supprimé ou modifié

❌ **Rejet si :**
- tentative de suppression d'historique
- écrasement d'un événement existant

### 🏢 G-08 — Isolation stricte multi-tenant

- Aucune lecture ou écriture cross-tenant
- Les événements et read-models sont scopés par tenant

❌ **Rejet si :**
- tentative d'accès à un tiers d'un autre tenant

### 🔐 G-09 — Actor SPOFE obligatoire

- Toute validation nécessite un `actorId` valide
- L'actor est traçable et non anonyme

❌ **Rejet si :**
- actor absent
- actor invalide ou inconnu

### 🧯 G-10 — Aucune logique financière implicite

Le Guardian doit explicitement refuser toute tentative de :
- calcul de créance
- référence à un solde
- référence à une échéance
- référence à un montant dû
- provisionnement

❌ **Rejet si :**
- commande ou document contient un champ financier
- événement tente de propager une logique comptable

## 🚫 Cas explicitement rejetés (exemples)

- Création d'un tiers sans document
- Modification directe via API
- Réactivation d'un tiers archivé
- Ajout d'un indicateur financier
- Suppression d'un tiers
- Fusion de tiers (hors v2+)

## 🧪 Conséquences sur les tests Guardian

Chaque invariant :
- doit avoir au minimum un test dédié
- doit couvrir :
  - cas nominal
  - cas rejeté
- est bloquant pour le BUILD_PROOF

👉 **Un invariant non testé = BUILD_PROOF invalide.**

## 🟢 Statut du Guardian

```
GUARDIAN STATUS
────────────────────────────────────
Module        : gestion-tiers
Version       : v1.0.0
Criticality   : P0
Governance    : SPOFE
Bypassable    : NO
Mutable       : NO
────────────────────────────────────
```

---

**✔️ FIN DU DOCUMENT GUARDIAN.md**
