#!/usr/bin/env tsx
/**
 * Update Governance Rules - SPOFE Build/Test Rules v1.1.0
 * 
 * Script automatique pour mettre à jour les règles de gouvernance SPOFE
 * de manière contrôlée, traçable et reproductible.
 * 
 * Usage:
 *   npx tsx update-governance-rules.ts [--dry-run] [--no-tag]
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

interface UpdateStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

class GovernanceUpdater {
  private steps: UpdateStep[] = [];
  private dryRun: boolean;
  private createTag: boolean;
  private startTime = Date.now();

  constructor(options: { dryRun?: boolean; createTag?: boolean } = {}) {
    this.dryRun = options.dryRun || false;
    this.createTag = options.createTag !== false;
  }

  private log(message: string, emoji = '📋') {
    console.log(`${emoji} ${message}`);
  }

  private execGit(command: string, description: string): string {
    this.log(`${description}...`, '🔧');
    
    if (this.dryRun) {
      this.log(`[DRY RUN] Would execute: git ${command}`, '🎭');
      return '';
    }

    try {
      const result = execSync(`git ${command}`, { 
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      this.updateStep(description, 'success');
      return result;
    } catch (error: any) {
      this.updateStep(description, 'error', error.message);
      throw error;
    }
  }

  private updateStep(name: string, status: 'pending' | 'running' | 'success' | 'error', message?: string) {
    const existingStep = this.steps.find(s => s.name === name);
    if (existingStep) {
      existingStep.status = status;
      existingStep.message = message;
      existingStep.duration = Date.now() - this.startTime;
    } else {
      this.steps.push({ name, status, message, duration: Date.now() - this.startTime });
    }

    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'running' ? '⚡' : '⏳';
    this.log(`${name}: ${status.toUpperCase()}${message ? ` - ${message}` : ''}`, emoji);
  }

  /**
   * Vérifie les pré-requis
   */
  private checkPrerequisites(): void {
    this.log('Vérification des pré-requis...', '🔍');

    // Vérifier que nous sommes dans un repo Git
    try {
      execSync('git status', { stdio: 'ignore' });
      this.updateStep('Git Repository Check', 'success');
    } catch {
      this.updateStep('Git Repository Check', 'error', 'Not in a Git repository');
      throw new Error('Ce script doit être exécuté dans un repository Git');
    }

    // Vérifier que nous sommes sur main
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      if (currentBranch !== 'main' && currentBranch !== 'master') {
        this.updateStep('Branch Check', 'error', `Currently on ${currentBranch}, need main/master`);
        throw new Error(`Veuillez basculer sur la branche main/master (actuellement sur ${currentBranch})`);
      }
      this.updateStep('Branch Check', 'success');
    } catch (error) {
      this.updateStep('Branch Check', 'error', 'Cannot determine current branch');
      throw error;
    }

    // Vérifier que le working directory est propre
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim()) {
        this.updateStep('Working Directory Check', 'error', 'Uncommitted changes detected');
        throw new Error('Le working directory doit être propre avant la mise à jour');
      }
      this.updateStep('Working Directory Check', 'success');
    } catch (error) {
      this.updateStep('Working Directory Check', 'error', 'Cannot check working directory status');
      throw error;
    }
  }

  /**
   * Crée la branche de gouvernance
   */
  private createGovernanceBranch(): void {
    const branchName = 'governance/build-test-rules-v1.1.0';
    
    try {
      this.execGit(`checkout -b ${branchName}`, 'Create Governance Branch');
    } catch (error) {
      // Si la branche existe déjà, basculer dessus
      this.log('Branche existe déjà, bascule dessus...', '🔄');
      this.execGit(`checkout ${branchName}`, 'Switch to Governance Branch');
    }
  }

  /**
   * Génère le contenu RULES_BUILD_TEST.md v1.1.0
   */
  private generateRulesContent(): string {
    return `# RULES_BUILD_TEST.md

**Version:** 1.1.0  
**Statut:** OFFICIEL  
**Applicabilité:** Immédiate  
**Opposabilité:** Contractuelle  

## 🎯 OBJECTIF

Définir les règles SPOFE pour distinguer formellement les **rapports de diagnostic** des **preuves exécutables opposables** dans le processus de validation technique.

## 🚫 RÈGLE FONDAMENTALE : NON-SUBSTITUABILITÉ

**Un rapport de diagnostic NE PEUT PAS être utilisé comme BUILD_PROOF SPOFE.**

### ❌ INTERDIT
- Utiliser un fichier .md de diagnostic comme preuve de production
- Présenter des "métriques" sans exécution contrôlée
- Valider un module sur la base d'un rapport statique
- Contourner la validation technique par documentation

### ✅ AUTORISÉ
- Utiliser les diagnostics pour l'investigation et le debugging
- Générer des rapports de développement et de monitoring
- Documenter l'état technique à des fins d'analyse
- Compléter les BUILD_PROOF par des métriques contextuelles

## 🏗️ BUILD_PROOF SPOFE - DÉFINITION CONTRACTUELLE

### Artefact officiel et exclusif pour validation GO PROD

Un BUILD_PROOF SPOFE valide DOIT :

1. **✅ Être généré par exécution automatique**
   - Script reproductible : \`generate-build-proof.ts\`
   - Validation en temps réel des métriques
   - Tests exécutés et résultats vérifiés

2. **✅ Contenir des preuves d'exécution**
   - Compilation TypeScript : 0 erreur (\`npx tsc --noEmit\`)
   - Tests unitaires : résultats d'exécution Jest
   - Architecture SPOFE : vérification des couches
   - Configuration : validation des fichiers critiques

3. **✅ Être daté et traçable**
   - Timestamp de génération
   - Version du module validé
   - Environnement d'exécution
   - Hash Git du commit validé

4. **✅ Fournir un statut binaire**
   - 🟢 SUCCESS : Module prêt pour production
   - 🔴 ERROR : Blockers critiques détectés
   - 🟡 WARNING : Améliorations recommandées

## 📊 RAPPORTS DE DIAGNOSTIC - UTILISATION LÉGITIME

### Outils d'analyse et d'investigation (NON opposables)

Les rapports de diagnostic peuvent :

1. **🔍 Analyser l'état du code**
   - Détecter les problèmes techniques
   - Documenter les erreurs rencontrées
   - Proposer des pistes d'amélioration

2. **📈 Fournir des métriques contextuelles**
   - Nombre de fichiers TypeScript
   - Couverture de tests estimée
   - Architecture et structure détectée

3. **🗂️ Documenter les investigations**
   - Historique des erreurs résolues
   - Évolution de la qualité technique
   - Traçabilité des corrections

## 🔒 CHAÎNE DE VALIDATION OFFICIELLE

### Séquence obligatoire pour validation GO PROD

1. **Phase de développement**
   - Rapports de diagnostic autorisés pour debugging
   - Investigation libre des problèmes techniques

2. **Phase de stabilisation** 
   - Correction des erreurs identifiées
   - Validation incrémentale par diagnostic

3. **Phase de validation contractuelle**
   - ⚠️ SEUL le BUILD_PROOF SPOFE est opposable
   - Exécution de \`npm run build-proof\`
   - Statut GO PROD basé uniquement sur le résultat

4. **Phase de production**
   - Déploiement autorisé seulement si BUILD_PROOF = SUCCESS
   - Traçabilité complete maintenue

## 🎮 RESPONSABILITÉS

### Développeurs
- Utiliser les diagnostics pour analyser et corriger
- Exécuter le BUILD_PROOF avant toute demande de validation
- Ne jamais substituer diagnostic et BUILD_PROOF

### Architectes/Tech Leads  
- Valider uniquement sur BUILD_PROOF SUCCESS
- Rejeter toute validation basée sur diagnostic
- Maintenir la rigueur de la chaîne officielle

### DevOps/Release Management
- Intégrer BUILD_PROOF dans les pipelines CI/CD
- Bloquer les déploiements sans BUILD_PROOF valide
- Maintenir la traçabilité des validations

## 🚨 VIOLATIONS ET SANCTIONS

### Cas de violation
- Utilisation d'un diagnostic comme BUILD_PROOF
- Validation GO PROD sans BUILD_PROOF SUCCESS  
- Contournement de la chaîne officielle
- Documentation trompeuse sur l'état technique

### Conséquences
- ⛔ Rejet immédiat de la demande de validation
- 📋 Audit technique obligatoire du module
- 🔄 Re-validation complète requise
- 📢 Communication à l'équipe sur la violation

## 🔄 MISE À JOUR ET ÉVOLUTION

### Versioning de ce document
- **v1.0.0** : Règles initiales SPOFE
- **v1.1.0** : Clarification diagnostic vs BUILD_PROOF (CURRENT)
- Futures versions : évolution contrôlée et documentée

### Processus de modification
1. Proposition via branche \`governance/\*\`
2. Review technique et métier
3. Validation architecturale  
4. Mise à jour officielle avec traçabilité Git

---

**Document officiel SPOFE - Non modifiable sans processus gouvernance**  
**Dernière mise à jour : ${new Date().toISOString().split('T')[0]}**
`;
  }

  /**
   * Met à jour le fichier RULES_BUILD_TEST.md
   */
  private updateRulesFile(): void {
    const rulesPath = 'spofe/governance/RULES_BUILD_TEST.md';
    const rulesDir = dirname(rulesPath);

    // Créer le répertoire si nécessaire
    if (!existsSync(rulesDir)) {
      if (this.dryRun) {
        this.log(`[DRY RUN] Would create directory: ${rulesDir}`, '🎭');
      } else {
        mkdirSync(rulesDir, { recursive: true });
        this.log(`Created directory: ${rulesDir}`, '📁');
      }
    }

    const rulesContent = this.generateRulesContent();

    if (this.dryRun) {
      this.log(`[DRY RUN] Would write ${rulesContent.length} chars to ${rulesPath}`, '🎭');
    } else {
      writeFileSync(rulesPath, rulesContent, 'utf-8');
      this.log(`Updated ${rulesPath} (${rulesContent.length} chars)`, '📄');
    }

    this.updateStep('Update Rules File', 'success');
  }

  /**
   * Met à jour le CHANGELOG.md
   */
  private updateChangelog(): void {
    const changelogPath = 'spofe/governance/CHANGELOG.md';
    const changelogDir = dirname(changelogPath);

    // Créer le répertoire si nécessaire
    if (!existsSync(changelogDir)) {
      if (!this.dryRun) {
        mkdirSync(changelogDir, { recursive: true });
      }
    }

    const newEntry = `## [Governance] Build/Test Rules — v1.1.0

**Date:** ${new Date().toISOString().split('T')[0]}  
**Statut:** OFFICIEL

### 🎯 Modifications

- **Clarification normative** entre rapports de diagnostic et BUILD_PROOF SPOFE contractuel
- **Interdiction explicite** d'utiliser un diagnostic comme preuve GO PROD
- **Introduction de la règle de non-substituabilité** (diagnostic ≠ BUILD_PROOF)
- **Mise à jour de la chaîne officielle** de validation SPOFE
- **Définition contractuelle** du BUILD_PROOF comme seul artefact opposable

### 🔒 Impact

- Renforcement de la rigueur technique
- Sécurisation des processus de validation
- Amélioration de la traçabilité
- Clarification des responsabilités

### 🎮 Actions requises

- Mise à jour des scripts de validation
- Formation des équipes sur les nouvelles règles
- Intégration dans les pipelines CI/CD

---

`;

    let changelogContent = newEntry;

    // Si le fichier existe, ajouter en haut
    if (existsSync(changelogPath)) {
      const existingContent = readFileSync(changelogPath, 'utf-8');
      changelogContent = newEntry + existingContent;
    } else {
      // Créer le header pour un nouveau fichier
      const header = `# SPOFE Governance Changelog

Ce fichier trace les évolutions des règles et processus de gouvernance SPOFE.

---

`;
      changelogContent = header + newEntry;
    }

    if (this.dryRun) {
      this.log(`[DRY RUN] Would write changelog entry to ${changelogPath}`, '🎭');
    } else {
      writeFileSync(changelogPath, changelogContent, 'utf-8');
      this.log(`Updated ${changelogPath}`, '📝');
    }

    this.updateStep('Update Changelog', 'success');
  }

  /**
   * Effectue le commit de gouvernance
   */
  private commitChanges(): void {
    const commitMessage = 'governance(build-test): clarify diagnostic vs BUILD_PROOF (v1.1.0)';
    
    this.execGit('add spofe/governance/RULES_BUILD_TEST.md spofe/governance/CHANGELOG.md', 'Stage Changes');
    this.execGit(`commit -m "${commitMessage}"`, 'Commit Governance Changes');
  }

  /**
   * Merge dans main et crée le tag
   */
  private mergeAndTag(): void {
    // Retour sur main
    this.execGit('checkout main', 'Switch to Main Branch');
    
    // Merge de la branche de gouvernance
    this.execGit('merge governance/build-test-rules-v1.1.0', 'Merge Governance Branch');

    // Créer le tag si demandé
    if (this.createTag) {
      const tagName = 'governance-build-test-v1.1.0';
      const tagMessage = 'SPOFE Build/Test Rules v1.1.0';
      
      this.execGit(`tag -a ${tagName} -m "${tagMessage}"`, 'Create Governance Tag');
      
      if (!this.dryRun) {
        this.log('Tag créé. Pour pousser vers le remote:', '🏷️');
        this.log(`  git push origin ${tagName}`, '💡');
      }
    }
  }

  /**
   * Valide la mise à jour
   */
  private validateUpdate(): void {
    this.log('Validation de la mise à jour...', '🔍');

    // Vérifier que le fichier existe et contient la bonne version
    const rulesPath = 'spofe/governance/RULES_BUILD_TEST.md';
    
    if (existsSync(rulesPath)) {
      const content = readFileSync(rulesPath, 'utf-8');
      if (content.includes('1.1.0')) {
        this.updateStep('Validate Rules Version', 'success');
      } else {
        this.updateStep('Validate Rules Version', 'error', 'Version 1.1.0 not found in rules file');
      }
    } else {
      this.updateStep('Validate Rules File', 'error', 'Rules file not found');
    }

    // Vérifier le changelog
    const changelogPath = 'spofe/governance/CHANGELOG.md';
    if (existsSync(changelogPath)) {
      this.updateStep('Validate Changelog', 'success');
    } else {
      this.updateStep('Validate Changelog', 'error', 'Changelog file not found');
    }
  }

  /**
   * Génère le rapport final
   */
  private generateReport(): void {
    const totalSteps = this.steps.length;
    const successSteps = this.steps.filter(s => s.status === 'success').length;
    const errorSteps = this.steps.filter(s => s.status === 'error').length;

    console.log('\n' + '='.repeat(60));
    console.log('📋 RAPPORT DE MISE À JOUR GOUVERNANCE');
    console.log('='.repeat(60));

    const statusEmoji = errorSteps > 0 ? '🔴' : successSteps === totalSteps ? '🟢' : '🟡';
    console.log(`${statusEmoji} Statut global: ${errorSteps > 0 ? 'ERREUR' : successSteps === totalSteps ? 'SUCCÈS' : 'PARTIEL'}`);
    console.log(`📊 Résumé: ${successSteps}/${totalSteps} étapes réussies`);

    if (errorSteps > 0) {
      console.log('\n❌ Erreurs détectées:');
      this.steps.filter(s => s.status === 'error').forEach(step => {
        console.log(`   • ${step.name}: ${step.message}`);
      });
    }

    if (successSteps === totalSteps && !this.dryRun) {
      console.log('\n🎉 MISE À JOUR RÉUSSIE !');
      console.log('\n📋 Actions complétées:');
      console.log('   ✅ Branche governance créée');
      console.log('   ✅ RULES_BUILD_TEST.md v1.1.0 mis à jour');  
      console.log('   ✅ CHANGELOG.md mis à jour');
      console.log('   ✅ Commit de gouvernance effectué');
      console.log('   ✅ Merge dans main réalisé');
      if (this.createTag) {
        console.log('   ✅ Tag de gouvernance créé');
      }

      console.log('\n💡 Prochaines étapes recommandées:');
      console.log('   • Pousser les changements: git push origin main');
      if (this.createTag) {
        console.log('   • Pousser le tag: git push origin governance-build-test-v1.1.0');
      }
      console.log('   • Communiquer la mise à jour aux équipes');
      console.log('   • Valider que les scripts respectent la v1.1.0');
    }

    if (this.dryRun) {
      console.log('\n🎭 MODE DRY RUN - Aucun changement appliqué');
      console.log('   Relancez sans --dry-run pour appliquer les modifications');
    }
  }

  /**
   * Exécute la mise à jour complète
   */
  async execute(): Promise<void> {
    try {
      console.log('🎯 MISE À JOUR GOUVERNANCE SPOFE - Build/Test Rules v1.1.0');
      console.log('='.repeat(60));
      
      if (this.dryRun) {
        console.log('🎭 MODE DRY RUN ACTIVÉ - Simulation sans modification\n');
      }

      this.checkPrerequisites();
      this.createGovernanceBranch();
      this.updateRulesFile();
      this.updateChangelog();
      this.commitChanges();
      this.mergeAndTag();
      this.validateUpdate();

    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour:', error.message);
      process.exit(1);
    } finally {
      this.generateReport();
    }
  }
}

/**
 * Point d'entrée principal
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const createTag = !args.includes('--no-tag');

  if (args.includes('--help')) {
    console.log(`
🎯 Update Governance Rules - SPOFE Build/Test Rules v1.1.0

Usage:
  npx tsx update-governance-rules.ts [options]

Options:
  --dry-run     Simulate without making changes
  --no-tag      Skip tag creation
  --help        Show this help

Examples:
  npx tsx update-governance-rules.ts                    # Full update
  npx tsx update-governance-rules.ts --dry-run          # Simulation
  npx tsx update-governance-rules.ts --no-tag          # Update without tag
`);
    process.exit(0);
  }

  const updater = new GovernanceUpdater({ dryRun, createTag });
  await updater.execute();
}

// Exécution directe du script
main();

export { GovernanceUpdater };