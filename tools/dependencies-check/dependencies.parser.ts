import * as fs from 'fs';
import * as path from 'path';

export interface ModuleDependencies {
  module: string;
  consumes: string[];
  consumedBy: string[];
  readOnlyType?: string;
}

function canonicalizeModuleName(name: string): string {
  const normalized = name.toLowerCase().trim();
  if (normalized === 'objectif-indicateurs-evenements') {
    return 'objectif-indicateur-evenement';
  }
  return normalized;
}

/**
 * Parse tous les fichiers DEPENDENCIES.md des modules SPOFE
 * et extrait les dépendances déclarées
 */
export function parseDependencies(
  modulesRoot: string
): ModuleDependencies[] {
  const modules = fs.readdirSync(modulesRoot)
    .filter(item => {
      const fullPath = path.join(modulesRoot, item);
      return fs.statSync(fullPath).isDirectory() && 
             !item.startsWith('_') && 
             !item.startsWith('.') &&
             !item.startsWith('test-module-');
    });

  return modules.map((moduleName) => {
    const canonicalModuleName = canonicalizeModuleName(moduleName);
    const depFile = path.join(
      modulesRoot,
      moduleName,
      'contract',
      'DEPENDENCIES.md'
    );

    if (!fs.existsSync(depFile)) {
      throw new Error(
        `Missing DEPENDENCIES.md for module '${moduleName}' at ${depFile}`
      );
    }

    const content = fs.readFileSync(depFile, 'utf-8');

    const consumes = extractDependencyList(
      content,
      'Modules consommés'
    );
    
    const consumedBy = extractDependencyList(
      content,
      'Modules consommateurs'
    );

    const readOnlyConsumes = extractReadOnlyDependencies(content);
    
    return {
      module: canonicalModuleName,
      consumes: [...consumes, ...readOnlyConsumes.map(dep => dep.module)].map(canonicalizeModuleName),
      consumedBy: consumedBy.map(canonicalizeModuleName),
      readOnlyType: readOnlyConsumes.length > 0 ? 'READ_ONLY' : undefined
    };
  });
}

/**
 * Extrait les modules listés dans une section donnée
 */
function extractDependencyList(
  content: string,
  sectionTitle: string
): string[] {
  // Cherche la section avec le titre
  const regex = new RegExp(
    `## ${sectionTitle}[\\s\\S]*?\\n([\\s\\S]*?)(\\n## |$)`,
    'i'
  );

  const match = content.match(regex);
  if (!match) return [];

  // Extrait les noms de modules des lignes de tableau
  return match[1]
    .split('\n')
    .map(line => {
      // Cherche les cellules de tableau | module-name | Usage |
      const tableMatch = line.match(/\|\s*([a-zA-Z][a-zA-Z0-9\-_]*)\s*\|/);
      if (tableMatch && tableMatch[1] && 
          !tableMatch[1].includes('---------') && 
          tableMatch[1] !== 'Module' && 
          tableMatch[1] !== 'Finalité' &&
          tableMatch[1] !== 'Usage') {
        return canonicalizeModuleName(tableMatch[1].trim().toLowerCase());
      }
      return null;
    })
    .filter(Boolean) as string[];
}

/**
 * Extrait les dépendances READ-only spécifiques (comme OIE)
 */
function extractReadOnlyDependencies(
  content: string
): Array<{ module: string; type: string }> {
  const dependencies: Array<{ module: string; type: string }> = [];
  
  // Cherche les sections "Dépendance READ-only"
  const readOnlyRegex = /##\s+D[ée]pendance\s+READ[\s\-–—]*ONLY\s*[—\-–]\s+(.+?)\r?\n/giu;
  let match;
  
  while ((match = readOnlyRegex.exec(content)) !== null) {
    const moduleName = canonicalizeModuleName(match[1]
      .replace('Objectif–Indicateur–Événement', 'objectif-indicateur-evenement')
      .replace(/\s*\(.+\)/, '')
      .toLowerCase()
      .trim());
    
    dependencies.push({
      module: moduleName,
      type: 'READ_ONLY'
    });
  }
  
  return dependencies;
}

/**
 * Valide la syntaxe d'un fichier DEPENDENCIES.md
 */
export function validateDependencyFileStructure(
  filePath: string,
  content: string
): void {
  const requiredSections = [
    'DEPENDENCIES',
    'Nature du module',
    'Règle de gouvernance'
  ];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      throw new Error(
        `Missing required section '${section}' in ${filePath}`
      );
    }
  }
}
