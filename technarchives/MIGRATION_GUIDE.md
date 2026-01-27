# Système de Migration SPOFE

Ce document décrit le nouveau système de migration pour l'application SPOFE.

## Structure des Migrations

Les migrations sont stockées dans le dossier `src/database/migrations/` et suivent la convention de nommage suivante :
- `001-nom-de-la-migration.js`
- `002-autre-migration.js`
- etc.

Chaque fichier de migration doit exporter deux fonctions :
- `up` : Pour appliquer la migration
- `down` : Pour annuler la migration

## Commandes Disponibles

### Appliquer les migrations
```bash
npm run db:migrate:new
```

### Voir l'état des migrations
```bash
npm run db:migrate:status:new
```

### Réinitialiser le suivi des migrations
```bash
npm run db:migrate:reset:new
```

## Bonnes Pratiques

1. **Transactions** : Toutes les opérations dans les migrations doivent être encapsulées dans des transactions
2. **Idempotence** : Les migrations doivent pouvoir être exécutées plusieurs fois sans erreur
3. **Rollback** : Toujours fournir une fonction `down` pour annuler les changements
4. **Documentation** : Documenter clairement le but de chaque migration
5. **Tests** : Tester les migrations dans un environnement de développement avant de les exécuter en production

## Exemple de Migration

```javascript
export async function up(queryInterface, Sequelize, { transaction }) {
  await queryInterface.createTable('NouvelleTable', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    // autres champs...
  }, { transaction });
}

export async function down(queryInterface, Sequelize, { transaction }) {
  await queryInterface.dropTable('NouvelleTable', { transaction });
}
```

## Dépannage

### Erreurs de migration
1. Vérifiez les logs pour identifier l'erreur exacte
2. Assurez-vous que la base de données est accessible
3. Vérifiez que les tables n'existent pas déjà

### Réinitialisation complète
Pour une réinitialisation complète :
1. Exécutez `npm run db:migrate:reset:new`
2. Exécutez `npm run db:migrate:new`

## Sécurité

- Ne modifiez jamais une migration après son exécution en production
- Toujours sauvegarder la base de données avant d'exécuter des migrations
- Vérifiez les migrations dans un environnement de test avant la production
