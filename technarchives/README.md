# SPOFE Application

Application de gestion SPOFE avec authentification sécurisée.

## Configuration

1. Copiez le fichier .env.example vers .env et configurez les variables d'environnement :
   \\\ash
   cp .env.example .env
   \\\

2. Installez les dépendances :
   \\\ash
   npm install
   \\\

3. Assurez-vous que votre base de données est configurée et que les migrations ont été exécutées.

4. Démarrez le serveur en mode développement :
   \\\ash
   npm run dev
   \\\

## Sécurité

L'application inclut les fonctionnalités de sécurité suivantes :
- Protection contre les attaques par force brute
- Validation des entrées utilisateur
- En-têtes de sécurité HTTP
- Journalisation des événements de sécurité
- Gestion des erreurs centralisée

## Fichiers de logs

Les fichiers de logs sont stockés dans le dossier \logs/\ :
- \combined.log\ : Tous les logs
- \rror.log\ : Erreurs uniquement
- \security.log\ : Événements de sécurité

## Variables d'environnement

Voir le fichier \.env.example\ pour la liste complète des variables d'environnement.
