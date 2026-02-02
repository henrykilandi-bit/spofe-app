/**
 * React Hooks for Cost-Structure API
 * 
 * ⚠️ AUTO-GENERATED FROM OPENAPI — DO NOT EDIT MANUALLY
 * Source: cascade/modules/cost-structure/openapi/cost-structure.openapi.json
 * Version: 1.0.0
 * Generated: 2026-02-01
 * 
 * Provides React Query hooks for Cost-Structure API endpoints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BudgetReadyService,
  CostProjectsService,
  CostStructureService,
} from './index.js';

// ─────────────────────────────────────────────────────────────
// QUERY KEYS
// ─────────────────────────────────────────────────────────────

export const costStructureKeys = {
  all: ['cost-structure'],
  
  // Budget Ready
  budgetReady: () => [...costStructureKeys.all, 'budget-ready'],
  budgetReadyProjects: () => [...costStructureKeys.budgetReady(), 'projects'],
  budgetReadyProject: (projectId) => [...costStructureKeys.budgetReady(), 'project', projectId],
  budgetReadySummary: (projectId, version) => [...costStructureKeys.budgetReady(), 'summary', projectId, version],
  
  // Cost Projects
  projects: () => [...costStructureKeys.all, 'projects'],
  projectsList: (filters) => [...costStructureKeys.projects(), 'list', filters],
  
  // Cost Structure
  structure: (projectId) => [...costStructureKeys.all, 'structure', projectId],
  structureCurrent: (projectId) => [...costStructureKeys.structure(projectId), 'current'],
  structureLines: (projectId, version) => [...costStructureKeys.structure(projectId), 'lines', version],
  structureSimulation: (projectId, version) => [...costStructureKeys.structure(projectId), 'simulation', version],
  structureDecision: (projectId) => [...costStructureKeys.structure(projectId), 'decision'],
};

// ─────────────────────────────────────────────────────────────
// BUDGET READY HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Hook to fetch all budget-ready projects
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types').BudgetReadyProjectDTO[]>}
 */
export function useBudgetReadyProjects() {
  return useQuery({
    queryKey: costStructureKeys.budgetReadyProjects(),
    queryFn: () => BudgetReadyService.listProjects(),
  });
}

/**
 * Hook to fetch a specific budget-ready project
 * @param {string} projectId - Project identifier
 * @param {Object} [options] - Query options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types').BudgetReadyProjectDTO>}
 */
export function useBudgetReadyProject(projectId, options = {}) {
  return useQuery({
    queryKey: costStructureKeys.budgetReadyProject(projectId),
    queryFn: () => BudgetReadyService.getProject(projectId),
    enabled: !!projectId,
    ...options,
  });
}

/**
 * Hook to fetch cost structure summary for Budget integration
 * @param {string} projectId - Project identifier
 * @param {number} version - Cost structure version
 * @param {Object} [options] - Query options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types').CostStructureSummaryDTO>}
 */
export function useBudgetCostSummary(projectId, version, options = {}) {
  return useQuery({
    queryKey: costStructureKeys.budgetReadySummary(projectId, version),
    queryFn: () => BudgetReadyService.getCostSummary(projectId, version),
    enabled: !!projectId && version != null,
    ...options,
  });
}

// ─────────────────────────────────────────────────────────────
// COST PROJECTS HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Hook to fetch economic projects with optional filters
 * @param {Object} [filters] - Optional filters
 * @param {'DRAFT'|'SIMULATED'|'VALIDATED'|'REJECTED'} [filters.status] - Filter by status
 * @param {'PRODUCT'|'SERVICE'|'PROJECT'} [filters.type] - Filter by type
 * @param {Object} [options] - Query options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types').CostProjectDTO[]>}
 */
export function useCostProjects(filters = {}, options = {}) {
  return useQuery({
    queryKey: costStructureKeys.projectsList(filters),
    queryFn: () => CostProjectsService.listProjects(filters),
    ...options,
  });
}

// ─────────────────────────────────────────────────────────────
// COST STRUCTURE HOOKS
// ─────────────────────────────────────────────────────────────

/**
 * Hook to fetch current cost structure for a project
 * @param {string} projectId - Project identifier
 * @param {Object} [options] - Query options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types').CostStructureDTO>}
 */
export function useCostStructure(projectId, options = {}) {
  return useQuery({
    queryKey: costStructureKeys.structureCurrent(projectId),
    queryFn: () => CostStructureService.getCurrentStructure(projectId),
    enabled: !!projectId,
    ...options,
  });
}

/**
 * Hook to fetch cost lines for a specific version
 * @param {string} projectId - Project identifier
 * @param {number} version - Cost structure version
 * @param {Object} [options] - Query options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types').CostLineDTO[]>}
 */
export function useCostLines(projectId, version, options = {}) {
  return useQuery({
    queryKey: costStructureKeys.structureLines(projectId, version),
    queryFn: () => CostStructureService.getCostLines(projectId, version),
    enabled: !!projectId && version != null,
    ...options,
  });
}

/**
 * Hook to fetch simulation results for a specific version
 * @param {string} projectId - Project identifier
 * @param {number} version - Cost structure version
 * @param {Object} [options] - Query options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types').CostSimulationDTO>}
 */
export function useCostSimulation(projectId, version, options = {}) {
  return useQuery({
    queryKey: costStructureKeys.structureSimulation(projectId, version),
    queryFn: () => CostStructureService.getSimulation(projectId, version),
    enabled: !!projectId && version != null,
    ...options,
  });
}

/**
 * Hook to fetch validation decision for a project
 * @param {string} projectId - Project identifier
 * @param {Object} [options] - Query options
 * @returns {import('@tanstack/react-query').UseQueryResult<import('./types').CostDecisionDTO>}
 */
export function useCostDecision(projectId, options = {}) {
  return useQuery({
    queryKey: costStructureKeys.structureDecision(projectId),
    queryFn: () => CostStructureService.getDecision(projectId),
    enabled: !!projectId,
    ...options,
  });
}

// ─────────────────────────────────────────────────────────────
// INVALIDATION HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Hook to get invalidation helpers for Cost-Structure queries
 * @returns {Object} Invalidation helpers
 */
export function useCostStructureInvalidation() {
  const queryClient = useQueryClient();

  return {
    /** Invalidate all Cost-Structure queries */
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: costStructureKeys.all }),
    
    /** Invalidate all budget-ready queries */
    invalidateBudgetReady: () => queryClient.invalidateQueries({ queryKey: costStructureKeys.budgetReady() }),
    
    /** Invalidate all projects queries */
    invalidateProjects: () => queryClient.invalidateQueries({ queryKey: costStructureKeys.projects() }),
    
    /** Invalidate structure queries for a specific project */
    invalidateStructure: (projectId) => queryClient.invalidateQueries({ queryKey: costStructureKeys.structure(projectId) }),
  };
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export default {
  // Query Keys
  costStructureKeys,
  
  // Budget Ready Hooks
  useBudgetReadyProjects,
  useBudgetReadyProject,
  useBudgetCostSummary,
  
  // Cost Projects Hooks
  useCostProjects,
  
  // Cost Structure Hooks
  useCostStructure,
  useCostLines,
  useCostSimulation,
  useCostDecision,
  
  // Invalidation
  useCostStructureInvalidation,
};
