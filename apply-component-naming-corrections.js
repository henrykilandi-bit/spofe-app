#!/usr/bin/env node

/**
 * 🧠 CORRECTIONS INTELLIGENTES - COMPONENTS FRONTEND
 * SPOFE v2.2 - Normalisation des noms de fichiers React
 */

const fs = require('fs');
const path = require('path');

class ComponentNamingCorrector {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.corrections = [
      { old: 'LoginPage-BACKUP.jsx', new: 'LoginPageBackup.jsx' },
      { old: 'LoginPage-FULL.jsx', new: 'LoginPageFull.jsx' },
      { old: 'LoginPage-SIMPLE.jsx', new: 'LoginPageSimple.jsx' },
      { old: 'alert.jsx', new: 'Alert.jsx' },
      { old: 'button.jsx', new: 'Button.jsx' },
      { old: 'card.jsx', new: 'Card.jsx' }
    ];
  }

  async applyCorrections() {
    console.log('🧠 CORRECTIONS INTELLIGENTES - COMPONENTS FRONTEND');
    console.log('📋 SPOFE v2.2 - Normalisation des noms de fichiers');
    console.log('');

    const results = {
      filesProcessed: 0,
      filesCorrected: 0,
      corrections: []
    };

    const frontendDir = path.join(this.projectRoot, 'frontend', 'src');
    
    if (!fs.existsSync(frontendDir)) {
      console.log('❌ Dossier frontend non trouvé');
      return results;
    }

    // Scanner récursivement les fichiers
    await this.scanDirectory(frontendDir, results);

    // Afficher le résumé
    this.displaySummary(results);

    return results;
  }

  async scanDirectory(dirPath, results) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        await this.scanDirectory(itemPath, results);
      } else if (stat.isFile() && item.endsWith('.jsx')) {
        results.filesProcessed++;
        
        const correction = this.corrections.find(c => c.old === item);
        if (correction) {
          await this.applyCorrection(itemPath, correction, results);
        }
      }
    }
  }

  async applyCorrection(oldPath, correction, results) {
    const newPath = path.join(path.dirname(oldPath), correction.new);
    
    try {
      // Créer backup
      const backupPath = oldPath + '.backup';
      fs.copyFileSync(oldPath, backupPath);
      
      // Renommer le fichier
      fs.renameSync(oldPath, newPath);
      
      // Mettre à jour les imports dans tous les fichiers
      await this.updateImports(oldPath, newPath, correction);
      
      results.filesCorrected++;
      results.corrections.push({
        old: path.basename(oldPath),
        new: path.basename(newPath),
        path: newPath
      });
      
      console.log(`✅ ${correction.old} → ${correction.new}`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de la correction de ${correction.old}:`, error.message);
    }
  }

  async updateImports(oldPath, newPath, correction) {
    const oldRelativePath = this.getRelativePath(oldPath);
    const newRelativePath = this.getRelativePath(newPath);
    
    // Scanner tous les fichiers pour mettre à jour les imports
    const frontendDir = path.join(this.projectRoot, 'frontend', 'src');
    await this.updateImportsInDirectory(frontendDir, oldRelativePath, newRelativePath, correction);
  }

  getRelativePath(filePath) {
    const frontendSrc = path.join(this.projectRoot, 'frontend', 'src');
    return path.relative(frontendSrc, filePath).replace(/\\/g, '/');
  }

  async updateImportsInDirectory(dirPath, oldPath, newPath, correction) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        await this.updateImportsInDirectory(itemPath, oldPath, newPath, correction);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
        await this.updateFileImports(itemPath, oldPath, newPath, correction);
      }
    }
  }

  async updateFileImports(filePath, oldPath, newPath, correction) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Patterns d'import à rechercher
      const patterns = [
        new RegExp(`from ['"]\\.\\./[^'"]*${correction.old.replace('.jsx', '')}['"]`, 'g'),
        new RegExp(`from ['"]\\.\\./[^'"]*${correction.old}['"]`, 'g'),
        new RegExp(`from ['"][^'"]*${correction.old.replace('.jsx', '')}['"]`, 'g'),
        new RegExp(`from ['"][^'"]*${correction.old}['"]`, 'g'),
        new RegExp(`import.*${correction.old.replace('.jsx', '')}.*from`, 'g'),
        new RegExp(`import.*${correction.old}.*from`, 'g')
      ];
      
      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          content = content.replace(pattern, match => {
            modified = true;
            return match.replace(correction.old, correction.new.replace('.jsx', ''));
          });
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`   📝 Imports mis à jour dans: ${path.relative(this.projectRoot, filePath)}`);
      }
      
    } catch (error) {
      // Ignorer les erreurs de lecture/écriture
    }
  }

  displaySummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES CORRECTIONS DE COMPONENTS');
    console.log('='.repeat(60));
    console.log(`Fichiers traités: ${results.filesProcessed}`);
    console.log(`Fichiers corrigés: ${results.filesCorrected}`);
    console.log(`Corrections appliquées: ${results.corrections.length}`);
    
    if (results.corrections.length > 0) {
      console.log('\n📋 Détail des corrections:');
      results.corrections.forEach(correction => {
        console.log(`   - ${correction.old} → ${correction.new}`);
      });
    }
    
    console.log('='.repeat(60));
    
    if (results.filesCorrected > 0) {
      console.log('✅ Corrections des components appliquées avec succès!');
      console.log('📋 Fichiers .backup créés pour rollback');
    } else {
      console.log('ℹ️ Aucune correction nécessaire - components déjà conformes');
    }
  }
}

// Point d'entrée
async function applyComponentNamingCorrections() {
  const corrector = new ComponentNamingCorrector(__dirname);
  await corrector.applyCorrections();
}

if (require.main === module) {
  applyComponentNamingCorrections();
}

module.exports = { ComponentNamingCorrector, applyComponentNamingCorrections };
