#!/usr/bin/env node

/**
 * 🔍 ANALYSE DE LA CONFIGURATION BACKEND SPOFE
 * 
 * Vérification de la base de données configurée dans le backend
 * pour identifier la vraie base utilisée par l'application
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

class BackendConfigAnalyzer {
  constructor() {
    this.config = null;
    this.configFile = null;
    this.connection = null;
  }

  async findDatabaseConfig() {
    console.log('🔍 RECHERCHE DE LA CONFIGURATION BASE DE DONNÉES');
    console.log('='.repeat(60));

    const configFiles = [
      '.env',
      'cascade/src/config/database.js',
      'cascade/src/database.js',
      'cascade/config/database.js',
      'config/database.js',
      'src/config/database.js'
    ];

    for (const file of configFiles) {
      try {
        const filePath = path.join(__dirname, file);
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`📄 Fichier trouvé: ${file}`);

        if (file.includes('.env')) {
          this.parseEnvFile(content, file);
          return true;
        } else if (file.includes('.js')) {
          const parsed = this.parseJsConfig(content, file);
          if (parsed) {
            return true;
          }
        }
      } catch (err) {
        // Fichier non trouvé, continuer
      }
    }

    console.log('❌ Configuration de base de données non trouvée');
    return false;
  }

  parseEnvFile(content, filename) {
    console.log(`🔧 Parsing .env: ${filename}`);
    
    const envLines = content.split('\n');
    const envVars = {};
    
    envLines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0 && !key.trim().startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/['"]/g, '');
      }
    });

    this.config = {
      host: envVars.DB_HOST || envVars.DB_HOSTNAME || 'localhost',
      port: parseInt(envVars.DB_PORT || '3306'),
      user: envVars.DB_USER || envVars.DB_USERNAME || 'root',
      password: envVars.DB_PASS || envVars.DB_PASSWORD || '',
      database: envVars.DB_NAME || envVars.DB_DATABASE || ''
    };
    
    this.configFile = filename;
    console.log('✅ Configuration .env parsée avec succès');
  }

  parseJsConfig(content, filename) {
    console.log(`🔧 Parsing JS config: ${filename}`);
    
    // Chercher les patterns de configuration MySQL
    const patterns = [
      /host:\s*['"`]([^'"`]+)['"`]/,
      /port:\s*(\d+)/,
      /user:\s*['"`]([^'"`]+)['"`]/,
      /password:\s*['"`]([^'"`]*)['"`]/,
      /database:\s*['"`]([^'"`]+)['"`]/,
      /DB_HOST['"`]\s*,\s*['"`]([^'"`]+)['"`]/,
      /DB_NAME['"`]\s*,\s*['"`]([^'"`]+)['"`]/
    ];

    let host = 'localhost';
    let port = 3306;
    let user = 'root';
    let password = '';
    let database = '';

    patterns.forEach(pattern => {
      const match = content.match(pattern);
      if (match) {
        if (pattern.source.includes('host')) {
          host = match[1];
        } else if (pattern.source.includes('port')) {
          port = parseInt(match[1]);
        } else if (pattern.source.includes('user')) {
          user = match[1];
        } else if (pattern.source.includes('password')) {
          password = match[1];
        } else if (pattern.source.includes('database')) {
          database = match[1];
        }
      }
    });

    if (database || content.includes('mysql') || content.includes('sequelize')) {
      this.config = { host, port, user, password, database };
      this.configFile = filename;
      console.log('✅ Configuration JS parsée avec succès');
      return true;
    }

    return false;
  }

  async testConnection() {
    if (!this.config) {
      console.log('❌ Aucune configuration à tester');
      return false;
    }

    console.log('\n🔧 CONFIGURATION BACKEND TROUVÉE:');
    console.log('='.repeat(50));
    console.log(`Fichier: ${this.configFile}`);
    console.log(`Host: ${this.config.host}`);
    console.log(`Port: ${this.config.port}`);
    console.log(`User: ${this.config.user}`);
    console.log(`Password: ${this.config.password ? '***' : '(vide)'}`);
    console.log(`Database: ${this.config.database || '(non spécifié)'}`);

    console.log('\n🔍 TEST DE CONNEXION:');
    console.log('-'.repeat(40));

    try {
      this.connection = await mysql.createConnection(this.config);
      console.log('✅ Connexion réussie avec la configuration backend');
      
      // Si une base est spécifiée, la tester
      if (this.config.database) {
        await this.testSpecificDatabase();
      } else {
        await this.listAvailableDatabases();
      }
      
      return true;
      
    } catch (error) {
      console.log(`❌ Échec connexion: ${error.message}`);
      return false;
    }
  }

  async testSpecificDatabase() {
    try {
      await this.connection.execute(`USE \`${this.config.database}\``);
      console.log(`✅ Base de données '${this.config.database}' accessible`);
      
      // Lister les tables
      const [tables] = await this.connection.execute('SHOW TABLES');
      console.log(`📊 Tables dans ${this.config.database}: ${tables.length}`);
      
      if (tables.length > 0) {
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('Tables principales:', tableNames.slice(0, 8).join(', ') + 
                    (tableNames.length > 8 ? '...' : ''));
        
        // Analyser les tables SPOFE
        const spofeTables = tableNames.filter(t => {
          const tableName = t.toLowerCase();
          return tableName.includes('user') || 
                 tableName.includes('role') ||
                 tableName.includes('company') ||
                 tableName.includes('compagnie') ||
                 tableName.includes('groupe') ||
                 tableName.includes('journal') ||
                 tableName.includes('account') ||
                 tableName.includes('audit') ||
                 tableName.includes('security');
        });
        
        console.log(`Tables SPOFE: ${spofeTables.length}`);
        if (spofeTables.length > 0) {
          console.log('Tables SPOFE:', spofeTables.slice(0, 5).join(', ') + 
                      (spofeTables.length > 5 ? '...' : ''));
        }
        
        // Compter les enregistrements
        let totalRecords = 0;
        for (const table of spofeTables.slice(0, 3)) {
          try {
            const [count] = await this.connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
            totalRecords += count[0].count;
          } catch (err) {
            // Ignorer les erreurs
          }
        }
        
        console.log(`Total enregistrements (tables SPOFE): ${totalRecords}`);
      }
      
    } catch (error) {
      console.log(`❌ Base de données '${this.config.database}' non accessible: ${error.message}`);
      
      // Lister les bases disponibles
      await this.listAvailableDatabases();
    }
  }

  async listAvailableDatabases() {
    try {
      const [databases] = await this.connection.execute('SHOW DATABASES');
      const dbList = databases.map(db => db.Database);
      
      console.log('\n📋 BASES DE DONNÉES DISPONIBLES:');
      const relevantDbs = dbList.filter(db => 
        db.toLowerCase().includes('spofe') || 
        db.toLowerCase().includes('app') ||
        !['information_schema', 'mysql', 'performance_schema', 'phpmyadmin', 'sys'].includes(db)
      );
      
      if (relevantDbs.length > 0) {
        console.log('Bases pertinentes:');
        relevantDbs.forEach(db => console.log(`  - ${db}`));
      } else {
        console.log('Aucune base pertinente trouvée');
      }
      
    } catch (error) {
      console.log('❌ Impossible de lister les bases:', error.message);
    }
  }

  async checkEnvironmentVariables() {
    console.log('\n🔍 VÉRIFICATION VARIABLES ENVIRONNEMENT:');
    console.log('-'.repeat(50));
    
    const envVars = [
      'DB_HOST',
      'DB_PORT', 
      'DB_USER',
      'DB_PASS',
      'DB_NAME',
      'DB_HOSTNAME',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_DATABASE'
    ];

    let foundVars = 0;
    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`${varName}: ${varName.includes('PASS') || varName.includes('PASSWORD') ? '***' : value}`);
        foundVars++;
      }
    });

    if (foundVars > 0) {
      console.log(`✅ ${foundVars} variables d'environnement trouvées`);
    } else {
      console.log('❌ Aucune variable d\'environnement pertinente');
    }
  }

  async generateRecommendations() {
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('='.repeat(50));
    
    if (!this.config) {
      console.log('❌ Créer un fichier .env avec la configuration MySQL');
      console.log('Exemple:');
      console.log('DB_HOST=localhost');
      console.log('DB_PORT=3306');
      console.log('DB_USER=root');
      console.log('DB_PASS=');
      console.log('DB_NAME=spofe_dev');
      return;
    }

    if (!this.config.database) {
      console.log('⚠️ Spécifier une base de données dans DB_NAME');
      console.log('Options basées sur l\'analyse:');
      console.log('- spofe_v2_1 (35 tables, score SPOFE: 80/100)');
      console.log('- spofe_dev (base vide, pour développement)');
      console.log('- spofeapp (base vide, alternative)');
    } else {
      console.log(`✅ Configuration semble correcte pour la base: ${this.config.database}`);
      
      if (this.config.database === 'spofe_v2_1') {
        console.log('🎯 Excellente base détectée - structure complète SPOFE');
      } else if (this.config.database === 'spofe_dev') {
        console.log('⚠️ Base de développement vide - envisager migration');
      }
    }
  }

  async run() {
    console.log('🔍 ANALYSE CONFIGURATION BACKEND SPOFE');
    console.log('📋 Identification de la vraie base de données utilisée');
    console.log('');

    // 1. Chercher la configuration
    const configFound = await this.findDatabaseConfig();
    if (!configFound) {
      await this.checkEnvironmentVariables();
      await this.generateRecommendations();
      return false;
    }

    // 2. Tester la connexion
    const connected = await this.testConnection();
    if (!connected) {
      await this.checkEnvironmentVariables();
      await this.generateRecommendations();
      return false;
    }

    // 3. Vérifier les variables d'environnement
    await this.checkEnvironmentVariables();

    // 4. Générer les recommandations
    await this.generateRecommendations();

    // 5. Fermer la connexion
    if (this.connection) {
      await this.connection.end();
    }

    return true;
  }
}

// Point d'entrée
async function main() {
  const analyzer = new BackendConfigAnalyzer();
  const success = await analyzer.run();
  
  if (!success) {
    console.log('\n❌ Analyse échouée - configuration incorrecte');
    process.exit(1);
  }
  
  console.log('\n✅ Analyse configuration terminée');
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur inattendue:', error.message);
    process.exit(1);
  });
}

module.exports = BackendConfigAnalyzer;
