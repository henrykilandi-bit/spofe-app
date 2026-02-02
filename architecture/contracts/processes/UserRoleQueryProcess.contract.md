📜 UserRoleQueryProcess.contract.md
CONTRAT DE PROCESSUS — SILC
Processus : UserRoleQuery

Type : Processus de lecture gouvernée
Statut : NORMATIF
Version : 1.0
Portée : SPOFE
Nature : Lecture contractuelle opposable

ARTICLE 0 — FONDEMENT CONTRACTUEL

Le processus UserRoleQuery est une conséquence directe des contrats suivants :

User

Role

UserRole

Context

Il ne crée aucun concept nouveau.

Il formalise la lecture gouvernée des relations User ↔ Role, dans un périmètre contractuel strict.

📌 La lecture est considérée comme un acte gouverné, au même titre que l'écriture.

ARTICLE 1 — FINALITÉ

Le processus UserRoleQuery permet :

de lire les rôles d'un utilisateur

de lire les utilisateurs associés à un rôle

de filtrer par contexte

❌ Il ne permet :

aucune modification

aucune agrégation implicite

aucune lecture globale non autorisée

ARTICLE 2 — PRÉCONDITIONS

La lecture n'est autorisée que si :

L'entité cible existe

Le contexte est explicitement fourni

Le demandeur est autorisé à lire ce périmètre

Les UserRole sont dans un état lisible (ACTIVE / REVOKED selon le cas)

ARTICLE 3 — INTERDICTIONS

Il est interdit de :

lire des rôles hors contexte

inférer des droits depuis une lecture

exposer des UserRole supprimés

effectuer une lecture transversale non gouvernée

ARTICLE 4 — POSTCONDITIONS

Les données retournées sont strictement contractuelles

Aucun enrichissement implicite

Aucun état interne exposé

ARTICLE 5 — STATUT SILC

Processus :

opposable

vérifiable

soumis à SILC Guardian
