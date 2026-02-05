import { ModuleDependencies } from './dependencies.parser';

/**
 * Construit un graphe orienté des dépendances inter-modules
 */
export function buildDependencyGraph(
  deps: ModuleDependencies[]
): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const d of deps) {
    graph.set(d.module, d.consumes);
  }

  return graph;
}

/**
 * Détecte les cycles dans le graphe de dépendances
 */
export function detectCycles(
  graph: Map<string, string[]>
): string[][] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      // Cycle détecté
      const cycleStart = path.indexOf(node);
      cycles.push([...path.slice(cycleStart), node]);
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const dependencies = graph.get(node) || [];
    for (const dep of dependencies) {
      dfs(dep, path);
    }

    recursionStack.delete(node);
    path.pop();
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

/**
 * Calcule l'ordre topologique des modules
 * (ordre de compilation/déploiement sans cycles)
 */
export function topologicalSort(
  graph: Map<string, string[]>
): string[] {
  const inDegree = new Map<string, number>();
  const result: string[] = [];
  const queue: string[] = [];

  // Initialise les degrés entrants
  for (const node of graph.keys()) {
    inDegree.set(node, 0);
  }

  // Calcule les degrés entrants
  for (const [node, deps] of graph.entries()) {
    for (const dep of deps) {
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    }
  }

  // Trouve les nœuds sans dépendances
  for (const [node, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  // Tri topologique
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    const dependencies = graph.get(current) || [];
    for (const dep of dependencies) {
      const newDegree = (inDegree.get(dep) || 0) - 1;
      inDegree.set(dep, newDegree);
      
      if (newDegree === 0) {
        queue.push(dep);
      }
    }
  }

  return result;
}

/**
 * Analyse les composantes fortement connexes
 */
export function analyzeStronglyConnectedComponents(
  graph: Map<string, string[]>
): string[][] {
  const visited = new Set<string>();
  const finished = new Set<string>();
  const finishOrder: string[] = [];
  const components: string[][] = [];

  // Première passe DFS
  function dfs1(node: string): void {
    if (visited.has(node)) return;
    
    visited.add(node);
    const deps = graph.get(node) || [];
    
    for (const dep of deps) {
      dfs1(dep);
    }
    
    finishOrder.push(node);
  }

  // DFS sur tous les nœuds
  for (const node of graph.keys()) {
    dfs1(node);
  }

  // Construit le graphe transposé
  const transposedGraph = new Map<string, string[]>();
  for (const node of graph.keys()) {
    transposedGraph.set(node, []);
  }
  
  for (const [node, deps] of graph.entries()) {
    for (const dep of deps) {
      transposedGraph.get(dep)?.push(node);
    }
  }

  // Deuxième passe DFS sur le graphe transposé
  const visitedTransposed = new Set<string>();
  
  function dfs2(node: string, component: string[]): void {
    if (visitedTransposed.has(node)) return;
    
    visitedTransposed.add(node);
    component.push(node);
    
    const reverseDeps = transposedGraph.get(node) || [];
    for (const dep of reverseDeps) {
      dfs2(dep, component);
    }
  }

  // Traite les nœuds dans l'ordre inverse de finition
  for (let i = finishOrder.length - 1; i >= 0; i--) {
    const node = finishOrder[i];
    if (!visitedTransposed.has(node)) {
      const component: string[] = [];
      dfs2(node, component);
      if (component.length > 0) {
        components.push(component);
      }
    }
  }

  return components;
}