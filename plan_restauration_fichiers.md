# Plan De Restauration Des Fichiers

Date : 17 avril 2026
Projet : `D:\SPOFE-APP VERS 1.0`

## Objectif

Ce document propose un plan de restauration pour remettre le dépôt SPOFE dans un état cohérent, exécutable et documenté.

Le but n'est pas seulement de remettre des fichiers "manquants", mais de :

- réaligner les scripts avec les fichiers réellement utilisés ;
- décider quels fichiers archivés doivent être restaurés ;
- corriger les chemins cassés dans la documentation ;
- supprimer les ambiguïtés entre fichiers actifs et fichiers obsolètes.

## Rapport Priorisé

### Critique

Les éléments ci-dessous bloquent directement l'exécution, les tests ou la fiabilité du dépôt.

| Fichier | Problème exact | Action |
|---|---|---|
| `package.json` | `test:system` pointait vers `system-tests/` absent | Corriger le script pour utiliser une vraie config système |
| `jest.system.config.js` | Fichier absent alors qu'un besoin de tests système est annoncé | Recréer la config |
| `tests/integration/guardian-db.spec.ts` | Import mort vers `src/application/decision/TransactionManager` et contrat de retour obsolète | Repointer vers `src/application/transaction/TransactionManager` et réaligner les assertions |
| `cascade/modules/comptabilite/src/read-models/projections/index.ts` | Export cassé vers `AccountingPeriodProjection.js` absent | Corriger l'export vers le module TypeScript existant |
| `src/api/http/server.ts` | Lit `DATABASE_URL` seulement, en décalage avec `.env` | Supporter `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` et `DB_NAME` |
| `package.json` | Dépendances runtime manquantes pour le serveur HTTP (`fastify`, `@fastify/type-provider-typebox`, `pino-pretty`) | À ajouter puis installer |
| `cascade/modules/budgeting/tests/e2e/multi-tenant-rls.e2e.spec.ts` | Dépendance `typeorm` absente et import `supertest` incompatible | Corriger le test et ajouter la dépendance si encore requise |

### Important

Les éléments ci-dessous n'empêchent pas tous les workflows, mais créent une documentation trompeuse ou des comportements instables.

| Fichier | Problème exact | Action |
|---|---|---|
| `README.md` | Lien cassé vers `README_ARCHITECTURE_MODULAIRE.md` et métriques non vérifiées | Corriger les liens et neutraliser les promesses non validées |
| `.env.example` | Utilise `DB_NAME` alors que `.env` utilise `DB_DATABASE` | Harmoniser les variables et documenter `DATABASE_URL` |
| `tests/constitutionnel/ConstitutionalDefenseLevel2.spec.ts` | Le test attend un objet alors que `getDefenseStatus()` retourne un tableau | Réaligner l'assertion sur le contrat réel |
| `jest.e2e.config.js` | Couvre trop de suites hétérogènes et remonte des échecs de modules non prêts | Segmenter davantage les campagnes de tests |
| `README.md`, `USAGE.md`, `PRODUCTION.md` | Décrivent un état plus stable que celui réellement vérifié | Mettre à jour les workflows annoncés |

### Cosmétique

Les éléments ci-dessous n'empêchent pas l'exécution mais entretiennent du bruit ou de l'ambiguïté.

| Fichier | Problème exact | Action |
|---|---|---|
| `README.md` | Présentation très marketing par rapport à l'état actuel | Recentrer sur l'état fonctionnel réel |
| `obsolete/` | Présence de nombreux artefacts historiques et doublons documentaires | Classer ce qui reste archivé vs restaurable |
| `plan_restauration_fichiers.md` | Plan initial générique, sans liste opérationnelle par fichier | Transformer en rapport d'exécution priorisé |

## Corrections Déjà Lancées

- correction du script `test:system` ;
- ajout de `jest.system.config.js` ;
- correction de l'import et des assertions obsolètes dans `tests/integration/guardian-db.spec.ts` ;
- correction de l'export cassé dans `cascade/modules/comptabilite/src/read-models/projections/index.ts` ;
- harmonisation initiale entre `.env.example` et `src/api/http/server.ts` ;
- correction des liens faux et des métriques non vérifiées dans `README.md`.

## Principes De Restauration

Avant toute restauration, appliquer les principes suivants :

- ne pas restaurer automatiquement tout le contenu de `obsolete/` ;
- privilégier la mise à jour des chemins actifs plutôt qu'un retour massif d'anciens fichiers ;
- restaurer uniquement les fichiers encore utiles au fonctionnement actuel ;
- documenter clairement chaque déplacement ou remplacement ;
- vérifier après chaque étape que les scripts npm et les docs restent cohérents.

## Priorités

Le plan est organisé en trois niveaux :

- Priorité 1 : remettre les commandes critiques dans un état cohérent ;
- Priorité 2 : réaligner la documentation et les workflows ;
- Priorité 3 : nettoyer et clarifier définitivement l'archive `obsolete/`.

## Priorité 1 - Rendre Le Dépôt Exécutable

### 1. Corriger Les Scripts Cassés Dans `package.json`

Les scripts ci-dessous pointent vers des fichiers absents ou vers des chemins dépassés :

- `test:e2e`
- `test:system`
- `build-proof`
- `update-governance`
- `update-governance-dry`
- `validate:fce`
- `validate:fce:strict`
- `sync:commands`
- `sync:read-models`
- `validate:alignment`

### Action attendue

Pour chaque script, choisir l'une des trois stratégies :

- repointer vers un fichier déjà existant ;
- recréer le fichier dans l'emplacement attendu ;
- désactiver temporairement le script s'il n'est plus utilisé.

### Recommandation

Privilégier les corrections suivantes :

| Script | Situation actuelle | Action recommandée |
|---|---|---|
| `build-proof` | `generate-build-proof.ts` absent à la racine | Repointage vers `tools/build-proof/generate-build-proof.ts` ou `tools/build-proof-global/index.ts` selon l'usage visé |
| `update-governance` | Fichier absent à la racine | Vérifier si la logique doit être restaurée depuis `obsolete/update-governance-rules.ts` ou retirée |
| `validate:fce` | Fichier absent | Vérifier si la validation FCE est encore active ; sinon retirer le script |
| `sync:commands` | Fichier absent | Restaurer seulement si le pipeline OpenAPI est encore utilisé |
| `sync:read-models` | Fichier absent | Restaurer seulement si le pipeline OpenAPI est encore utilisé |
| `validate:alignment` | Fichier absent | Restaurer seulement si l'alignement OpenAPI reste une exigence active |
| `test:e2e` | Config absente | Recréer `jest.e2e.config.js` ou désactiver le script |
| `test:system` | Dossier `system-tests/` absent | Repointer vers le bon dossier de tests ou désactiver le script |

### Livrable attendu

- un `package.json` sans scripts cassés ;
- aucun script npm pointant vers un fichier absent.

## Priorité 1 - Vérifier Les Configurations De Test

### Fichiers à traiter

- `jest.e2e.config.js`
- `system-tests/`

### Action attendue

- vérifier si les tests e2e et système existent encore sous une autre forme ;
- si oui, recréer la configuration manquante ;
- sinon, retirer ou renommer les scripts pour éviter une fausse promesse dans `package.json`.

### Recommandation

Commencer par recenser :

- les tests présents dans `tests/` ;
- les éventuels tests système présents ailleurs dans le dépôt ;
- les anciennes configs archivées ou renommées.

## Priorité 2 - Réaligner La Documentation

### 1. Corriger `README.md`

Problèmes identifiés :

- lien cassé vers `README_ARCHITECTURE_MODULAIRE.md` ;
- référence à `logs/app.log` non retrouvée à la racine ;
- description partiellement différente de la structure réelle du projet.

### Action recommandée

- remplacer le lien cassé par un document existant ;
- retirer ou corriger la référence à `logs/app.log` ;
- ajuster la section architecture en fonction des dossiers actifs : `src/`, `cascade/`, `frontend/`, `tools/`, `scripts/`.

### 2. Corriger `USAGE.md`

Problèmes identifiés :

- référence à `modules/billing/` alors que `modules/` n'existe pas à la racine ;
- référence à `logs/app.log` non retrouvée.

### Action recommandée

- remplacer `modules/billing/` par le schéma réel utilisé par le projet ;
- corriger les exemples de workflow pour refléter les scripts réellement disponibles ;
- retirer les chemins non existants.

### 3. Corriger `PRODUCTION.md`

Problèmes identifiés :

- commandes `docker-compose` documentées sans fichier `docker-compose` actif à la racine.

### Action recommandée

- vérifier si un fichier Docker de production doit être restauré ;
- sinon, réécrire la section déploiement pour la baser sur les scripts effectivement présents ;
- retirer toute commande non supportée par le dépôt actuel.

### Livrable attendu

- documentation sans liens cassés ;
- exemples de commande alignés sur les fichiers présents ;
- guide d'installation et de production fidèle à l'état réel du dépôt.

## Priorité 2 - Restaurer Ou Abandonner Les Scripts OpenAPI

### Fichiers concernés

- `scripts/validate-fce.mjs`
- `scripts/sync-commands-from-openapi.mjs`
- `scripts/sync-read-models-from-openapi.mjs`
- `scripts/validate-openapi-alignment.mjs`

### Constat

Des versions archivées ont été retrouvées dans `obsolete/`, mais elles ne doivent pas être restaurées sans validation.

### Action attendue

Décider si la chaîne OpenAPI est :

- encore active et stratégique ;
- remplacée par un autre mécanisme ;
- définitivement obsolète.

### Recommandation

Si la chaîne OpenAPI est encore requise :

- restaurer les scripts dans `scripts/` après revue ;
- tester leur compatibilité avec l'état actuel du dépôt ;
- remettre à jour `package.json`.

Si elle n'est plus requise :

- supprimer les scripts npm associés ;
- retirer les mentions correspondantes de la documentation.

## Priorité 3 - Traiter Les Fichiers Archivés

### Dossier concerné

- `obsolete/`

### Action attendue

Classer les fichiers archivés en trois catégories :

- à restaurer ;
- à migrer vers un nouvel emplacement actif ;
- à laisser définitivement en archive.

### Recommandation de classement initial

| Fichier archivé | Décision proposée |
|---|---|
| `obsolete/generate-build-proof.ts` | Ne pas restaurer directement si `tools/build-proof/` couvre déjà le besoin |
| `obsolete/update-governance-rules.ts` | Revoir le besoin métier avant restauration |
| `obsolete/validate-fce.mjs` | Restaurer seulement si le pipeline FCE est encore utilisé |
| `obsolete/sync-commands-from-openapi.mjs` | Restaurer seulement si OpenAPI reste actif |
| `obsolete/sync-read-models-from-openapi.mjs` | Restaurer seulement si OpenAPI reste actif |
| `obsolete/validate-openapi-alignment.mjs` | Restaurer seulement si OpenAPI reste actif |
| `obsolete/README_ARCHITECTURE_MODULAIRE.md` | Soit restaurer, soit remplacer par un document plus récent |

## Priorité 3 - Vérifier Les Fichiers De Pipeline Et D'Outillage

### Fichiers concernés

- `.spofe-config.json`
- `.gitlab-ci.yml`

### Action attendue

Vérifier si leur suppression est volontaire.

### Recommandation

- si GitLab CI n'est plus utilisé, ne pas restaurer `.gitlab-ci.yml` ;
- si `.spofe-config.json` était central pour des scripts internes, reconstituer son rôle avant toute restauration ;
- si ces éléments sont devenus obsolètes, l'indiquer explicitement dans la doc ou dans un changelog technique.

## Ordre D'Exécution Recommandé

1. corriger `package.json` pour supprimer les références cassées ;
2. vérifier et remettre d'aplomb les tests réellement actifs ;
3. décider du sort de la chaîne OpenAPI ;
4. corriger `README.md`, `USAGE.md` et `PRODUCTION.md` ;
5. trier le contenu de `obsolete/` ;
6. documenter les décisions prises.

## Critères De Validation Finale

La restauration sera considérée comme correcte si :

- tous les scripts npm pointent vers des fichiers existants ;
- aucun lien documentaire important n'est cassé ;
- les workflows de build, validation et test annoncés sont réellement exécutables ;
- les archives `obsolete/` ne créent plus d'ambiguïté sur la source officielle ;
- la structure du dépôt est compréhensible sans inspection historique.

## Conclusion

La restauration doit être guidée par la cohérence actuelle du projet, pas par la simple réintégration de tous les fichiers supprimés.

Le dépôt semble avoir subi une réorganisation partielle. Le bon plan consiste donc à :

- réactiver uniquement les éléments encore utiles ;
- supprimer les références mortes ;
- réécrire la documentation pour qu'elle reflète enfin l'état réel du code.
