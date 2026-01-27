#!/usr/bin/env node

/**
 * 🤖 GÉNÉRATEUR AUTOMATIQUE DE CONTRAT FRONTEND JSON
 * 
 * Génère automatiquement le contrat frontend basé sur:
 * - Analyse des endpoints backend
 * - Règle "un endpoint = un DTO"
 * - Dashboard de conformité temps réel
 * - Intégration SILC Validator
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ContractGenerator {
  constructor() {
    this.appPath = __dirname;
    this.backendPath = path.join(this.appPath, 'cascade/src');
    this.frontendPath = path.join(this.appPath, 'frontend/src');
    this.contract = {
      version: 'SPOFE v2.2',
      timestamp: new Date().toISOString(),
      endpoints: {},
      compliance: {
        totalEndpoints: 0,
        compliantEndpoints: 0,
        complianceRate: 0,
        violations: []
      },
      metadata: {
        generatedBy: 'contract-generator.js',
        rule: 'un endpoint = un DTO',
        silcValidator: true
      }
    };
  }

  async generateContract() {
    console.log('🤖 GÉNÉRATION AUTOMATIQUE DU CONTRAT FRONTEND JSON');
    console.log('='.repeat(60));

    try {
      // 1. Analyser les endpoints backend
      await this.analyzeBackendEndpoints();

      // 2. Analyser les DTOs backend
      await this.analyzeBackendDTOs();

      // 3. Valider la règle "un endpoint = un DTO"
      await this.validateEndpointDTORule();

      // 4. Générer le contrat JSON
      await this.generateJSONContract();

      // 5. Créer le dashboard de conformité
      await this.createComplianceDashboard();

      // 6. Intégrer SILC Validator
      await this.integrateSILCValidator();

      console.log('\n✅ CONTRAT GÉNÉRÉ AVEC SUCCÈS');
      this.displayResults();

    } catch (error) {
      console.error('❌ Erreur génération contrat:', error.message);
      throw error;
    }
  }

  async analyzeBackendEndpoints() {
    console.log('\n📡 ANALYSE DES ENDPOINTS BACKEND');

    const controllersPath = path.join(this.backendPath, 'controllers');
    const routesPath = path.join(this.backendPath, 'routes');

    // Scanner tous les fichiers de contrôleurs et routes
    const controllerFiles = this.scanDirectory(controllersPath, '.js');
    const routeFiles = this.scanDirectory(routesPath, '.js');

    console.log(`📁 Contrôleurs trouvés: ${controllerFiles.length}`);
    console.log(`📁 Routes trouvées: ${routeFiles.length}`);

    // Analyser chaque fichier pour extraire les endpoints
    for (const file of [...controllerFiles, ...routeFiles]) {
      await this.extractEndpointsFromFile(file);
    }

    console.log(`🎯 Endpoints analysés: ${Object.keys(this.contract.endpoints).length}`);
  }

  async extractEndpointsFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Regex pour trouver les définitions d'endpoints Express
      const endpointPatterns = [
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g
      ];

      for (const pattern of endpointPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const method = match[1].toUpperCase();
          const route = match[2];
          const endpointKey = `${method}:${route}`;

          this.contract.endpoints[endpointKey] = {
            method,
            route,
            file: path.relative(this.appPath, filePath),
            dto: null, // Sera rempli plus tard
            compliant: false,
            lastValidated: null
          };
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erreur lecture fichier ${filePath}:`, error.message);
    }
  }

  async analyzeBackendDTOs() {
    console.log('\n📋 ANALYSE DES DTOS BACKEND');

    const dtoPath = path.join(this.backendPath, 'dto');
    const dtoFiles = this.scanDirectory(dtoPath, '.dto.js');

    console.log(`📁 DTOs trouvés: ${dtoFiles.length}`);

    // Analyser chaque DTO
    for (const file of dtoFiles) {
      await this.extractDTOFromFile(file);
    }
  }

  async extractDTOFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dtoName = path.basename(filePath, '.dto.js');

      // Extraire les propriétés du DTO
      const properties = this.extractDTOProperties(content);

      // Associer ce DTO aux endpoints correspondants
      this.associateDTOWithEndpoints(dtoName, properties, filePath);

    } catch (error) {
      console.warn(`⚠️ Erreur lecture DTO ${filePath}:`, error.message);
    }
  }

  extractDTOProperties(content) {
    const properties = {};
    
    // Regex pour trouver les définitions de propriétés dans les DTOs
    const propertyPattern = /(\w+)\s*:\s*{\s*type:\s*([^,}]+)[^}]*}/g;
    let match;

    while ((match = propertyPattern.exec(content)) !== null) {
      const propertyName = match[1];
      const propertyType = match[2].trim();
      
      properties[propertyName] = {
        type: propertyType,
        required: content.includes(`${propertyName}:`) && !content.includes(`${propertyName}: null`),
        description: this.extractPropertyDescription(content, propertyName)
      };
    }

    return properties;
  }

  extractPropertyDescription(content, propertyName) {
    // Chercher les commentaires JSDoc avant la propriété
    const lines = content.split('\n');
    const propertyIndex = lines.findIndex(line => line.includes(`${propertyName}:`));
    
    if (propertyIndex > 0) {
      const prevLine = lines[propertyIndex - 1];
      const commentMatch = prevLine.match(/\/\/\s*(.+)/);
      if (commentMatch) {
        return commentMatch[1];
      }
    }
    
    return '';
  }

  associateDTOWithEndpoints(dtoName, properties, filePath) {
    // Associer le DTO aux endpoints basé sur le nommage conventionnel
    for (const [endpointKey, endpoint] of Object.entries(this.contract.endpoints)) {
      const routeBase = endpoint.route.split('/')[1]; // Extraire le nom de la ressource
      
      // Convention: user.dto.js -> endpoints /users/*
      if (dtoName.toLowerCase().includes(routeBase) || 
          routeBase.includes(dtoName.toLowerCase())) {
        endpoint.dto = {
          name: dtoName,
          file: path.relative(this.appPath, filePath),
          properties,
          propertyCount: Object.keys(properties).length
        };
      }
    }
  }

  async validateEndpointDTORule() {
    console.log('\n✅ VALIDATION RÈGLE "UN ENDPOINT = UN DTO"');

    let compliantCount = 0;
    const violations = [];

    for (const [endpointKey, endpoint] of Object.entries(this.contract.endpoints)) {
      const hasDTO = endpoint.dto && endpoint.dto.properties;
      
      if (hasDTO) {
        endpoint.compliant = true;
        endpoint.lastValidated = new Date().toISOString();
        compliantCount++;
      } else {
        endpoint.compliant = false;
        violations.push({
          endpoint: endpointKey,
          method: endpoint.method,
          route: endpoint.route,
          reason: 'DTO manquant ou invalide',
          severity: 'HIGH'
        });
      }
    }

    this.contract.compliance.totalEndpoints = Object.keys(this.contract.endpoints).length;
    this.contract.compliance.compliantEndpoints = compliantCount;
    this.contract.compliance.complianceRate = 
      (compliantCount / this.contract.compliance.totalEndpoints * 100).toFixed(2);
    this.contract.compliance.violations = violations;

    console.log(`📊 Taux de conformité: ${this.contract.compliance.complianceRate}%`);
    console.log(`🎯 Endpoints conformes: ${compliantCount}/${this.contract.compliance.totalEndpoints}`);
    
    if (violations.length > 0) {
      console.log(`🚨 Violations: ${violations.length}`);
    }
  }

  async generateJSONContract() {
    console.log('\n📄 GÉNÉRATION DU CONTRAT JSON');

    const contractPath = path.join(this.appPath, 'frontend-contract.json');
    
    fs.writeFileSync(contractPath, JSON.stringify(this.contract, null, 2));
    
    console.log(`✅ Contrat généré: ${contractPath}`);
  }

  async createComplianceDashboard() {
    console.log('\n📊 CRÉATION DU DASHBOARD DE CONFORMITÉ');

    const dashboardHTML = this.generateDashboardHTML();
    const dashboardPath = path.join(this.appPath, 'compliance-dashboard.html');

    fs.writeFileSync(dashboardPath, dashboardHTML);
    
    console.log(`✅ Dashboard créé: ${dashboardPath}`);
  }

  generateDashboardHTML() {
    const compliance = this.contract.compliance;
    const endpoints = this.contract.endpoints;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Dashboard Conformité SPOFE</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
        <header class="mb-8">
            <h1 class="text-4xl font-bold text-blue-400 mb-2">📊 Dashboard Conformité SPOFE</h1>
            <p class="text-gray-400">Monitoring temps réel - Règle: Un endpoint = Un DTO</p>
        </header>

        <!-- Métriques principales -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-2xl font-bold text-blue-400">${compliance.totalEndpoints}</div>
                <div class="text-gray-400">Total Endpoints</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-2xl font-bold text-green-400">${compliance.compliantEndpoints}</div>
                <div class="text-gray-400">Conformes</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-2xl font-bold text-red-400">${compliance.totalEndpoints - compliance.compliantEndpoints}</div>
                <div class="text-gray-400">Violations</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-2xl font-bold text-yellow-400">${compliance.complianceRate}%</div>
                <div class="text-gray-400">Taux Conformité</div>
            </div>
        </div>

        <!-- Graphique de conformité -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 class="text-xl font-bold mb-4">📈 Taux de Conformité</h2>
            <canvas id="complianceChart" width="400" height="200"></canvas>
        </div>

        <!-- Tableau des endpoints -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 class="text-xl font-bold mb-4">📋 Détail des Endpoints</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="pb-3 px-2">Méthode</th>
                            <th class="pb-3 px-2">Route</th>
                            <th class="pb-3 px-2">DTO</th>
                            <th class="pb-3 px-2">Statut</th>
                            <th class="pb-3 px-2">Propriétés</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(endpoints).map(([key, endpoint]) => `
                            <tr class="border-b border-gray-700">
                                <td class="py-3 px-2">
                                    <span class="px-2 py-1 rounded text-xs font-bold ${
                                        endpoint.method === 'GET' ? 'bg-blue-600' :
                                        endpoint.method === 'POST' ? 'bg-green-600' :
                                        endpoint.method === 'PUT' ? 'bg-yellow-600' :
                                        endpoint.method === 'DELETE' ? 'bg-red-600' :
                                        'bg-gray-600'
                                    }">
                                        ${endpoint.method}
                                    </span>
                                </td>
                                <td class="py-3 px-2 font-mono text-sm">${endpoint.route}</td>
                                <td class="py-3 px-2">
                                    ${endpoint.dto ? 
                                        `<span class="text-green-400">${endpoint.dto.name}</span>` : 
                                        '<span class="text-red-400">Manquant</span>'
                                    }
                                </td>
                                <td class="py-3 px-2">
                                    ${endpoint.compliant ? 
                                        '<span class="text-green-400">✅</span>' : 
                                        '<span class="text-red-400">❌</span>'
                                    }
                                </td>
                                <td class="py-3 px-2">
                                    ${endpoint.dto ? endpoint.dto.propertyCount : 0}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Violations -->
        ${compliance.violations.length > 0 ? `
            <div class="bg-red-900 bg-opacity-20 rounded-lg p-6 border border-red-700 mt-8">
                <h2 class="text-xl font-bold mb-4 text-red-400">🚨 Violations Détectées</h2>
                <div class="space-y-3">
                    ${compliance.violations.map(violation => `
                        <div class="bg-gray-800 rounded p-4 border border-red-600">
                            <div class="font-bold text-red-400">${violation.endpoint}</div>
                            <div class="text-gray-400">${violation.reason}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    </div>

    <script>
        // Graphique de conformité
        const ctx = document.getElementById('complianceChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Conformes', 'Non Conformes'],
                datasets: [{
                    data: [${compliance.compliantEndpoints}, ${compliance.totalEndpoints - compliance.compliantEndpoints}],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Auto-rafraîchissement toutes les 30 secondes
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>`;
  }

  async integrateSILCValidator() {
    console.log('\n🔧 INTÉGRATION SILC VALIDATOR');

    const silcConfig = {
      enabled: true,
      rules: {
        'endpoint-dto-mapping': {
          description: 'Un endpoint doit avoir un DTO correspondant',
          severity: 'HIGH',
          autoFix: false
        },
        'dto-property-validation': {
          description: 'Les propriétés du DTO doivent être typées',
          severity: 'MEDIUM',
          autoFix: true
        },
        'naming-convention': {
          description: 'Convention de nommage cohérente',
          severity: 'LOW',
          autoFix: true
        }
      },
      contractPath: './frontend-contract.json',
      dashboardPath: './compliance-dashboard.html'
    };

    const silcConfigPath = path.join(this.appPath, 'silc-validator-config.json');
    fs.writeFileSync(silcConfigPath, JSON.stringify(silcConfig, null, 2));

    console.log(`✅ Configuration SILC: ${silcConfigPath}`);
  }

  scanDirectory(dirPath, extension) {
    const files = [];
    
    if (!fs.existsSync(dirPath)) {
      return files;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.scanDirectory(fullPath, extension));
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTATS DE LA GÉNÉRATION');
    console.log('='.repeat(60));
    
    console.log(`📄 Contrat JSON: frontend-contract.json`);
    console.log(`📊 Dashboard: compliance-dashboard.html`);
    console.log(`🔧 SILC Config: silc-validator-config.json`);
    
    console.log('\n📈 MÉTRiques:');
    console.log(`   • Total endpoints: ${this.contract.compliance.totalEndpoints}`);
    console.log(`   • Taux conformité: ${this.contract.compliance.complianceRate}%`);
    console.log(`   • Violations: ${this.contract.compliance.violations.length}`);
    
    console.log('\n💡 UTILISATION:');
    console.log('   • Ouvrir compliance-dashboard.html pour le monitoring');
    console.log('   • Intégrer frontend-contract.json dans le frontend');
    console.log('   • Exécuter SILC Validator pour validation continue');
  }
}

// Point d'entrée
if (require.main === module) {
  const generator = new ContractGenerator();
  generator.generateContract()
    .then(() => {
      console.log('\n🎉 GÉNÉRATION TERMINÉE AVEC SUCCÈS');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ ERREUR LORS DE LA GÉNÉRATION:', error.message);
      process.exit(1);
    });
}

module.exports = ContractGenerator;
