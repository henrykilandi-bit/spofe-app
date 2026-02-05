import { ModuleDependencies } from './dependencies.parser';
import { buildDependencyGraph, detectCycles } from './dependencies.graph';

export interface ValidationError {
  type: 'MISSING_MODULE' | 'ASYMMETRY' | 'CIRCULAR_DEPENDENCY' | 'INVALID_READ_ONLY' | 'FORBIDDEN_WRITE';
  message: string;
  modules: string[];
}

/**
 * Valide toutes les règles de conformité SPOFE inter-modules
 */
export function validateDependencies(
  deps: ModuleDependencies[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const moduleMap = new Map(deps.map(d => [d.module, d]));

  // Règle 1: Module consommé doit exister
  errors.push(...validateModuleExistence(deps, moduleMap));

  // Règle 2: Symétrie des déclarations
  errors.push(...validateSymmetry(deps, moduleMap));

  // Règle 3: Pas de dépendances circulaires
  errors.push(...validateNoCycles(deps));

  // Règle 4: Validation des types READ-ONLY
  errors.push(...validateReadOnlyConstraints(deps, moduleMap));

  // Règle 5: Pas de dépendances WRITE non autorisées
  errors.push(...validateNoUnauthorizedWrites(deps));

  return errors;
}

/**
 * Règle 1: Tous les modules consommés doivent exister
 */
function validateModuleExistence(
  deps: ModuleDependencies[],
  moduleMap: Map<string, ModuleDependencies>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const d of deps) {
    for (const target of d.consumes) {
      if (!moduleMap.has(target)) {
        errors.push({
          type: 'MISSING_MODULE',
          message: `Module '${d.module}' consumes unknown module '${target}'`,
          modules: [d.module, target]
        });
      }
    }
  }

  return errors;
}

/**
 * Règle 2: Symétrie - Si A consomme B, B doit déclarer A comme consommateur
 */
function validateSymmetry(
  deps: ModuleDependencies[],
  moduleMap: Map<string, ModuleDependencies>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const d of deps) {
    for (const target of d.consumes) {
      const targetDeps = moduleMap.get(target);
      if (targetDeps && !targetDeps.consumedBy.includes(d.module)) {
        errors.push({
          type: 'ASYMMETRY',
          message: `Dependency mismatch: '${d.module}' consumes '${target}' but '${target}' does not declare '${d.module}' as consumer`,
          modules: [d.module, target]
        });
      }
    }

    for (const consumer of d.consumedBy) {
      const consumerDeps = moduleMap.get(consumer);
      if (consumerDeps && !consumerDeps.consumes.includes(d.module)) {
        errors.push({
          type: 'ASYMMETRY',
          message: `Consumer mismatch: '${d.module}' declares '${consumer}' as consumer but '${consumer}' does not consume '${d.module}'`,
          modules: [d.module, consumer]
        });
      }
    }
  }

  return errors;
}

/**
 * Règle 3: Pas de dépendances circulaires
 */
function validateNoCycles(
  deps: ModuleDependencies[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const graph = buildDependencyGraph(deps);
  const cycles = detectCycles(graph);

  for (const cycle of cycles) {
    errors.push({
      type: 'CIRCULAR_DEPENDENCY',
      message: `Circular dependency detected: ${cycle.join(' → ')}`,
      modules: cycle
    });
  }

  return errors;
}

/**
 * Règle 4: Validation des contraintes READ-only
 */
function validateReadOnlyConstraints(
  deps: ModuleDependencies[],
  moduleMap: Map<string, ModuleDependencies>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const d of deps) {
    // Vérifie que les modules read-only sont correctement déclarés
    if (d.readOnlyType === 'READ_ONLY') {
      for (const target of d.consumes) {
        const targetDeps = moduleMap.get(target);
        if (targetDeps && targetDeps.consumes.includes(d.module)) {
          errors.push({
            type: 'INVALID_READ_ONLY',
            message: `Invalid read-only constraint: '${d.module}' declares read-only dependency on '${target}' but '${target}' also depends on '${d.module}'`,
            modules: [d.module, target]
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Règle 5: Pas de dépendances WRITE non autorisées
 */
function validateNoUnauthorizedWrites(
  deps: ModuleDependencies[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Modules qui ne peuvent avoir que des dépendances READ-only
  const readOnlyModules = ['oie', 'coaching', 'investisseurs'];
  
  for (const d of deps) {
    if (readOnlyModules.includes(d.module)) {
      // Ces modules ne peuvent pas avoir de dépendances write
      // (toutes leurs dépendances doivent être read-only)
      for (const target of d.consumes) {
        if (!isReadOnlyDependency(d.module, target)) {
          errors.push({
            type: 'FORBIDDEN_WRITE',
            message: `Module '${d.module}' cannot have write dependency on '${target}' (read-only module constraint)`,
            modules: [d.module, target]
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Vérifie si une dépendance est read-only
 */
function isReadOnlyDependency(consumer: string, target: string): boolean {
  // Définit les dépendances read-only autorisées
  const readOnlyDependencies = new Map([
    ['coaching', ['objectif-indicateur-evenement']],
    ['investisseurs', ['objectif-indicateur-evenement']],
    ['budget', ['objectif-indicateur-evenement']],
    ['oie', ['budget', 'cost-structure', 'vente', 'immobilisation', 'precomptabilite']]
  ]);

  const allowedTargets = readOnlyDependencies.get(consumer) || [];
  return allowedTargets.includes(target);
}

/**
 * Affiche un résumé des erreurs de validation
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '✅ All SPOFE inter-module dependencies are compliant';
  }

  const summary = [
    `❌ Found ${errors.length} SPOFE dependency violation(s):`,
    ''
  ];

  const errorsByType = new Map<string, ValidationError[]>();
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

  summary.push('Fix these violations before proceeding to BUILD_PROOF certification.');
  
  return summary.join('\n');
}