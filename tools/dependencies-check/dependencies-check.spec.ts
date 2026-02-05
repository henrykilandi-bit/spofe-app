import { describe, it, expect, beforeEach } from 'vitest';
import { parseDependencies } from './dependencies.parser';
import { validateDependencies, formatValidationErrors } from './dependencies.rules';
import { buildDependencyGraph, detectCycles, topologicalSort } from './dependencies.graph';
import * as fs from 'fs';
import * as path from 'path';

const MODULES_PATH = path.resolve('cascade/modules');

describe('SPOFE — Inter-module DEPENDENCIES compliance (P0)', () => {
  let dependencies: ReturnType<typeof parseDependencies>;

  beforeEach(() => {
    if (!fs.existsSync(MODULES_PATH)) {
      throw new Error(`Modules path not found: ${MODULES_PATH}`);
    }
    dependencies = parseDependencies(MODULES_PATH);
  });

  it('should parse all module dependencies successfully', () => {
    expect(dependencies).toBeDefined();
    expect(dependencies.length).toBeGreaterThan(0);
    
    // Vérifie que chaque module a une structure valide
    for (const dep of dependencies) {
      expect(dep).toHaveProperty('module');
      expect(dep).toHaveProperty('consumes');
      expect(dep).toHaveProperty('consumedBy');
      expect(typeof dep.module).toBe('string');
      expect(Array.isArray(dep.consumes)).toBe(true);
      expect(Array.isArray(dep.consumedBy)).toBe(true);
    }
  });

  it('should have no circular dependencies (CRITICAL)', () => {
    const graph = buildDependencyGraph(dependencies);
    const cycles = detectCycles(graph);
    
    if (cycles.length > 0) {
      const cycleDescriptions = cycles.map(cycle => cycle.join(' → '));
      throw new Error(
        `Circular dependencies detected (SPOFE violation):\n${cycleDescriptions.join('\n')}`
      );
    }
    
    expect(cycles).toHaveLength(0);
  });

  it('should have symmetric dependency declarations', () => {
    const errors = validateDependencies(dependencies)
      .filter(error => error.type === 'ASYMMETRY');
    
    if (errors.length > 0) {
      const errorMessages = errors.map(e => e.message).join('\n');
      throw new Error(
        `Asymmetric dependencies detected (SPOFE violation):\n${errorMessages}`
      );
    }
    
    expect(errors).toHaveLength(0);
  });

  it('should only reference existing modules', () => {
    const errors = validateDependencies(dependencies)
      .filter(error => error.type === 'MISSING_MODULE');
    
    expect(errors).toHaveLength(0);
  });

  it('should respect read-only constraints', () => {
    const errors = validateDependencies(dependencies)
      .filter(error => error.type === 'INVALID_READ_ONLY' || error.type === 'FORBIDDEN_WRITE');
    
    if (errors.length > 0) {
      const errorMessages = errors.map(e => e.message).join('\n');
      throw new Error(
        `Read-only constraint violations (SPOFE violation):\n${errorMessages}`
      );
    }
    
    expect(errors).toHaveLength(0);
  });

  it('should have a valid topological order for deployment', () => {
    const graph = buildDependencyGraph(dependencies);
    const sorted = topologicalSort(graph);
    
    // Vérifie que tous les modules sont inclus
    expect(sorted.length).toBe(dependencies.length);
    
    // Vérifie que l'ordre respecte les dépendances
    const moduleIndices = new Map(sorted.map((module, index) => [module, index]));
    
    for (const [module, deps] of graph.entries()) {
      const moduleIndex = moduleIndices.get(module)!;
      for (const dep of deps) {
        const depIndex = moduleIndices.get(dep)!;
        expect(depIndex).toBeLessThan(moduleIndex);
      }
    }
  });

  it('should validate all dependencies are SPOFE compliant', () => {
    const errors = validateDependencies(dependencies);
    
    if (errors.length > 0) {
      const formattedErrors = formatValidationErrors(errors);
      console.error(formattedErrors);
      throw new Error(
        `SPOFE compliance violations detected. See above for details.`
      );
    }
    
    expect(errors).toHaveLength(0);
  });

  it('should have required OIE read-only integrations', () => {
    const oie = dependencies.find(d => d.module === 'objectif-indicateur-evenement');
    expect(oie).toBeDefined();
    
    // Vérifie que OIE déclare coaching, budget, investisseurs comme consommateurs
    expect(oie?.consumedBy).toContain('coaching');
    expect(oie?.consumedBy).toContain('investisseurs');
    
    // Vérifie que les modules déclarent consommer OIE
    const coaching = dependencies.find(d => d.module === 'coaching');
    const investisseurs = dependencies.find(d => d.module === 'investisseurs');
    
    if (coaching) {
      expect(coaching.consumes).toContain('objectif-indicateur-evenement');
    }
    
    if (investisseurs) {
      expect(investisseurs.consumes).toContain('objectif-indicateur-evenement');
    }
  });

  it('should ensure OIE has only reference dependencies', () => {
    const oie = dependencies.find(d => d.module === 'objectif-indicateur-evenement');
    
    if (oie) {
      // OIE ne doit consommer que des modules certifiés pour références
      const allowedReferences = [
        'budget', 'cost-structure', 'vente', 
        'immobilisation', 'precomptabilite'
      ];
      
      for (const consumed of oie.consumes) {
        expect(allowedReferences).toContain(consumed);
      }
      
      // OIE ne doit pas avoir de dépendances circulaires
      for (const consumer of oie.consumedBy) {
        expect(oie.consumes).not.toContain(consumer);
      }
    }
  });

  it('should report compliance status', () => {
    const errors = validateDependencies(dependencies);
    const report = formatValidationErrors(errors);
    
    console.log('\n=== SPOFE Dependencies Compliance Report ===');
    console.log(report);
    
    if (errors.length === 0) {
      console.log('\n✅ Ready for BUILD_PROOF certification');
    } else {
      console.log('\n❌ Fix violations before BUILD_PROOF');
    }
  });
});