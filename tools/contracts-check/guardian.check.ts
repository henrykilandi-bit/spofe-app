import * as fs from 'fs';
import * as path from 'path';

export interface GuardianValidationError {
  type: 'MISSING_GUARDIAN_FILE' | 'MISSING_INVARIANTS' | 'EMPTY_INVARIANTS' | 'INVALID_INVARIANT_FORMAT' | 'DUPLICATE_INVARIANT_ID';
  message: string;
  module: string;
  invariant?: string;
}

export interface ModuleInvariant {
  id: string;
  description: string;
  module: string;
}

/**
 * Valide les fichiers GUARDIAN.md de tous les modules SPOFE
 * Garantit la présence et la qualité des invariants métier
 */
export function validateGuardian(modulesRoot: string): GuardianValidationError[] {
  const errors: GuardianValidationError[] = [];
  const modules = fs.readdirSync(modulesRoot)
    .filter(item => {
      const fullPath = path.join(modulesRoot, item);
      return fs.statSync(fullPath).isDirectory() && 
             !item.startsWith('_') && 
             !item.startsWith('.');
    });

  const allInvariants: ModuleInvariant[] = [];

  // Phase 1: Validation de structure individuelle
  for (const moduleName of modules) {
    const guardianFile = path.join(
      modulesRoot,
      moduleName,
      'contract',
      'GUARDIAN.md'
    );

    if (!fs.existsSync(guardianFile)) {
      errors.push({
        type: 'MISSING_GUARDIAN_FILE',
        message: `Missing GUARDIAN.md for module '${moduleName}'`,
        module: moduleName
      });
      continue;
    }

    const content = fs.readFileSync(guardianFile, 'utf-8');

    // Vérifie la section INVARIANTS
    if (!content.includes('## INVARIANTS') && !content.includes('# INVARIANTS')) {
      errors.push({
        type: 'MISSING_INVARIANTS',
        message: `GUARDIAN.md of '${moduleName}' must define INVARIANTS section`,
        module: moduleName
      });
      continue;
    }

    const invariants = extractInvariants(content, moduleName);

    // Vérifie qu'il y a au moins un invariant
    if (invariants.length === 0) {
      errors.push({
        type: 'EMPTY_INVARIANTS',
        message: `GUARDIAN.md of '${moduleName}' has no declared invariants`,
        module: moduleName
      });
      continue;
    }

    // Valide le format de chaque invariant
    for (const invariant of invariants) {
      if (!isValidInvariantFormat(invariant.id)) {
        errors.push({
          type: 'INVALID_INVARIANT_FORMAT',
          message: `Invariant '${invariant.id}' in '${moduleName}' is not properly formatted (expected: G##)`,
          module: moduleName,
          invariant: invariant.id
        });
      }
    }

    allInvariants.push(...invariants);
  }

  // Phase 2: Vérification des doublons globaux
  validateInvariantUniqueness(allInvariants, errors);

  return errors;
}

/**
 * Extrait les invariants d'un fichier GUARDIAN.md
 */
function extractInvariants(content: string, moduleName: string): ModuleInvariant[] {
  const invariants: ModuleInvariant[] = [];
  
  // Trouve la section INVARIANTS
  const invariantsRegex = /##?\s*INVARIANTS[\s\S]*?(?=##|$)/i;
  const invariantsMatch = content.match(invariantsRegex);
  
  if (!invariantsMatch) return [];
  
  const invariantsSection = invariantsMatch[0];
  
  // Extrait chaque ligne d'invariant
  const lines = invariantsSection.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Cherche les lignes qui commencent par - et contiennent un ID
    if (trimmedLine.startsWith('-')) {
      const invariantMatch = trimmedLine.match(/^-\s*([A-Z]\d+)\s*[:]\s*(.+)$/);
      
      if (invariantMatch) {
        invariants.push({
          id: invariantMatch[1],
          description: invariantMatch[2].trim(),
          module: moduleName
        });
      }
    }
  }
  
  return invariants;
}

/**
 * Vérifie le format d'un ID d'invariant
 */
function isValidInvariantFormat(id: string): boolean {
  // Format étendu: A01, AM01, TB01, etc. (lettres majuscules + chiffres)
  return /^[A-Z]{1,3}\d{2,}$/.test(id);
}

/**
 * Vérifie l'unicité des IDs d'invariants
 */
function validateInvariantUniqueness(
  allInvariants: ModuleInvariant[],
  errors: GuardianValidationError[]
): void {
  const idCount = new Map<string, ModuleInvariant[]>();
  
  // Groupe les invariants par ID
  for (const invariant of allInvariants) {
    if (!idCount.has(invariant.id)) {
      idCount.set(invariant.id, []);
    }
    idCount.get(invariant.id)!.push(invariant);
  }
  
  // Détecte les doublons
  for (const [id, invariants] of idCount.entries()) {
    if (invariants.length > 1) {
      const modules = invariants.map(inv => inv.module).join(', ');
      errors.push({
        type: 'DUPLICATE_INVARIANT_ID',
        message: `Invariant ID '${id}' is used in multiple modules: ${modules}`,
        module: invariants[0].module,
        invariant: id
      });
    }
  }
}

/**
 * Formate les erreurs de validation GUARDIAN
 */
export function formatGuardianErrors(errors: GuardianValidationError[]): string {
  if (errors.length === 0) {
    return '✅ All GUARDIAN.md contracts are compliant';
  }

  const summary = [
    `❌ Found ${errors.length} GUARDIAN contract violation(s):`,
    ''
  ];

  const errorsByType = new Map<string, GuardianValidationError[]>();
  for (const error of errors) {
    if (!errorsByType.has(error.type)) {
      errorsByType.set(error.type, []);
    }
    errorsByType.get(error.type)!.push(error);
  }

  for (const [type, typeErrors] of errorsByType.entries()) {
    summary.push(`## ${type} (${typeErrors.length})`);
    for (const error of typeErrors) {
      summary.push(`  • ${error.message}`);
    }
    summary.push('');
  }

  summary.push('GUARDIAN contracts must define clear, numbered invariants.');
  
  return summary.join('\n');
}

/**
 * Génère un rapport des invariants pour un module
 */
export function generateInvariantsReport(modulesRoot: string): string {
  const modules = fs.readdirSync(modulesRoot)
    .filter(item => {
      const fullPath = path.join(modulesRoot, item);
      return fs.statSync(fullPath).isDirectory() && 
             !item.startsWith('_') && 
             !item.startsWith('.');
    });

  const allInvariants: ModuleInvariant[] = [];

  for (const moduleName of modules) {
    const guardianFile = path.join(modulesRoot, moduleName, 'contract', 'GUARDIAN.md');
    
    if (fs.existsSync(guardianFile)) {
      const content = fs.readFileSync(guardianFile, 'utf-8');
      allInvariants.push(...extractInvariants(content, moduleName));
    }
  }

  const report = [
    '# SPOFE Invariants Report',
    '',
    `Total invariants: ${allInvariants.length}`,
    `Modules with invariants: ${new Set(allInvariants.map(i => i.module)).size}`,
    '',
    '## Invariants by Module',
    ''
  ];

  const byModule = new Map<string, ModuleInvariant[]>();
  for (const invariant of allInvariants) {
    if (!byModule.has(invariant.module)) {
      byModule.set(invariant.module, []);
    }
    byModule.get(invariant.module)!.push(invariant);
  }

  for (const [module, invariants] of byModule.entries()) {
    report.push(`### ${module} (${invariants.length})`);
    for (const invariant of invariants.sort((a, b) => a.id.localeCompare(b.id))) {
      report.push(`- **${invariant.id}**: ${invariant.description}`);
    }
    report.push('');
  }

  return report.join('\n');
}