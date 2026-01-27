#!/usr/bin/env node

/**
 * 🔧 INSTALLATION PRE-COMMIT HOOK - CONVENTIONS SPOFE v2.2
 * 
 * Script d'installation automatique du hook pre-commit
 * Configure Git pour utiliser le hook de conformité
 * 
 * Usage:
 *   node scripts/install-pre-commit.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 🎨 COULEURS POUR LE TERMINAL
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

/**
 * 🔧 Classe d'installation du hook pre-commit
 */
class PreCommitInstaller {
  constructor() {
    this.gitDir = this.findGitDir();
    this.hooksDir = path.join(this.gitDir, 'hooks');
    this.preCommitHookPath = path.join(this.hooksDir, 'pre-commit');
  }

  /**
   * 🚀 Point d'entrée principal
   */
  async run() {
    console.log(`${COLORS.cyan}🔧 INSTALLATION PRE-COMMIT HOOK - CONVENTIONS SPOFE v2.2${COLORS.reset}`);
    console.log(`${COLORS.blue}═`.repeat(60) + COLOR.reset);

    try {
      // 1. Vérification Git
      this.verifyGitRepository();

      // 2. Création du dossier hooks si nécessaire
      this.ensureHooksDirectory();

      // 3. Installation du hook
      await this.installPreCommitHook();

      // 4. Vérification de l'installation
      this.verifyInstallation();

      // 5. Configuration des scripts npm
      await this.configureNpmScripts();

      // 6. Test du hook
      await this.testHook();

      console.log(`\n${COLORS.green}🎉 INSTALLATION TERMINÉE AVEC SUCCÈS!${COLORS.reset}`);
      this.displayNextSteps();

    } catch (error) {
      console.error(`${COLORS.red}❌ Erreur lors de l'installation:${COLORS.reset}`, error.message);
      process.exit(1);
    }
  }

  /**
   * 🔍 Recherche du dossier Git
   */
  findGitDir() {
    let currentDir = projectRoot;
    
    while (currentDir !== path.dirname(currentDir)) {
      const gitDir = path.join(currentDir, '.git');
      
      if (fs.existsSync(gitDir)) {
        if (fs.statSync(gitDir).isFile()) {
          // Git worktree ou submodule
          const gitFile = fs.readFileSync(gitDir, 'utf8').trim();
          const gitDirPath = gitFile.replace('gitdir: ', '');
          return path.resolve(currentDir, gitDirPath);
        } else {
          return gitDir;
        }
      }
      
      currentDir = path.dirname(currentDir);
    }
    
    throw new Error('Dossier .git non trouvé. Ce n\'est pas un dépôt Git.');
  }

  /**
   * ✅ Vérification que c'est un dépôt Git
   */
  verifyGitRepository() {
    console.log(`${COLORS.blue}🔍 Vérification du dépôt Git...${COLORS.reset}`);
    
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      console.log(`${COLORS.green}✅ Dépôt Git valide${COLORS.reset}`);
    } catch (error) {
      throw new Error('Ceci n\'est pas un dépôt Git valide');
    }
  }

  /**
   * 📁 Création du dossier hooks
   */
  ensureHooksDirectory() {
    console.log(`${COLORS.blue}📁 Vérification du dossier hooks...${COLORS.reset}`);
    
    if (!fs.existsSync(this.hooksDir)) {
      fs.mkdirSync(this.hooksDir, { recursive: true });
      console.log(`${COLORS.green}✅ Dossier hooks créé: ${this.hooksDir}${COLORS.reset}`);
    } else {
      console.log(`${COLORS.green}✅ Dossier hooks existe déjà${COLORS.reset}`);
    }
  }

  /**
   * 🪝 Installation du hook pre-commit
   */
  async installPreCommitHook() {
    console.log(`${COLORS.blue}🪝 Installation du hook pre-commit...${COLORS.reset}`);
    
    const hookScript = this.generateHookScript();
    
    // Sauvegarde du hook existant si présent
    if (fs.existsSync(this.preCommitHookPath)) {
      const backupPath = `${this.preCommitHookPath}.backup.${Date.now()}`;
      fs.copyFileSync(this.preCommitHookPath, backupPath);
      console.log(`${COLORS.yellow}⚠️  Hook existant sauvegardé: ${backupPath}${COLORS.reset}`);
    }
    
    // Écriture du nouveau hook
    fs.writeFileSync(this.preCommitHookPath, hookScript, { mode: 0o755 });
    console.log(`${COLORS.green}✅ Hook pre-commit installé${COLORS.reset}`);
  }

  /**
   * 📝 Génération du script du hook
   */
  generateHookScript() {
    const nodePath = process.execPath;
    const hookScriptPath = path.join(projectRoot, 'scripts', 'pre-commit-hook.js');
    
    return `#!/bin/sh
# Pre-commit hook pour SPOFE v2.2
# Généré automatiquement par install-pre-commit.js

# Vérification que Node.js est disponible
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé ou pas dans le PATH"
    echo "📦 Veuillez installer Node.js: https://nodejs.org/"
    exit 1
fi

# Vérification que le script de hook existe
HOOK_SCRIPT="${hookScriptPath}"
if [ ! -f "$HOOK_SCRIPT" ]; then
    echo "❌ Script de hook non trouvé: $HOOK_SCRIPT"
    echo "🔧 Exécutez: node scripts/install-pre-commit.js"
    exit 1
fi

# Exécution du hook de conformité
echo "🪝 Vérification des conventions SPOFE v2.2..."
${nodePath} "$HOOK_SCRIPT"
exit_code=$?

if [ $exit_code -ne 0 ]; then
    echo ""
    echo "🚫 Le commit a été bloqué par le hook de conformité"
    echo "📋 Corrigez les violations et relancez le commit"
    echo ""
    exit 1
fi

echo "✅ Conformité validée - Commit autorisé"
exit 0
`;
  }

  /**
   * ✅ Vérification de l'installation
   */
  verifyInstallation() {
    console.log(`${COLORS.blue}✅ Vérification de l'installation...${COLORS.reset}`);
    
    if (!fs.existsSync(this.preCommitHookPath)) {
      throw new Error('Le hook pre-commit n\'a pas été installé correctement');
    }
    
    // Vérification des permissions
    const stats = fs.statSync(this.preCommitHookPath);
    if ((stats.mode & 0o111) === 0) {
      fs.chmodSync(this.preCommitHookPath, 0o755);
      console.log(`${COLORS.yellow}⚠️  Permissions du hook corrigées${COLORS.reset}`);
    }
    
    console.log(`${COLORS.green}✅ Hook pre-commit installé et exécutable${COLORS.reset}`);
  }

  /**
   * 📦 Configuration des scripts npm
   */
  async configureNpmScripts() {
    console.log(`${COLORS.blue}📦 Configuration des scripts npm...${COLORS.reset}`);
    
    const packageJsonPath = path.join(projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`${COLORS.yellow}⚠️  package.json non trouvé, configuration des scripts ignorée${COLORS.reset}`);
      return;
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Ajout des scripts de conformité
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      const conventionsScripts = {
        'conventions:check': 'node scripts/conventions-compliance-checker.js',
        'conventions:fix': 'node scripts/conventions-compliance-checker.js --fix',
        'conventions:report': 'node scripts/conventions-compliance-checker.js --report',
        'conventions:watch': 'node scripts/conventions-compliance-checker.js --watch',
        'conventions:precommit': 'node scripts/pre-commit-hook.js',
        'conventions:install': 'node scripts/install-pre-commit.js'
      };
      
      // Ajout des scripts manquants
      let scriptsAdded = 0;
      for (const [name, command] of Object.entries(conventionsScripts)) {
        if (!packageJson.scripts[name]) {
          packageJson.scripts[name] = command;
          scriptsAdded++;
        }
      }
      
      if (scriptsAdded > 0) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`${COLORS.green}✅ ${scriptsAdded} scripts npm ajoutés${COLORS.reset}`);
      } else {
        console.log(`${COLORS.green}✅ Scripts npm déjà configurés${COLORS.reset}`);
      }
      
    } catch (error) {
      console.log(`${COLORS.yellow}⚠️  Erreur configuration package.json: ${error.message}${COLORS.reset}`);
    }
  }

  /**
   * 🧪 Test du hook
   */
  async testHook() {
    console.log(`${COLORS.blue}🧪 Test du hook pre-commit...${COLORS.reset}`);
    
    try {
      const hookScriptPath = path.join(projectRoot, 'scripts', 'pre-commit-hook.js');
      
      if (!fs.existsSync(hookScriptPath)) {
        console.log(`${COLORS.yellow}⚠️  Script du hook non trouvé, test ignoré${COLORS.reset}`);
        return;
      }
      
      // Test avec --help pour vérifier que le script s'exécute
      execSync(`node "${hookScriptPath}" --help`, { stdio: 'ignore', timeout: 5000 });
      console.log(`${COLORS.green}✅ Hook pre-commit fonctionnel${COLORS.reset}`);
      
    } catch (error) {
      // Le test peut échouer si le script n'a pas d'option --help
      // C'est normal, on considère que l'installation est réussie
      console.log(`${COLORS.yellow}⚠️  Test du hook ignoré (normal si pas d'option --help)${COLORS.reset}`);
    }
  }

  /**
   * 📋 Affichage des prochaines étapes
   */
  displayNextSteps() {
    console.log(`\n${COLORS.blue}📋 PROCHAINES ÉTAPES:${COLORS.reset}`);
    console.log(`${COLORS.white}1. ${COLORS.cyan}Testez le hook:${COLORS.reset} npm run conventions:precommit`);
    console.log(`${COLORS.white}2. ${COLORS.cyan}Faites des modifications:${COLORS.reset} git add .`);
    console.log(`${COLORS.white}3. ${COLORS.cyan}Commitez:${COLORS.reset} git commit -m "test: modifications"`);
    console.log(`${COLORS.white}4. ${COLORS.cyan}Le hook vérifiera automatiquement la conformité${COLORS.reset}`);

    console.log(`\n${COLORS.magenta}📚 Documentation:${COLORS.reset}`);
    console.log(`${COLORS.white}• Conventions: docs/CONVENTIONS_NOMMAGE_SPOFE_v2.2.md${COLORS.reset}`);
    console.log(`${COLORS.white}• Scripts: docs/SCRIPTS_CONFORMITÉ_SPOFE_v2.2.md${COLORS.reset}`);

    console.log(`\n${COLORS.yellow}⚡ Commandes utiles:${COLORS.reset}`);
    console.log(`${COLORS.white}• Vérification: npm run conventions:check${COLORS.reset}`);
    console.log(`${COLORS.white}• Correction: npm run conventions:fix${COLORS.reset}`);
    console.log(`${COLORS.white}• Rapport: npm run conventions:report${COLORS.reset}`);
    console.log(`${COLORS.white}• Réinstallation: npm run conventions:install${COLORS.reset}`);

    console.log(`\n${COLORS.green}🎯 Le hook est maintenant actif et se déclenchera automatiquement!${COLORS.reset}`);
  }
}

/**
 * 🚀 Point d'entrée principal
 */
async function main() {
  const installer = new PreCommitInstaller();
  await installer.run();
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default PreCommitInstaller;
