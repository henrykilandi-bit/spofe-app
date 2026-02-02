📜 UserRoleTransferProcess.contract.md
CONTRAT DE PROCESSUS — SILC
Processus : UserRoleTransfer

Type : Processus transformationnel gouverné
Statut : NORMATIF
Version : 1.0
Portée : SPOFE
Nature : Transfert cross-context à risque

ARTICLE 0 — FONDEMENT CONTRACTUEL

Le processus UserRoleTransfer découle directement des contrats :

User

Role

Context

UserRole

UserRoleAssignmentProcess

UserRoleRevocationProcess

UserRoleModificationProcess

Il ne crée aucun concept nouveau.

📌 Le transfert est considéré comme une opération à haut risque.

ARTICLE 1 — FINALITÉ

Le processus permet de :

transférer un rôle d'un contexte source vers un contexte cible

sans duplication

sans élévation implicite

📌 Le transfert est équivalent contractuellement à :

révocation + assignation atomiques

ARTICLE 2 — PRÉCONDITIONS STRICTES

Le transfert est autorisé uniquement si :

Le User existe

Le UserRole source existe et est ACTIVE

Le contexte source ≠ contexte cible

Le rôle est autorisé dans le contexte cible

Le demandeur est explicitement habilité

ARTICLE 3 — INTERDICTIONS ABSOLUES

Il est interdit de :

transférer vers plusieurs contextes

créer deux UserRole actifs

transférer un rôle suspendu ou révoqué

contourner les processus Assignment / Revocation

Toute violation est une ContractViolationError.

ARTICLE 4 — DÉROULEMENT GOUVERNÉ

Validation des préconditions

Décision explicite (APPROVED / REJECTED)

Révocation contrôlée (source)

Assignation contrôlée (cible)

Traçabilité complète

📌 Aucun état intermédiaire observable.

ARTICLE 5 — POSTCONDITIONS

Après APPROVED :

ancien UserRole : REVOKED

nouveau UserRole : ACTIVE

unicité garantie

Après REJECTED :

aucun état modifié

ARTICLE 6 — STATUT SILC

Processus :

opposable

auditable

soumis à SILC Guardian
