# SCOPE.md - OIE Module

Définit clairement ce que le module OIE FAIT et ce qu'il NE FAIT PAS.

---

## IN SCOPE

- Lecture des objectifs définis dans le système
- Lecture des indicateurs et leur calcul de performance
- Lecture des événements liés aux objectifs et indicateurs
- Exposition d'APIs READ-ONLY pour consultation des données OIE
- Filtrage multi-tenant des données OIE
- Sérialisation/désérialisation des entités OIE
- Validation de format des requêtes de lecture
- Gestion des permissions de lecture OIE
- Calcul de métriques de performance en temps réel
- Historisation des événements OIE

---

## OUT OF SCOPE

- Création ou modification d'objectifs (responsabilité du module Coaching)
- Gestion financière des objectifs (responsabilité du module Budget)
- Calcul de rentabilité des investissements (responsabilité du module Investisseurs)
- Gestion des utilisateurs et authentification (responsabilité du module Auth)
- Stockage physique des données (responsabilité du module Infrastructure)
- Notification des événements (responsabilité du module Notifications)
- Audit et logs système (responsabilité du module Audit)
- Configuration système globale (responsabilité du module Configuration)
- Interface utilisateur (responsabilité du module Frontend)
- Workflows d'approbation (responsabilité du module Workflow)