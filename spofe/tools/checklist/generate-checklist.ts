#!/usr/bin/env node
/**
 * SPOFE CHECKLIST GENERATOR
 * Version 1.0.0 — Génération automatique de CHECKLIST_GO_PROD.md
 * 
 * 🔒 Ce script génère automatiquement la checklist GO PROD
 * à partir des documents contractuels du module.
 * 
 * Principe SPOFE : La checklist est un artefact dérivé,
 * pas un document libre modifiable manuellement.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { createHash } from 'crypto';

// --- CONFIGURATION ------------------------------------------------

interface ChecklistConfig {
  moduleRoot: string;
  outputPath: string;
  contractFiles: string[];
  hashFile: string;
}

function loadConfig(): ChecklistConfig {
  return {
    moduleRoot: resolve(process.env.SPOFE_MODULE_PATH || process.cwd()),
    outputPath: resolve(process.env.SPOFE_MODULE_PATH || process.cwd(), 'CHECKLIST_GO_PROD.md'),
    hashFile: resolve(process.env.SPOFE_MODULE_PATH || process.cwd(), '.checklist.hash'),
    contractFiles: [
      'CONTRACT.md',
      'GUARDIAN.md',
      'COMMANDS_EVENTS.md',
      'READ_MODELS.md',
      'API_READ_ONLY.md',
      'OPENAPI_GENERATION.md',
      'DDD.md'
    ]
  };
}

// --- UTILITAIRES --------------------------------------------------

function fail(msg: string): never {
  console.error(`\n❌❌❌ CHECKLIST GENERATION FAILED ❌❌❌`);
  console.error(`Reason: ${msg}`);
  process.exit(1);
}

function ok(msg: string) {
  console.log(`✅ ${msg}`);
}

function warn(msg: string) {
  console.log(`⚠️  ${msg}`);
}

function section(title: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log(`${'='.repeat(60)}`);
}

// --- STRUCTURES DE DONNÉES ----------------------------------------

interface ChecklistItem {
  priority: 'P1' | 'P2' | 'P3';
  text: string;
  sourceFile: string;
  lineNumber: number;
}

interface ParsedContract {
  file: string;
  items: ChecklistItem[];
}

// --- PARSING DES CONTRATS -----------------------------------------

function parseContractFile(filePath: string, fileName: string): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let currentPriority: 'P1' | 'P2' | 'P3' | null = null;
    let inChecklistBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Détecter les balises SPOFE:CHECKLIST
      const tagMatch = line.match(/<!--\s*SPOFE:CHECKLIST\s*(P[123])\s*-->/i);
      if (tagMatch) {
        currentPriority = tagMatch[1] as 'P1' | 'P2' | 'P3';
        inChecklistBlock = true;
        continue;
      }
      
      // Détecter la fin d'un bloc (nouveau titre ou balise fermante)
      if (inChecklistBlock) {
        // Fin du bloc si on rencontre un titre de même niveau ou plus haut
        if (line.match(/^#{1,3}\s/) || line.match(/<!--\s*SPOFE:END\s*-->/i)) {
          inChecklistBlock = false;
          currentPriority = null;
          continue;
        }
        
        // Ignorer les lignes vides
        if (line.trim() === '') continue;
        
        // Ignorer les commentaires HTML
        if (line.trim().startsWith('<!--')) continue;
        
        // Capturer les items de liste
        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
          const text = line.replace(/^\s*[-*]\s*/, '').trim();
          if (text && currentPriority) {
            items.push({
              priority: currentPriority,
              text,
              sourceFile: fileName,
              lineNumber
            });
          }
        }
      }
    }
    
    return items;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // Fichier absent, ignoré
    }
    throw error;
  }
}

// --- GÉNÉRATION DE LA CHECKLIST -----------------------------------

function generateChecklist(config: ChecklistConfig): ChecklistItem[] {
  section('1. PARSING DES CONTRATS');
  
  const allItems: ChecklistItem[] = [];
  let filesParsed = 0;
  let filesMissing = 0;
  
  for (const fileName of config.contractFiles) {
    const filePath = join(config.moduleRoot, fileName);
    
    if (!existsSync(filePath)) {
      warn(`${fileName} not found (optional)`);
      filesMissing++;
      continue;
    }
    
    const items = parseContractFile(filePath, fileName);
    allItems.push(...items);
    filesParsed++;
    
    if (items.length > 0) {
      console.log(`  ${fileName}: ${items.length} items`);
    }
  }
  
  console.log(`\n  Files parsed: ${filesParsed}`);
  console.log(`  Files missing: ${filesMissing}`);
  console.log(`  Total items: ${allItems.length}`);
  
  if (allItems.length === 0) {
    fail('No checklist items found in contracts. Ensure SPOFE:CHECKLIST tags are present.');
  }
  
  ok(`Parsed ${allItems.length} items from ${filesParsed} files`);
  
  return allItems;
}

// --- FORMATAGE DE LA SORTIE ---------------------------------------

function formatChecklist(items: ChecklistItem[]): string {
  // Grouper par priorité
  const grouped: Record<string, ChecklistItem[]> = {
    P1: [],
    P2: [],
    P3: []
  };
  
  for (const item of items) {
    grouped[item.priority].push(item);
  }
  
  // Construire le contenu
  let output = `# CHECKLIST GO PROD — SPOFE (AUTO-GENERATED)

⚠️ **AVERTISSEMENT — CE FICHIER EST GÉNÉRÉ AUTOMATIQUEMENT**

Ce fichier est généré automatiquement à partir des documents contractuels SPOFE.
**Toute modification manuelle invalide la validation SPOFE.**

Pour modifier cette checklist, mettez à jour les balises <!-- SPOFE:CHECKLIST Px --> 
dans les fichiers contractuels (CONTRACT.md, GUARDIAN.md, etc.) puis régénérez.

---

**Generated:** ${new Date().toISOString()}
**Version:** 1.0.0
**Tool:** spofe-checklist-generator
**Source:** Contrats SPOFE

---

## 📊 RÉSUMÉ

| Priorité | Items | Impact |
|----------|-------|--------|
| **P1 (Bloquant)** | ${grouped.P1.length} | ❌ GO PROD interdit si non validé |
| **P2 (Important)** | ${grouped.P2.length} | ⚠️ GO PROD conditionnel |
| **P3 (Optionnel)** | ${grouped.P3.length} | ℹ️ Information |
| **Total** | ${items.length} | |

---

`;

  // Section P1
  if (grouped.P1.length > 0) {
    output += `## 🔴 P1 — CRITIQUE (BLOQUANT GO PROD)\n\n`;
    output += `> Ces items doivent tous être validés pour autoriser le GO PROD.\n\n`;
    for (const item of grouped.P1) {
      output += `- [ ] (**P1**) ${item.text}  \n  *Source: ${item.sourceFile}:${item.lineNumber}*\n`;
    }
    output += '\n---\n\n';
  }
  
  // Section P2
  if (grouped.P2.length > 0) {
    output += `## 🟡 P2 — IMPORTANT (NON BLOQUANT)\n\n`;
    output += `> Ces items sont recommandés mais n\u0027empêchent pas le GO PROD.\n\n`;
    for (const item of grouped.P2) {
      output += `- [ ] (**P2**) ${item.text}  \n  *Source: ${item.sourceFile}:${item.lineNumber}*\n`;
    }
    output += '\n---\n\n';
  }
  
  // Section P3
  if (grouped.P3.length > 0) {
    output += `## 🟢 P3 — OPTIONNEL (INFORMATION)\n\n`;
    output += `> Ces items sont informatifs et optionnels.\n\n`;
    for (const item of grouped.P3) {
      output += `- [ ] (**P3**) ${item.text}  \n  *Source: ${item.sourceFile}:${item.lineNumber}*\n`;
    }
    output += '\n---\n\n';
  }
  
  // Footer
  output += `## 📋 INSTRUCTIONS DE VALIDATION\n\n`;
  output += `### Pour valider un item\n`;
  output += `Remplacez '[ ]' par '[x]' devant l\u0027item concerné.\n\n`;
  output += `**Exemple:**\n`;
  output += `- [x] (**P1**) Item valide ✅\n\n`;
  output += `### Pour régénérer cette checklist\n`;
  output += '```bash\n';
  output += `npx tsx spofe/tools/checklist/generate-checklist.ts\n`;
  output += '```\n\n';
  output += `### Pour vérifier l\u0027intégrité\n`;
  output += `Le script \`spofe-validate-module\` vérifie que cette checklist n\u0027a pas été modifiée manuellement.\n\n`;
  output += `---\n\n`;
  output += `*Document généré automatiquement — Ne pas modifier manuellement*\n`;
  
  return output;
}

// --- SAUVEGARDE ET HASH -------------------------------------------

function saveChecklist(content: string, config: ChecklistConfig): void {
  section('2. GÉNÉRATION DU FICHIER');
  
  // Écrire le fichier
  writeFileSync(config.outputPath, content);
  console.log(`  Output: ${config.outputPath}`);
  console.log(`  Size: ${content.length} bytes`);
  ok('CHECKLIST_GO_PROD.md generated');
}

function computeHash(content: string, config: ChecklistConfig): string {
  section('3. CALCUL DU HASH DE CONTRÔLE');
  
  const hash = createHash('sha256').update(content).digest('hex');
  
  // Sauvegarder le hash
  const hashContent = `${hash}  CHECKLIST_GO_PROD.md\n`;
  writeFileSync(config.hashFile, hashContent);
  
  console.log(`  Hash: ${hash.substring(0, 16)}...${hash.substring(hash.length - 16)}`);
  console.log(`  Stored in: ${config.hashFile}`);
  ok('Hash computed and stored');
  
  return hash;
}

// --- VÉRIFICATION POST-GÉNÉRATION -------------------------------

function verifyGeneration(config: ChecklistConfig): void {
  section('4. VÉRIFICATION POST-GÉNÉRATION');
  
  if (!existsSync(config.outputPath)) {
    fail('Generated file not found');
  }
  
  const stats = statSync(config.outputPath);
  console.log(`  File exists: ${config.outputPath}`);
  console.log(`  Size: ${stats.size} bytes`);
  console.log(`  Modified: ${stats.mtime.toISOString()}`);
  
  if (!existsSync(config.hashFile)) {
    fail('Hash file not created');
  }
  
  ok('Post-generation verification passed');
}

// --- RAPPORT FINAL ------------------------------------------------

function generateReport(items: ChecklistItem[], hash: string, config: ChecklistConfig): void {
  section('📊 RAPPORT DE GÉNÉRATION');
  
  const p1Count = items.filter(i => i.priority === 'P1').length;
  const p2Count = items.filter(i => i.priority === 'P2').length;
  const p3Count = items.filter(i => i.priority === 'P3').length;
  
  console.log(`
┌────────────────────────────────────────────────────────────┐
│  SPOFE CHECKLIST GENERATOR REPORT                          │
├────────────────────────────────────────────────────────────┤
│  Module:        ${config.moduleRoot.substring(config.moduleRoot.lastIndexOf('/') + 1).padEnd(40)}│
│  Items P1:      ${String(p1Count).padEnd(40)}│
│  Items P2:      ${String(p2Count).padEnd(40)}│
│  Items P3:      ${String(p3Count).padEnd(40)}│
│  Total:         ${String(items.length).padEnd(40)}│
│  Hash:          ${hash.substring(0, 8).padEnd(40)}│
└────────────────────────────────────────────────────────────┘
`);
}

// --- FONCTION PRINCIPALE ------------------------------------------

function main(): void {
  console.log('📝 SPOFE Checklist Generator v1.0.0');
  console.log('   Génération automatique depuis les contrats');
  console.log('');
  
  const config = loadConfig();
  
  console.log(`Module Root: ${config.moduleRoot}`);
  console.log(`Scanning ${config.contractFiles.length} contract files...`);
  
  // Étape 1: Parser les contrats
  const items = generateChecklist(config);
  
  // Étape 2: Formater la sortie
  const content = formatChecklist(items);
  
  // Étape 3: Sauvegarder
  saveChecklist(content, config);
  
  // Étape 4: Calculer le hash
  const hash = computeHash(content, config);
  
  // Étape 5: Vérifier
  verifyGeneration(config);
  
  // Étape 6: Rapport
  generateReport(items, hash, config);
  
  // VERDICT FINAL
  section('🏁 GÉNÉRATION COMPLÈTE');
  console.log('\n✅✅✅ CHECKLIST GENERATED SUCCESSFULLY ✅✅✅\n');
  console.log(`📝 ${items.length} items from contracts`);
  console.log(`🔒 Hash: ${hash.substring(0, 16)}...`);
  console.log(`📄 File: ${config.outputPath}`);
  console.log('\n👉 Next step: Validate items and run spofe-validate-module\n');
  
  process.exit(0);
}

// --- EXECUTION ----------------------------------------------------

main();
