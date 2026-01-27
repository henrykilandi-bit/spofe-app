/**
 * PackageJsonFixer Module
 * Automatise le nettoyage et la correction des fichiers package.json
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class PackageJsonFixer {
  constructor(config, dryRun = false) {
    this.config = config;
    this.dryRun = dryRun;
    this.results = {
      fixed: 0,
      warnings: [],
      errors: [],
    };
  }

  async fixAll() {
    // Corriger root package.json
    this.fixRootPackageJson();

    // Corriger backend package.json
    this.fixBackendPackageJson();

    // Corriger frontend package.json
    this.fixFrontendPackageJson();

    // Installer les dépendances
    if (!this.dryRun) {
      this.installDependencies();
    }

    return this.results;
  }

  fixRootPackageJson() {
    const filePath = path.join(this.config.projectRoot, 'package.json');
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;

      // Supprimer les clés dupliquées "engines"
      const lines = content.split('\n');
      const engineLineIndices = [];
      
      lines.forEach((line, idx) => {
        if (line.includes('"engines"')) {
          engineLineIndices.push(idx);
        }
      });

      if (engineLineIndices.length > 1) {
        // Garder le premier, supprimer les autres
        for (let i = engineLineIndices.length - 1; i > 0; i--) {
          const startIdx = engineLineIndices[i];
          const endIdx = this.findClosingBrace(lines, startIdx);
          lines.splice(startIdx, endIdx - startIdx + 1);
        }
        content = lines.join('\n');
      }

      // Valider que c'est du JSON valide
      try {
        JSON.parse(content);
      } catch (e) {
        throw new Error(`JSON invalide après correction: ${e.message}`);
      }

      if (content !== original && !this.dryRun) {
        fs.writeFileSync(filePath, content);
        this.results.fixed++;
      } else if (content !== original) {
        this.results.warnings.push(`[DRY-RUN] Corrections nécessaires: ${filePath}`);
      }

    } catch (error) {
      this.results.errors.push(`Erreur ${filePath}: ${error.message}`);
    }
  }

  fixBackendPackageJson() {
    const filePath = path.join(this.config.backend, 'package.json');
    
    try {
      let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Supprimer dépendances dupliquées
      if (pkg.dependencies) {
        // Garder bcryptjs, supprimer bcrypt
        if (pkg.dependencies.bcrypt && pkg.dependencies.bcryptjs) {
          delete pkg.dependencies.bcrypt;
          this.results.fixed++;
        }
      }

      // Assurer que vitest est en devDependencies
      if (!pkg.devDependencies) pkg.devDependencies = {};
      if (!pkg.devDependencies.vitest) {
        pkg.devDependencies.vitest = '^4.0.17';
        this.results.fixed++;
      }

      if (!this.dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));
      }

    } catch (error) {
      this.results.errors.push(`Erreur ${filePath}: ${error.message}`);
    }
  }

  fixFrontendPackageJson() {
    const filePath = path.join(this.config.frontend, 'package.json');
    
    try {
      let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Assurer les bonnes versions
      const updates = {
        'axios': '1.13.2',
        'react': '18.3.1',
        'react-dom': '18.3.1',
        'vitest': '4.0.17',
      };

      let changed = false;
      for (const [name, version] of Object.entries(updates)) {
        if (pkg.dependencies && pkg.dependencies[name]) {
          if (!pkg.dependencies[name].includes(version.split('.')[0])) {
            pkg.dependencies[name] = `^${version}`;
            changed = true;
            this.results.fixed++;
          }
        }
      }

      // Assurer que les nouvelles dépendances existent
      const newDeps = {
        'zod': '^3.22.4',
        '@tanstack/react-query': '^5.28.0',
      };

      for (const [name, version] of Object.entries(newDeps)) {
        if (!pkg.dependencies[name]) {
          pkg.dependencies[name] = version;
          changed = true;
        }
      }

      if (changed && !this.dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));
      }

    } catch (error) {
      this.results.errors.push(`Erreur ${filePath}: ${error.message}`);
    }
  }

  installDependencies() {
    const dirs = [
      this.config.backend,
      this.config.frontend,
    ];

    for (const dir of dirs) {
      try {
        console.log(`  📥 Installation dépendances: ${path.basename(dir)}...`);
        execSync('npm install', { cwd: dir, stdio: 'pipe' });
      } catch (error) {
        this.results.warnings.push(`Erreur installation ${dir}: ${error.message}`);
      }
    }
  }

  findClosingBrace(lines, startIdx) {
    let braceCount = 0;
    let foundOpening = false;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          foundOpening = true;
        } else if (char === '}') {
          braceCount--;
          if (foundOpening && braceCount === 0) {
            return i;
          }
        }
      }
    }

    return startIdx;
  }
}
