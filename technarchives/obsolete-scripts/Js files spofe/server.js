const http = require('http');
const app = require('./app');
const { testConnection, sequelize } = require('./config/database');
const config = require('./config/config');

// Créer le serveur HTTP
const server = http.createServer(app);

// Définir le port
const port = config.port || 3001; // Utilise 3001 par défaut

// Tester la connexion à la base de données
const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    console.log('Test de connexion à la base de données...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error(' Impossible de se connecter à la base de données. Arrêt du serveur...');
      process.exit(1);
    }

    // Synchronisation des modèles en développement
    if (config.env === 'development') {
      console.log('Synchronisation des modèles...');
      await sequelize.sync({ alter: true });
      console.log('Modèles synchronisés avec succès.');
    }

    // Démarrer le serveur
server.listen(port, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base de données: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
  } catch (err) {
    console.error('Erreur lors du démarrage du serveur:');
    console.error(err);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Exception non gérée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejet de promesse non géré:', reason);
  process.exit(1);
});

// Démarrer le serveur
startServer();

module.exports = server;
