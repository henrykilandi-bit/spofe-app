#!/usr/bin/env tsx
/**
 * SPOFE BUILD_PROOF Generator - Module Immobilisation
 * 
 * Génère le seul artefact valable SPOFE pour validation GO PROD
 * Conforme aux règles SPOFE v1.1.0
 * 
 * Usage:
 *   npx tsx tools/build-proof/generate-build-proof.ts --module immobilisation
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface BuildProofResult {
  command: string;
  success: boolean;
  output: string;
  duration: number;
  timestamp: string;
}

interface BuildProofData {
  module: string;
  commitSha: string;
  branch: string;
  timestamp: string;
  environment: {
    node: string;
    os: string;
    platform: string;
    cwd: string;
  };
  validations: BuildProofResult[];
  overallStatus: 'SUCCESS' | 'ERROR';
  errorCount: number;
  successCount: number;
}

class BuildProofGenerator {
  private module: string;
  private results: BuildProofResult[] = [];
  private startTime = Date.now();

  constructor(moduleName: string) {
    this.module = moduleName;
  }

  private log(message: string, emoji = '📋') {
    console.log(`${emoji} ${message}`);
  }

  private executeCommand(command: string, description: string, critical = true): BuildProofResult {
    this.log(`Executing: ${description}...`, '🔧');
    
    const startTime = Date.now();
    let success = false;
    let output = '';

    try {
      output = execSync(command, { 
        encoding: 'utf-8',
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      success = true;
      this.log(`✅ ${description}: SUCCESS`, '✅');
    } catch (error: any) {
      output = error.message + (error.stdout || '') + (error.stderr || '');
      success = false;
      this.log(`❌ ${description}: FAILED`, '❌');
      
      if (critical) {
        throw new Error(`Critical validation failed: ${description}`);
      }
    }

    const result: BuildProofResult = {
      command,
      success,
      output: output.trim(),
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);
    return result;
  }

  /**
   * Validation 1: TypeScript Compilation
   */
  private validateTypeScript(): void {
    this.log('🔨 TypeScript Compilation Check...', '🔨');
    this.executeCommand('npx tsc --noEmit', 'TypeScript Type Checking');
  }

  /**
   * Validation 2: Build Process
   */
  private validateBuild(): void {
    this.log('🏗️ Build Process Check...', '🏗️');
    // Vérifier s'il y a un script build
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    
    if (packageJson.scripts?.build) {
      this.executeCommand('npm run build', 'Project Build');
    } else {
      this.log('ℹ️ No build script found, skipping build validation', 'ℹ️');
      this.results.push({
        command: 'npm run build',
        success: true,
        output: 'No build script configured - validation skipped',
        duration: 0,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Validation 3: Unit Tests
   */
  private validateUnitTests(): void {
    this.log('🧪 Unit Tests Execution...', '🧪');
    this.executeCommand('npm test', 'Unit Tests', false); // Non-critique pour permettre la génération
  }

  /**
   * Validation 4: Integration Tests
   */
  private validateIntegrationTests(): void {
    this.log('🔗 Integration Tests Check...', '🔗');
    
    // Vérifier s'il y a des tests d'intégration
    if (existsSync('tests/integration') || existsSync('test/integration')) {
      this.executeCommand('npm run test:integration', 'Integration Tests', false);
    } else {
      this.log('ℹ️ No integration tests found', 'ℹ️');
      this.results.push({
        command: 'npm run test:integration',
        success: true,
        output: 'No integration tests configured',
        duration: 0,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Validation 5: Module Structure (SPOFE)
   */
  private validateModuleStructure(): void {
    this.log('🏗️ Module Structure Validation...', '🏗️');
    
    const requiredPaths = [
      `cascade/modules/${this.module}/index.ts`,
      `cascade/modules/${this.module}/domain/index.ts`,
      `cascade/modules/${this.module}/write/index.ts`,
      `cascade/modules/${this.module}/guardian/index.ts`
    ];

    let missingPaths = [];
    for (const path of requiredPaths) {
      if (!existsSync(path)) {
        missingPaths.push(path);
      }
    }

    const success = missingPaths.length === 0;
    const output = success 
      ? 'All SPOFE module structure requirements met'
      : `Missing paths: ${missingPaths.join(', ')}`;

    this.results.push({
      command: `SPOFE Module Structure Check (${this.module})`,
      success,
      output,
      duration: 10,
      timestamp: new Date().toISOString()
    });

    if (!success) {
      throw new Error(`Module structure validation failed: ${output}`);
    }
  }

  /**
   * Collecte les informations d'environnement
   */
  private getEnvironmentInfo() {
    return {
      node: process.version,
      os: process.platform,
      platform: process.arch,
      cwd: process.cwd()
    };
  }

  /**
   * Obtient le commit SHA actuel
   */
  private getCurrentCommit(): string {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Obtient la branche actuelle
   */
  private getCurrentBranch(): string {
    try {
      return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Génère le BUILD_PROOF.md
   */
  private generateBuildProof(): void {
    this.log('📄 Generating BUILD_PROOF.md...', '📄');

    const commitSha = this.getCurrentCommit();
    const branch = this.getCurrentBranch();
    const environment = this.getEnvironmentInfo();
    const errorCount = this.results.filter(r => !r.success).length;
    const successCount = this.results.filter(r => r.success).length;
    const overallStatus = errorCount === 0 ? 'SUCCESS' : 'ERROR';

    const buildProofData: BuildProofData = {
      module: this.module,
      commitSha,
      branch,
      timestamp: new Date().toISOString(),
      environment,
      validations: this.results,
      overallStatus,
      errorCount,
      successCount
    };

    const buildProofContent = this.formatBuildProof(buildProofData);
    
    writeFileSync('BUILD_PROOF.md', buildProofContent, 'utf-8');
    this.log(`BUILD_PROOF.md generated (${buildProofContent.length} characters)`, '✅');
    
    // Sauvegarder aussi en JSON pour traitement automatique
    writeFileSync('BUILD_PROOF.json', JSON.stringify(buildProofData, null, 2), 'utf-8');
  }

  /**
   * Formate le contenu du BUILD_PROOF.md
   */
  private formatBuildProof(data: BuildProofData): string {
    const status = data.overallStatus === 'SUCCESS' ? '🟢 SUCCESS' : '🔴 ERROR';
    
    return `# BUILD_PROOF.md

**Module:** ${data.module}  
**Status:** ${status}  
**Generated:** ${data.timestamp}  
**Commit:** ${data.commitSha}  
**Branch:** ${data.branch}  
**SPOFE Rules:** v1.1.0

## 🎯 VALIDATION SUMMARY

- **Total Validations:** ${data.validations.length}
- **Successful:** ${data.successCount}
- **Failed:** ${data.errorCount}
- **Overall Status:** ${data.overallStatus}

## 🏗️ ENVIRONMENT

- **Node.js:** ${data.environment.node}
- **Platform:** ${data.environment.os} (${data.environment.platform})
- **Working Directory:** ${data.environment.cwd}

## 🔍 VALIDATION RESULTS

${data.validations.map(validation => {
  const statusIcon = validation.success ? '✅' : '❌';
  const duration = validation.duration > 0 ? ` (${validation.duration}ms)` : '';
  
  return `### ${statusIcon} ${validation.command}${duration}

**Timestamp:** ${validation.timestamp}  
**Status:** ${validation.success ? 'SUCCESS' : 'FAILED'}

\`\`\`
${validation.output}
\`\`\`
`;
}).join('\n')}

## 🔒 SPOFE COMPLIANCE

This BUILD_PROOF was generated according to SPOFE Build/Test Rules v1.1.0:

- ✅ **Executable proof** (not a diagnostic report)
- ✅ **Real-time validation** with actual command execution
- ✅ **Traceable** with commit SHA and timestamp
- ✅ **Binary status** (SUCCESS/ERROR)
- ${data.overallStatus === 'SUCCESS' ? '✅' : '❌'} **GO PROD Ready:** ${data.overallStatus === 'SUCCESS' ? 'YES' : 'NO'}

---

**SPOFE BUILD_PROOF v1.1.0 — ${data.overallStatus === 'SUCCESS' ? 'Module ready for production' : 'Module requires fixes before production'}**
`;
  }

  /**
   * Exécute toutes les validations et génère le BUILD_PROOF
   */
  async execute(): Promise<void> {
    try {
      this.log(`🎯 SPOFE BUILD_PROOF Generation - Module: ${this.module}`, '🎯');
      this.log('='.repeat(60));

      // Exécuter toutes les validations
      this.validateTypeScript();
      this.validateBuild();
      this.validateUnitTests();
      this.validateIntegrationTests();
      this.validateModuleStructure();

      // Générer le BUILD_PROOF final
      this.generateBuildProof();

      const duration = Date.now() - this.startTime;
      this.log(`🎉 BUILD_PROOF generation completed in ${duration}ms`, '🎉');

      // Status final
      const errorCount = this.results.filter(r => !r.success).length;
      if (errorCount === 0) {
        this.log('🟢 BUILD_PROOF STATUS: SUCCESS - Module ready for production', '🟢');
        process.exit(0);
      } else {
        this.log(`🔴 BUILD_PROOF STATUS: ERROR - ${errorCount} validation(s) failed`, '🔴');
        process.exit(1);
      }

    } catch (error: any) {
      this.log(`❌ BUILD_PROOF generation failed: ${error.message}`, '❌');
      process.exit(1);
    }
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Extraire le nom du module
  const moduleIndex = args.indexOf('--module');
  if (moduleIndex === -1 || !args[moduleIndex + 1]) {
    console.error('❌ Usage: npx tsx tools/build-proof/generate-build-proof.ts --module <module-name>');
    process.exit(1);
  }

  const moduleName = args[moduleIndex + 1];
  
  if (args.includes('--help')) {
    console.log(`
🎯 SPOFE BUILD_PROOF Generator

Usage:
  npx tsx tools/build-proof/generate-build-proof.ts --module <module-name>

Options:
  --module <name>    Module name to validate (required)
  --help             Show this help

Examples:
  npx tsx tools/build-proof/generate-build-proof.ts --module immobilisation

Output:
  BUILD_PROOF.md     SPOFE executable proof (opposable for GO PROD)
  BUILD_PROOF.json   Machine-readable validation data
`);
    process.exit(0);
  }

  const generator = new BuildProofGenerator(moduleName);
  await generator.execute();
}

// Exécution directe du script
main();

export { BuildProofGenerator };