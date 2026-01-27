const { Sequelize } = require('sequelize');
const config = require('./config').db; // Accéder directement à la configuration de la base de données

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    define: {
      ...config.define,
      // S'assurer que les timestamps sont correctement configurés
      timestamps: true,
      // Utiliser les noms de colonnes avec des underscores
      underscored: true,
      // Ne pas ajouter de 's' aux noms de tables
      freezeTableName: true
    },
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

// Tester la connexion à la base de données
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
    return true;
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection
};
