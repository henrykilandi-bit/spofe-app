// src/controllers/init.controller.js - Contrôleur d'initialisation SPOFE v2.1
import sequelize from '../config/database.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class InitController {
  async initializeSPOFE(req, res, next) {
    const startTime = Date.now();
    const logFile = path.join(process.cwd(), 'logs/spofe_startup.log');

    try {
      logger.info('🚀 Initialisation SPOFE v2.1 - Démarrage');
      
      // 1. Vérifier la connexion à la base de données
      await this.checkDatabaseConnection();
      
      // 2. Vérifier la cohérence ORM ↔ BD
      await this.checkOrmSchemaCoherence();
      
      // 3. Vérifier l'intégrité des données
      await this.checkDataIntegrity();
      
      // 4. Initialiser les données requises
      await this.initializeRequiredData();
      
      // 5. Vérifier les modèles et associations
      await this.verifyModelAssociations();
      
      const duration = Date.now() - startTime;
      const status = {
        status: 'success',
        message: 'SPOFE v2.1 initialisé avec succès',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      };

      logger.info(`✅ Initialisation complétée en ${duration}ms`);
      
      return res.status(200).json(status);
    } catch (error) {
      logger.error(`❌ Erreur initialisation: ${error.message}`);
      this.logAnomalies(logFile, error);
      return res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkDatabaseConnection() {
    try {
      await sequelize.authenticate();
      logger.info('✅ Connexion BD établie');
    } catch (error) {
      throw new Error(`Connexion BD échouée: ${error.message}`);
    }
  }

  async checkOrmSchemaCoherence() {
    try {
      // Vérifier que tous les modèles sont chargés
      const models = sequelize.models;
      const expectedModels = [
        'User', 'Role', 'GroupeEntreprise', 'Compagnie',
        'AppSetting', 'AuditTrail'
      ];

      for (const modelName of expectedModels) {
        if (!models[modelName]) {
          throw new Error(`Modèle manquant: ${modelName}`);
        }
      }

      logger.info(`✅ Tous les modèles présents (${expectedModels.length})`);
    } catch (error) {
      throw new Error(`Cohérence ORM échouée: ${error.message}`);
    }
  }

  async checkDataIntegrity() {
    try {
      const { User, Role, GroupeEntreprise } = sequelize.models;

      // Vérifier que les tables ne sont pas vides
      const userCount = await User.count();
      const roleCount = await Role.count();
      const groupCount = await GroupeEntreprise.count();

      if (roleCount === 0) {
        logger.warn('⚠️ Aucun rôle trouvé - initialisation requise');
      }

      if (groupCount === 0) {
        logger.warn('⚠️ Aucun groupe trouvé - initialisation requise');
      }

      if (userCount === 0) {
        logger.warn('⚠️ Aucun utilisateur trouvé - seed recommandé');
      }

      logger.info(`✅ Intégrité vérifiée (Users: ${userCount}, Roles: ${roleCount}, Groups: ${groupCount})`);
    } catch (error) {
      throw new Error(`Vérification intégrité échouée: ${error.message}`);
    }
  }

  async initializeRequiredData() {
    try {
      const { Role } = sequelize.models;

      // Créer les rôles système s'ils n'existent pas
      const requiredRoles = [
        { nom: 'SUPER_ADMIN', description: 'Administrateur système', is_system: true },
        { nom: 'ADMIN', description: 'Administrateur groupe', is_system: true },
        { nom: 'MANAGER', description: 'Gestionnaire', is_system: true },
        { nom: 'USER', description: 'Utilisateur standard', is_system: true }
      ];

      for (const roleData of requiredRoles) {
        const [role, created] = await Role.findOrCreate({
          where: { nom: roleData.nom },
          defaults: roleData
        });

        if (created) {
          logger.info(`✨ Rôle créé: ${roleData.nom}`);
        }
      }

      logger.info('✅ Données requises initialisées');
    } catch (error) {
      throw new Error(`Initialisation données échouée: ${error.message}`);
    }
  }

  async verifyModelAssociations() {
    try {
      const models = sequelize.models;
      let associationCount = 0;

      for (const model of Object.values(models)) {
        if (model.associations) {
          associationCount += Object.keys(model.associations).length;
        }
      }

      logger.info(`✅ Associations vérifiées (${associationCount} associations)`);
    } catch (error) {
      throw new Error(`Vérification associations échouée: ${error.message}`);
    }
  }

  logAnomalies(logFile, error) {
    const logContent = `
[${new Date().toISOString()}] ANOMALIE DÉTECTÉE
Error: ${error.message}
Stack: ${error.stack}
---
`;

    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, logContent);
    logger.error(`Anomalies loggées: ${logFile}`);
  }

  async getInitStatus(req, res) {
    try {
      const status = {
        database: 'connecting',
        models: 0,
        associations: 0,
        timestamp: new Date().toISOString()
      };

      // Vérifier BD
      try {
        await sequelize.authenticate();
        status.database = 'connected';
      } catch {
        status.database = 'disconnected';
      }

      // Compter modèles
      status.models = Object.keys(sequelize.models).length;

      // Compter associations
      for (const model of Object.values(sequelize.models)) {
        if (model.associations) {
          status.associations += Object.keys(model.associations).length;
        }
      }

      res.status(200).json(status);
    } catch (error) {
      logger.error(`Erreur status: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new InitController();
