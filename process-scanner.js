const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProcessScanner {
  constructor() {
    this.projectRoot = 'C:\\Users\\henry\\Desktop\\SPOFE-APP VERS 1.0';
    this.issues = [];
    this.warnings = [];
    this.success = [];
    this.scanResults = {
      frontend: {},
      backend: {},
      database: {},
      scripts: {},
      configuration: {},
      dependencies: {}
    };
  }

  log(category, type, message, details = null) {
    const entry = {
      category,
      type, // 'ERROR', 'WARNING', 'SUCCESS', 'INFO'
      message,
      details,
      timestamp: new Date().toISOString()
    };

    if (type === 'ERROR') {
      this.issues.push(entry);
    } else if (type === 'WARNING') {
      this.warnings.push(entry);
    } else if (type === 'SUCCESS') {
      this.success.push(entry);
    }

    console.log(`[${type}] ${category}: ${message}`);
    if (details) {
      console.log(`   Details: ${details}`);
    }
  }

  async scanFrontend() {
    console.log('\n🔍 SCAN FRONTEND...');
    
    try {
      // Vérifier la structure du frontend
      const frontendPath = path.join(this.projectRoot, 'frontend');
      
      if (!fs.existsSync(frontendPath)) {
        this.log('Frontend', 'ERROR', 'Dossier frontend manquant');
        return;
      }

      // Vérifier package.json
      const packageJsonPath = path.join(frontendPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        this.log('Frontend', 'SUCCESS', 'package.json trouvé', `${Object.keys(packageJson.dependencies || {}).length} dépendances`);
      } else {
        this.log('Frontend', 'ERROR', 'package.json manquant');
      }

      // Vérifier les fichiers principaux
      const mainFiles = ['src/App.jsx', 'src/main.jsx', 'src/pages/LoginPage.jsx'];
      mainFiles.forEach(file => {
        const filePath = path.join(frontendPath, file);
        if (fs.existsSync(filePath)) {
          this.log('Frontend', 'SUCCESS', `Fichier principal trouvé: ${file}`);
        } else {
          this.log('Frontend', 'ERROR', `Fichier principal manquant: ${file}`);
        }
      });

      // Vérifier les erreurs de syntaxe dans les fichiers JSX
      try {
        const jsxFolders = ['src/pages', 'src/components', 'src/context'];
        jsxFolders.forEach(folder => {
          const folderPath = path.join(frontendPath, folder);
          if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath);
            files.forEach(file => {
              if (file.endsWith('.jsx')) {
                try {
                  const filePath = path.join(folderPath, file);
                  const content = fs.readFileSync(filePath, 'utf8');
                  
                  // Vérifications de syntaxe de base
                  if (content.includes('await') && !content.includes('async')) {
                    this.log('Frontend', 'WARNING', `Possible await sans async dans: ${file}`);
                  }
                  
                  if (content.includes('console.log')) {
                    this.log('Frontend', 'WARNING', `Console.log trouvé dans: ${file} (à nettoyer pour production)`);
                  }
                  
                } catch (error) {
                  this.log('Frontend', 'ERROR', `Erreur lecture fichier ${file}: ${error.message}`);
                }
              }
            });
          }
        });
      } catch (error) {
        this.log('Frontend', 'ERROR', `Erreur scan syntaxe: ${error.message}`);
      }

      this.scanResults.frontend = {
        status: this.issues.filter(i => i.category === 'Frontend').length === 0 ? 'OK' : 'ERRORS',
        errors: this.issues.filter(i => i.category === 'Frontend').length,
        warnings: this.warnings.filter(i => i.category === 'Frontend').length
      };

    } catch (error) {
      this.log('Frontend', 'ERROR', `Erreur scan frontend: ${error.message}`);
    }
  }

  async scanBackend() {
    console.log('\n🔍 SCAN BACKEND...');
    
    try {
      const backendPath = path.join(this.projectRoot, 'backend');
      
      if (!fs.existsSync(backendPath)) {
        this.log('Backend', 'ERROR', 'Dossier backend manquant');
        return;
      }

      // Vérifier package.json
      const packageJsonPath = path.join(backendPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        this.log('Backend', 'SUCCESS', 'package.json trouvé', `${Object.keys(packageJson.dependencies || {}).length} dépendances`);
      } else {
        this.log('Backend', 'ERROR', 'package.json manquant');
      }

      // Vérifier le fichier principal
      const serverFiles = ['server.js', 'app.js', 'index.js'];
      let serverFound = false;
      serverFiles.forEach(file => {
        const filePath = path.join(backendPath, file);
        if (fs.existsSync(filePath)) {
          this.log('Backend', 'SUCCESS', `Fichier serveur trouvé: ${file}`);
          serverFound = true;
        }
      });

      if (!serverFound) {
        this.log('Backend', 'ERROR', 'Aucun fichier serveur principal trouvé (server.js, app.js, index.js)');
      }

      // Vérifier les dossiers API
      const apiPath = path.join(backendPath, 'api');
      if (fs.existsSync(apiPath)) {
        this.log('Backend', 'SUCCESS', 'Dossier API trouvé');
        
        // Scanner les fichiers API pour les erreurs
        try {
          const apiFiles = fs.readdirSync(apiPath);
          apiFiles.forEach(file => {
            if (file.endsWith('.js')) {
              try {
                const filePath = path.join(apiPath, file);
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Vérifications de base
                if (content.includes('async') && !content.includes('try')) {
                  this.log('Backend', 'WARNING', `Fonction async sans try/catch dans: ${file}`);
                }
                
                if (content.includes('console.log')) {
                  this.log('Backend', 'WARNING', `Console.log trouvé dans: ${file}`);
                }
                
              } catch (error) {
                this.log('Backend', 'ERROR', `Erreur lecture API file ${file}: ${error.message}`);
              }
            }
          });
        } catch (error) {
          this.log('Backend', 'ERROR', `Erreur scan API: ${error.message}`);
        }
      } else {
        this.log('Backend', 'WARNING', 'Dossier API manquant');
      }

      this.scanResults.backend = {
        status: this.issues.filter(i => i.category === 'Backend').length === 0 ? 'OK' : 'ERRORS',
        errors: this.issues.filter(i => i.category === 'Backend').length,
        warnings: this.warnings.filter(i => i.category === 'Backend').length
      };

    } catch (error) {
      this.log('Backend', 'ERROR', `Erreur scan backend: ${error.message}`);
    }
  }

  async scanDatabase() {
    console.log('\n🔍 SCAN DATABASE...');
    
    try {
      // Vérifier les scripts de base de données
      const dbScripts = [
        'setup-database.sql',
        'deploy-precompta.sql',
        'create-database.sql'
      ];
      
      dbScripts.forEach(script => {
        const scriptPath = path.join(this.projectRoot, script);
        if (fs.existsSync(scriptPath)) {
          this.log('Database', 'SUCCESS', `Script SQL trouvé: ${script}`);
          
          // Vérifier la syntaxe SQL de base
          try {
            const content = fs.readFileSync(scriptPath, 'utf8');
            
            // Vérifications SQL
            if (content.includes('DROP DATABASE') && !script.includes('setup-database.sql')) {
              this.log('Database', 'WARNING', `DROP DATABASE trouvé dans: ${script} (dangereux)`);
            }
            
            if (content.includes('-- TODO') || content.includes('-- FIXME')) {
              this.log('Database', 'WARNING', `TODO/FIXME trouvé dans: ${script}`);
            }
            
          } catch (error) {
            this.log('Database', 'ERROR', `Erreur lecture script ${script}: ${error.message}`);
          }
        } else {
          this.log('Database', 'WARNING', `Script SQL manquant: ${script}`);
        }
      });

      // Vérifier les scripts Node.js de base de données
      const nodeDbScripts = [
        'analyze-login-connections.js',
        'implement-login-security.js',
        'verify-security-implementation.js'
      ];
      
      nodeDbScripts.forEach(script => {
        const scriptPath = path.join(this.projectRoot, script);
        if (fs.existsSync(scriptPath)) {
          this.log('Database', 'SUCCESS', `Script Node.js DB trouvé: ${script}`);
        }
      });

      this.scanResults.database = {
        status: this.issues.filter(i => i.category === 'Database').length === 0 ? 'OK' : 'ERRORS',
        errors: this.issues.filter(i => i.category === 'Database').length,
        warnings: this.warnings.filter(i => i.category === 'Database').length
      };

    } catch (error) {
      this.log('Database', 'ERROR', `Erreur scan database: ${error.message}`);
    }
  }

  async scanScripts() {
    console.log('\n🔍 SCAN SCRIPTS...');
    
    try {
      // Vérifier les scripts PowerShell
      const psScripts = [
        'cascade/setup.ps1',
        'start-dev.ps1',
        'build-production.ps1'
      ];
      
      psScripts.forEach(script => {
        const scriptPath = path.join(this.projectRoot, script);
        if (fs.existsSync(scriptPath)) {
          this.log('Scripts', 'SUCCESS', `Script PowerShell trouvé: ${script}`);
          
          try {
            const content = fs.readFileSync(scriptPath, 'utf8');
            
            // Vérifications PowerShell
            if (content.includes('Write-Host') && !content.includes('-ForegroundColor')) {
              this.log('Scripts', 'WARNING', `Write-Host sans couleur dans: ${script}`);
            }
            
            if (content.includes('Remove-Item -Recurse -Force')) {
              this.log('Scripts', 'WARNING', `Commande dangereuse Remove-Item dans: ${script}`);
            }
            
          } catch (error) {
            this.log('Scripts', 'ERROR', `Erreur lecture script ${script}: ${error.message}`);
          }
        } else {
          this.log('Scripts', 'WARNING', `Script PowerShell manquant: ${script}`);
        }
      });

      // Vérifier les scripts Node.js
      const nodeScripts = fs.readdirSync(this.projectRoot).filter(file => file.endsWith('.js'));
      nodeScripts.forEach(script => {
        if (!script.includes('node_modules')) {
          try {
            const scriptPath = path.join(this.projectRoot, script);
            const content = fs.readFileSync(scriptPath, 'utf8');
            
            // Vérifications Node.js
            if (content.includes('require(\'mysql2\')') && !content.includes('try')) {
              this.log('Scripts', 'WARNING', `Connexion MySQL sans try/catch dans: ${script}`);
            }
            
          } catch (error) {
            this.log('Scripts', 'ERROR', `Erreur lecture script Node.js ${script}: ${error.message}`);
          }
        }
      });

      this.scanResults.scripts = {
        status: this.issues.filter(i => i.category === 'Scripts').length === 0 ? 'OK' : 'ERRORS',
        errors: this.issues.filter(i => i.category === 'Scripts').length,
        warnings: this.warnings.filter(i => i.category === 'Scripts').length
      };

    } catch (error) {
      this.log('Scripts', 'ERROR', `Erreur scan scripts: ${error.message}`);
    }
  }

  async scanConfiguration() {
    console.log('\n🔍 SCAN CONFIGURATION...');
    
    try {
      // Vérifier les fichiers de configuration
      const configFiles = [
        '.env',
        '.env.example',
        'vite.config.js',
        'README.md',
        'package.json'
      ];
      
      configFiles.forEach(file => {
        const filePath = path.join(this.projectRoot, file);
        if (fs.existsSync(filePath)) {
          this.log('Configuration', 'SUCCESS', `Fichier config trouvé: ${file}`);
          
          if (file === '.env') {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              
              // Vérifier les variables critiques
              if (!content.includes('DATABASE_URL') && !content.includes('MYSQL_HOST')) {
                this.log('Configuration', 'WARNING', 'Variables de base de données manquantes dans .env');
              }
              
              if (!content.includes('JWT_SECRET')) {
                this.log('Configuration', 'WARNING', 'JWT_SECRET manquant dans .env');
              }
              
            } catch (error) {
              this.log('Configuration', 'ERROR', `Erreur lecture .env: ${error.message}`);
            }
          }
        } else {
          if (file === '.env') {
            this.log('Configuration', 'WARNING', '.env manquant (utilise .env.example)');
          } else {
            this.log('Configuration', 'WARNING', `Fichier config manquant: ${file}`);
          }
        }
      });

      // Vérifier node_modules
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        this.log('Configuration', 'SUCCESS', 'node_modules présent');
      } else {
        this.log('Configuration', 'WARNING', 'node_modules manquant - lancez npm install');
      }

      this.scanResults.configuration = {
        status: this.issues.filter(i => i.category === 'Configuration').length === 0 ? 'OK' : 'ERRORS',
        errors: this.issues.filter(i => i.category === 'Configuration').length,
        warnings: this.warnings.filter(i => i.category === 'Configuration').length
      };

    } catch (error) {
      this.log('Configuration', 'ERROR', `Erreur scan configuration: ${error.message}`);
    }
  }

  async scanDependencies() {
    console.log('\n🔍 SCAN DÉPENDANCES...');
    
    try {
      // Scanner les dépendances frontend
      const frontendPackagePath = path.join(this.projectRoot, 'frontend', 'package.json');
      if (fs.existsSync(frontendPackagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
        
        // Vérifier les dépendances critiques
        const criticalDeps = ['react', 'react-dom', 'react-router-dom'];
        criticalDeps.forEach(dep => {
          if (packageJson.dependencies && packageJson.dependencies[dep]) {
            this.log('Dependencies', 'SUCCESS', `Dépendance frontend trouvée: ${dep}@${packageJson.dependencies[dep]}`);
          } else {
            this.log('Dependencies', 'ERROR', `Dépendance frontend manquante: ${dep}`);
          }
        });
      }

      // Scanner les dépendances backend
      const backendPackagePath = path.join(this.projectRoot, 'backend', 'package.json');
      if (fs.existsSync(backendPackagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
        
        // Vérifier les dépendances critiques
        const criticalDeps = ['express', 'mysql2', 'jsonwebtoken', 'bcrypt'];
        criticalDeps.forEach(dep => {
          if (packageJson.dependencies && packageJson.dependencies[dep]) {
            this.log('Dependencies', 'SUCCESS', `Dépendance backend trouvée: ${dep}@${packageJson.dependencies[dep]}`);
          } else {
            this.log('Dependencies', 'ERROR', `Dépendance backend manquante: ${dep}`);
          }
        });
      }

      this.scanResults.dependencies = {
        status: this.issues.filter(i => i.category === 'Dependencies').length === 0 ? 'OK' : 'ERRORS',
        errors: this.issues.filter(i => i.category === 'Dependencies').length,
        warnings: this.warnings.filter(i => i.category === 'Dependencies').length
      };

    } catch (error) {
      this.log('Dependencies', 'ERROR', `Erreur scan dépendances: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n📊 GÉNÉRATION DU RAPPORT...');
    
    const report = {
      scanDate: new Date().toISOString(),
      summary: {
        totalErrors: this.issues.length,
        totalWarnings: this.warnings.length,
        totalSuccess: this.success.length,
        overallStatus: this.issues.length === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION'
      },
      categories: this.scanResults,
      issues: this.issues,
      warnings: this.warnings,
      success: this.success,
      recommendations: []
    };

    // Générer les recommandations
    if (this.issues.length > 0) {
      report.recommendations.push('CORRIGEZ LES ERREURS CRITIQUES AVANT DE CONTINUER');
    }
    
    if (this.warnings.length > 0) {
      report.recommendations.push('Traitez les avertissements pour une meilleure qualité');
    }
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      report.recommendations.push('✅ Tous les systèmes sont opérationnels');
    }

    // Sauvegarder le rapport
    const reportPath = path.join(this.projectRoot, 'PROCESS_SCAN_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log('Report', 'SUCCESS', 'Rapport généré', reportPath);

    return report;
  }

  async runFullScan() {
    console.log('🚀 DÉMARRAGE DU SCAN COMPLET DES PROCESSUS SPOFE...');
    console.log('=' .repeat(80));
    
    await this.scanFrontend();
    await this.scanBackend();
    await this.scanDatabase();
    await this.scanScripts();
    await this.scanConfiguration();
    await this.scanDependencies();
    
    const report = await this.generateReport();
    
    console.log('\n' + '=' .repeat(80));
    console.log('📋 RÉSUMÉ DU SCAN:');
    console.log(`   ❌ Erreurs: ${report.summary.totalErrors}`);
    console.log(`   ⚠️  Avertissements: ${report.summary.totalWarnings}`);
    console.log(`   ✅ Succès: ${report.summary.totalSuccess}`);
    console.log(`   🎯 Statut global: ${report.summary.overallStatus}`);
    
    if (report.summary.totalErrors > 0) {
      console.log('\n🚨 ERREURS CRITIQUES TROUVÉES:');
      this.issues.forEach(issue => {
        console.log(`   ❌ ${issue.category}: ${issue.message}`);
      });
    }
    
    if (report.summary.totalWarnings > 0) {
      console.log('\n⚠️  AVERTISSEMENTS:');
      this.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning.category}: ${warning.message}`);
      });
    }
    
    console.log('\n📄 Rapport détaillé sauvegardé dans: PROCESS_SCAN_REPORT.json');
    
    return report;
  }
}

// Exécuter le scan
const scanner = new ProcessScanner();
scanner.runFullScan().catch(console.error);
