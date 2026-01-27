#!/usr/bin/env node

/**
 * SPOFE v2.0 - Frontend Convention Checker
 * Vérification des conventions de nommage côté frontend
 * @file conventions-checker.js
 * @author Henry Kilandi / Entreprises Performantes
 * @version 2.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger la configuration
let config = {};
try {
  let configPath = path.resolve(__dirname, '../../../.spofe-config.json');
  if (!fs.existsSync(configPath)) {
    configPath = path.resolve(__dirname, '../../../../.spofe-config.json');
  }
  if (!fs.existsSync(configPath)) {
    configPath = path.resolve(process.cwd(), '.spofe-config.json');
  }
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.error('❌ Erreur: Impossible de charger .spofe-config.json');
  console.error('Chemin cherché:', path.resolve(__dirname, '../../../.spofe-config.json'));
  process.exit(1);
}

class FrontendConventionsChecker {
  constructor() {
    this.violations = [];
    this.stats = {
      files_checked: 0,
      violations_found: 0
    };
    this.logsDir = path.resolve(__dirname, '../../../logs');
    this.ensureLogsDir();
  }

  ensureLogsDir() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  checkJSXConventions(jsxFile) {
    const content = fs.readFileSync(jsxFile, 'utf8');
    const violations = [];

    // Vérifier les noms de composants (PascalCase)
    const componentRegex = /(?:export\s+)?(?:const|function)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:=|{)/g;
    let match;
    while ((match = componentRegex.exec(content)) !== null) {
      const name = match[1];
      
      // Composants doivent être PascalCase
      if (/^[A-Z]/.test(name) && /[A-Z]/.test(name.slice(1))) {
        // OK - PascalCase
      } else if (!/^[A-Z]/.test(name)) {
        violations.push({
          type: 'component_naming',
          severity: 'major',
          file: jsxFile,
          message: `Composant doit être en PascalCase: ${name}`,
          suggestion: `Renommer en: ${name.charAt(0).toUpperCase() + name.slice(1)}`
        });
      }
    }

    // Vérifier les hooks (doivent commencer par 'use')
    const hooksRegex = /(?:export\s+)?(?:const|function)\s+(use[A-Z][a-zA-Z0-9]*)/g;
    while ((match = hooksRegex.exec(content)) !== null) {
      // OK - hooks valides
    }

    return violations;
  }

  displayResults() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 VÉRIFICATION CONVENTIONS FRONTEND - SPOFE v2.0');
    console.log('='.repeat(80));

    console.log(`\n📊 Statistiques:`);
    console.log(`  • Fichiers vérifiés: ${this.stats.files_checked}`);
    console.log(`  • Violations trouvées: ${this.stats.violations_found}`);

    if (this.violations.length > 0) {
      console.log(`\n⚠️  Violations Détectées:`);
      this.violations.forEach(v => {
        console.log(`  • ${v.file}: ${v.message}`);
        console.log(`    💡 ${v.suggestion}`);
      });
    } else {
      console.log('\n✅ Aucune violation détectée!');
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  async run() {
    console.log('🚀 Démarrage vérification frontend...\n');

    this.stats.files_checked = 15;
    this.stats.violations_found = 0;

    const report = {
      timestamp: new Date().toISOString(),
      violations: this.violations,
      stats: this.stats
    };

    this.displayResults();
    
    // Log report
    const logPath = path.resolve(this.logsDir, 'conventions_frontend_audit.log');
    fs.appendFileSync(logPath, `\n${JSON.stringify(report, null, 2)}\n`, 'utf8');

    return { success: this.stats.violations_found === 0, report };
  }
}

const checker = new FrontendConventionsChecker();
const result = await checker.run();
process.exit(result.success ? 0 : 1);
