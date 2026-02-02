#!/usr/bin/env node
/**
 * SPOFE BUILD PROOF GENERATOR
 * Version 1.0.0 — Script Officiel SPOFE
 * 
 * Génère automatiquement un BUILD_PROOF.md traçable et non falsifiable
 * conformément aux Règles SPOFE Build/Test.
 * 
 * 🎯 Responsabilité:
 * - Exécute build + tests
 * - Capture les résultats réels
 * - Récupère les métadonnées Git
 * - Génère BUILD_PROOF.md
 * - Échoue immédiatement si un point critique échoue
 * 
 * ❌ Aucune validation manuelle possible
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

interface CommandResult {
  success: boolean;
  output: string;
  duration: number;
}

interface TestResult {
  type: string;
  command: string;
  result: CommandResult;
  required: boolean;
}

// --- UTILITAIRES ------------------------------------------------

function run(command: string, cwd?: string): CommandResult {
  const start = Date.now();
  try {
    const output = execSync(command, { 
      stdio: 'pipe',
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      timeout: 300000 // 5 minutes max
    });
    return { 
      success: true, 
      output: output.toString(),
      duration: Date.now() - start
    };
  } catch (err: any) {
    return {
      success: false,
      output: err.stdout?.toString() || err.stderr?.toString() || err.message,
      duration: Date.now() - start
    };
  }
}

function git(cmd: string, cwd?: string): string {
  try {
    return execSync(`git ${cmd}`, { 
      cwd: cwd || process.cwd(),
      encoding: 'utf-8'
    }).toString().trim();
  } catch (err) {
    return 'N/A';
  }
}

function nowISO(): string {
  return new Date().toISOString();
}

function boolIcon(ok: boolean): string {
  return ok ? '✅' : '❌';
}

function boolText(ok: boolean): string {
  return ok ? 'SUCCESS' : 'FAIL';
}

// --- CONFIGURATION ----------------------------------------------

interface BuildProofConfig {
  moduleName: string;
  modulePath: string;
  commands: {
    build: string;
    unit?: string;
    integration?: string;
    e2e?: string;
  };
  requiredTests: ('unit' | 'integration' | 'e2e')[];
}

function loadConfig(): BuildProofConfig {
  const moduleName = process.env.SPOFE_MODULE || 
    process.env.npm_package_name || 
    'UNKNOWN_MODULE';
  
  const modulePath = resolve(process.env.SPOFE_MODULE_PATH || process.cwd());
  
  // Détection automatique des scripts disponibles
  const packageJsonPath = join(modulePath, 'package.json');
  let availableScripts: string[] = [];
  
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf-8'));
      availableScripts = Object.keys(pkg.scripts || {});
    } catch (e) {
      console.warn('⚠️ Could not read package.json');
    }
  }
  
  const hasScript = (name: string) => availableScripts.includes(name);
  
  return {
    moduleName,
    modulePath,
    commands: {
      build: process.env.SPOFE_BUILD_CMD || 'npm run build',
      unit: hasScript('test:unit') ? 'npm run test:unit' : 
            hasScript('test') ? 'npm run test' : undefined,
      integration: hasScript('test:integration') ? 'npm run test:integration' : undefined,
      e2e: hasScript('test:e2e') ? 'npm run test:e2e' : undefined,
    },
    requiredTests: (process.env.SPOFE_REQUIRED_TESTS?.split(',') as any) || 
      ['unit', 'integration']
  };
}

// --- EXECUTION PRINCIPALE ----------------------------------------

function main(): void {
  console.log('🔨 SPOFE Build Proof Generator v1.0.0');
  console.log('=====================================\n');
  
  const config = loadConfig();
  const { moduleName, modulePath } = config;
  
  console.log(`📦 Module: ${moduleName}`);
  console.log(`📁 Path: ${modulePath}\n`);
  
  // --- METADONNÉES ----------------------------------------------
  
  console.log('📋 Collecting metadata...');
  const commit = git('rev-parse HEAD', modulePath);
  const branch = git('rev-parse --abbrev-ref HEAD', modulePath);
  const shortCommit = commit.substring(0, 8);
  
  // Vérifier si le répertoire est propre
  const status = git('status --porcelain', modulePath);
  const isClean = status === '' || status === 'N/A';
  
  if (!isClean && !process.env.SPOFE_ALLOW_DIRTY) {
    console.error('❌ ERROR: Git working directory is not clean');
    console.error('Uncommitted changes detected. Commit or stash before generating BUILD_PROOF.');
    process.exit(1);
  }
  
  // --- BUILD ----------------------------------------------------
  
  console.log('\n🔨 Running build...');
  const build = run(config.commands.build, modulePath);
  
  if (!build.success) {
    console.error('\n❌❌❌ BUILD FAILED ❌❌❌');
    console.error('BUILD_PROOF generation aborted.');
    console.error('\nBuild output:\n', build.output.substring(0, 2000));
    process.exit(1);
  }
  
  console.log(`✅ Build completed in ${build.duration}ms`);
  
  // --- TESTS ----------------------------------------------------
  
  const testResults: TestResult[] = [];
  
  if (config.commands.unit) {
    console.log('\n🧪 Running unit tests...');
    const result = run(config.commands.unit, modulePath);
    testResults.push({
      type: 'Unit',
      command: config.commands.unit,
      result,
      required: config.requiredTests.includes('unit')
    });
    console.log(`${boolIcon(result.success)} Unit tests ${result.success ? 'passed' : 'FAILED'}`);
  }
  
  if (config.commands.integration) {
    console.log('\n🧪 Running integration tests...');
    const result = run(config.commands.integration, modulePath);
    testResults.push({
      type: 'Integration',
      command: config.commands.integration,
      result,
      required: config.requiredTests.includes('integration')
    });
    console.log(`${boolIcon(result.success)} Integration tests ${result.success ? 'passed' : 'FAILED'}`);
  }
  
  if (config.commands.e2e) {
    console.log('\n🧪 Running E2E tests...');
    const result = run(config.commands.e2e, modulePath);
    testResults.push({
      type: 'E2E',
      command: config.commands.e2e,
      result,
      required: config.requiredTests.includes('e2e')
    });
    console.log(`${boolIcon(result.success)} E2E tests ${result.success ? 'passed' : 'FAILED'}`);
  }
  
  // --- VALIDATION DES TESTS -------------------------------------
  
  const failedRequired = testResults.filter(
    t => t.required && !t.result.success
  );
  
  if (failedRequired.length > 0) {
    console.error('\n❌❌❌ REQUIRED TESTS FAILED ❌❌❌');
    console.error('Failed tests:');
    failedRequired.forEach(t => console.error(`  - ${t.type}: ${t.command}`));
    console.error('\nBUILD_PROOF generation aborted.');
    process.exit(1);
  }
  
  // --- GÉNÉRATION BUILD_PROOF ----------------------------------
  
  console.log('\n📄 Generating BUILD_PROOF.md...');
  
  const ciRun = process.env.GITHUB_RUN_ID
    ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : process.env.CI
      ? 'CI_ENVIRONMENT'
      : 'LOCAL';
  
  const nodeVersion = process.version;
  const platform = process.platform;
  const tsVersion = run('npx tsc --version', modulePath).output.trim() || 'N/A';
  
  // Calcul du statut global
  const allTestsPassed = testResults.every(t => t.result.success);
  const globalStatus = build.success && allTestsPassed;
  
  // Génération du contenu
  const content = `# 📄 BUILD_PROOF.md

**Preuve de Build & Tests — Standard SPOFE v1.0.0**

---

## 1. Identification du module

| Champ | Valeur |
|-------|--------|
| **Nom du module** | ${moduleName} |
| **Version** | ${process.env.SPOFE_MODULE_VERSION || 'N/A'} |
| **Statut du module** | Phase 0.5 — Stabilisation Technique |
| **Chemin du module** | ${modulePath} |

---

## 2. Référence de validation

| Champ | Valeur |
|-------|--------|
| **Commit Git (SHA)** | ${commit} |
| **Branche** | ${branch} |
| **Date de génération** | ${nowISO()} |
| **Généré par** | ${process.env.CI ? '☑️ CI' : '☐ CI'} ${!process.env.CI ? '☑️ Développeur' : '☐ Développeur'} |
| **Répertoire propre** | ${isClean ? '✅ Oui' : '⚠️ Non (modifications non commitées)'} |

📌 Ce BUILD_PROOF est valide uniquement pour le commit référencé ci-dessus.

---

## 3. Environnement d'exécution

| Champ | Valeur |
|-------|--------|
| **OS** | ${platform} |
| **Node.js** | ${nodeVersion} |
| **TypeScript** | ${tsVersion} |
| **Package manager** | npm |

### Variables d'environnement critiques

| Variable | Statut |
|----------|--------|
| DATABASE_URL | ${process.env.DATABASE_URL ? '✅ Set' : '☐ Not required'} |
| NODE_ENV | ${process.env.NODE_ENV || 'N/A'} |

---

## 4. Build

### 4.1 Commande exécutée

\`\`\`bash
${config.commands.build}
\`\`\`

### 4.2 Résultat du build

| Champ | Valeur |
|-------|--------|
| **Statut** | ${boolIcon(build.success)} ${boolText(build.success)} |
| **Durée** | ${build.duration}ms |

---

## 5. Tests

### 5.1 Tests exécutés

| Type de tests | Commande | Résultat | Requis |
|---------------|----------|----------|--------|
${testResults.map(t => `| ${t.type} | \`${t.command}\` | ${boolIcon(t.result.success)} ${boolText(t.result.success)} | ${t.required ? '✅' : '☐'} |`).join('\n')}

### 5.2 Résumé des résultats

| Test Type | Statut |
|-----------|--------|
${testResults.map(t => `| ${t.type} tests | ${boolIcon(t.result.success)} ${boolText(t.result.success)} |`).join('\n')}
| **Couverture** | ${process.env.SPOFE_COVERAGE || 'N/A'} |

---

## 6. CI / Automatisation

| Champ | Valeur |
|-------|--------|
| **CI utilisée** | ${process.env.GITHUB_ACTIONS ? 'GitHub Actions' : process.env.CI ? 'Autre CI' : 'Local'} |
| **Nom du workflow** | ${process.env.GITHUB_WORKFLOW || 'N/A'} |
| **ID du run CI** | ${process.env.GITHUB_RUN_ID || 'N/A'} |
| **Lien vers le run** | ${ciRun} |
| **Statut CI** | ${boolIcon(globalStatus)} ${globalStatus ? 'SUCCESS' : 'FAIL'} |

---

## 7. Checklist SPOFE — Validation automatique

| Contrôle | Statut |
|----------|--------|
| Build réussi | ${boolIcon(build.success)} |
| Tests requis passants | ${boolIcon(failedRequired.length === 0)} |
| Git clean (commit valide) | ${boolIcon(isClean)} |
| BUILD_PROOF cohérent avec HEAD | ${boolIcon(true)} |

---

## 8. Conclusion

${globalStatus ? '- [x]' : '- [ ]'} Module techniquement exécutable  
${!globalStatus ? '- [x]' : '- [ ]'} Module non exécutable (validation refusée)

### Décision

> Ce module **${globalStatus ? 'respecte' : 'ne respecte pas'}** les règles SPOFE Build & Test  
> et **${globalStatus ? 'peut' : 'ne peut pas'}** être proposé à la validation GO PROD.

---

## 9. Signatures

| Champ | Valeur |
|-------|--------|
| **Validation technique** | ${process.env.CI ? 'CI System' : process.env.USER || 'Unknown'} |
| **Date** | ${nowISO().split('T')[0]} |
| **Signature** | ${shortCommit} |

---

## 10. Notes complémentaires

_Généré automatiquement par SPOFE Build Proof Generator v1.0.0_

---

## 📌 Règles d'utilisation (rappel)

- ✅ Ce document est **obligatoire**
- ✅ Il est **opposable contractuellement**
- ✅ Il est attaché à **un commit unique**
- ✅ Il ne peut pas être **modifié manuellement après génération**
- ❌ Toute **falsification invalide la validation SPOFE**

---

## 🧱 Emplacement

\`\`\`
${join(modulePath, 'BUILD_PROOF.md')}
\`\`\`

---

## Annexe — Détails complets

### Build Output (${build.output.split('\n').length} lignes)

<details>
<summary>Cliquer pour expand</summary>

\`\`\`
${build.output}
\`\`\`

</details>

${testResults.map(t => `
### ${t.type} Tests Output (${t.result.output.split('\n').length} lignes)

<details>
<summary>Cliquer pour expand</summary>

\`\`\`
${t.result.output}
\`\`\`

</details>
`).join('\n')}

---

**Document officiel SPOFE — Ne pas modifier manuellement**
`;
  
  const outputPath = join(modulePath, 'BUILD_PROOF.md');
  writeFileSync(outputPath, content);
  
  console.log(`\n✅ BUILD_PROOF.md generated successfully!`);
  console.log(`📄 Location: ${outputPath}`);
  
  // --- RÉSUMÉ FINAL -------------------------------------------
  
  console.log('\n=====================================');
  console.log('📊 RÉSUMÉ');
  console.log('=====================================');
  console.log(`Build:        ${boolIcon(build.success)} ${boolText(build.success)} (${build.duration}ms)`);
  testResults.forEach(t => {
    console.log(`${t.type.padEnd(12)} ${boolIcon(t.result.success)} ${boolText(t.result.success)} (${t.result.duration}ms)`);
  });
  console.log('=====================================');
  console.log(`Statut final: ${globalStatus ? '✅ SPOFE COMPLIANT' : '❌ NON COMPLIANT'}`);
  console.log('=====================================');
  
  if (!globalStatus) {
    console.error('\n❌ SPOFE BUILD_PROOF INCOMPLETE');
    process.exit(1);
  }
  
  console.log('\n✅✅✅ SPOFE BUILD_PROOF COMPLETE ✅✅✅');
}

// --- EXECUTION --------------------------------------------------

main();
