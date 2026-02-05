import * as fs from 'fs';
import * as path from 'path';

export interface ScopeValidationError {
  type: 'MISSING_SCOPE_FILE' | 'MISSING_IN_SCOPE' | 'MISSING_OUT_OF_SCOPE' | 'SCOPE_OVERLAP' | 'EMPTY_SCOPE';
  message: string;
  module: string;
  details?: string;
}

/**
 * Valide les fichiers SCOPE.md de tous les modules SPOFE
 * Garantit la clarté des frontières fonctionnelles
 */
export function validateScope(modulesRoot: string): ScopeValidationError[] {
  const errors: ScopeValidationError[] = [];
  const modules = fs.readdirSync(modulesRoot)
    .filter(item => {
      const fullPath = path.join(modulesRoot, item);
      return fs.statSync(fullPath).isDirectory() && 
             !item.startsWith('_') && 
             !item.startsWith('.');
    });

  const globalInScope = new Map<string, string[]>();
  const globalOutOfScope = new Map<string, string[]>();

  // Phase 1: Validation de structure individuelle
  for (const moduleName of modules) {
    const scopeFile = path.join(
      modulesRoot,
      moduleName,
      'contract',
      'SCOPE.md'
    );

    if (!fs.existsSync(scopeFile)) {
      errors.push({
        type: 'MISSING_SCOPE_FILE',
        message: `Missing SCOPE.md for module '${moduleName}'`,
        module: moduleName
      });
      continue;
    }

    const content = fs.readFileSync(scopeFile, 'utf-8');

    // Vérifie IN SCOPE
    if (!content.includes('## IN SCOPE')) {
      errors.push({
        type: 'MISSING_IN_SCOPE',
        message: `SCOPE.md of '${moduleName}' must define ## IN SCOPE section`,
        module: moduleName
      });
    }

    // Vérifie OUT OF SCOPE
    if (!content.includes('## OUT OF SCOPE')) {
      errors.push({
        type: 'MISSING_OUT_OF_SCOPE',
        message: `SCOPE.md of '${moduleName}' must define ## OUT OF SCOPE section`,
        module: moduleName
      });
    }

    const inScopeItems = extractScopeList(content, 'IN SCOPE');
    const outOfScopeItems = extractScopeList(content, 'OUT OF SCOPE');

    // Vérifie que les scopes ne sont pas vides
    if (inScopeItems.length === 0) {
      errors.push({
        type: 'EMPTY_SCOPE',
        message: `IN SCOPE section is empty for module '${moduleName}'`,
        module: moduleName
      });
    }

    if (outOfScopeItems.length === 0) {
      errors.push({
        type: 'EMPTY_SCOPE',
        message: `OUT OF SCOPE section is empty for module '${moduleName}'`,
        module: moduleName
      });
    }

    globalInScope.set(moduleName, inScopeItems);
    globalOutOfScope.set(moduleName, outOfScopeItems);
  }

  // Phase 2: Validation croisée des scopes
  validateScopeConsistency(globalInScope, globalOutOfScope, errors);

  return errors;
}

/**
 * Extrait la liste des éléments d'une section SCOPE
 */
function extractScopeList(content: string, sectionTitle: string): string[] {
  const regex = new RegExp(
    `## ${sectionTitle}[\\s\\S]*?\\n([\\s\\S]*?)(\\n## |$)`,
    'i'
  );

  const match = content.match(regex);
  if (!match) return [];

  return match[1]
    .split('\n')
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .filter(line => !line.includes('---')); // Ignore les séparateurs markdown
}

/**
 * Valide la cohérence entre les scopes des différents modules
 */
function validateScopeConsistency(
  globalInScope: Map<string, string[]>,
  globalOutOfScope: Map<string, string[]>,
  errors: ScopeValidationError[]
): void {
  // Vérifie qu'aucun module ne fait ce qu'un autre interdit explicitement
  for (const [moduleA, inScopeA] of globalInScope) {
    for (const [moduleB, outOfScopeB] of globalOutOfScope) {
      if (moduleA === moduleB) continue;

      for (const scopeItem of inScopeA) {
        for (const forbiddenItem of outOfScopeB) {
          if (isScopeSimilar(scopeItem, forbiddenItem)) {
            errors.push({
              type: 'SCOPE_OVERLAP',
              message: `Module '${moduleA}' does '${scopeItem}' but module '${moduleB}' explicitly forbids '${forbiddenItem}'`,
              module: moduleA,
              details: `Conflict with ${moduleB}`
            });
          }
        }
      }
    }
  }
}

/**
 * Détermine si deux éléments de scope sont similaires
 * (détection simple par mots-clés communs)
 */
function isScopeSimilar(scope1: string, scope2: string): boolean {
  const normalize = (s: string) => s.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3); // Ignore les mots courts

  const words1 = normalize(scope1);
  const words2 = normalize(scope2);

  // Au moins 2 mots en commun = potentiel conflit
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length >= 2;
}

/**
 * Formate les erreurs de validation SCOPE
 */
export function formatScopeErrors(errors: ScopeValidationError[]): string {
  if (errors.length === 0) {
    return '✅ All SCOPE.md contracts are compliant';
  }

  const summary = [
    `❌ Found ${errors.length} SCOPE contract violation(s):`,
    ''
  ];

  const errorsByType = new Map<string, ScopeValidationError[]>();
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

  summary.push('SCOPE contracts must be clear and non-overlapping.');
  
  return summary.join('\n');
}