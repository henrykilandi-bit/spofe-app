/**
 * Scanner multi-fichiers pour AGA
 * Parcourt l'arborescence et classe les fichiers
 */

import fs from 'fs';
import path from 'path';
import { FileFilter } from './FileFilter.js';
import { FileContextResolver } from './FileContextResolver.js';
import { ScannedFile } from './ScannerTypes.js';

export class FileScanner {

  static scanDirectory(
    rootDir: string,
    baseDir: string = rootDir
  ): ScannedFile[] {
    const results: ScannedFile[] = [];

    try {
      const entries = fs.readdirSync(rootDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(rootDir, entry.name);

        if (entry.isDirectory()) {
          if (FileFilter.isExcludedDirectory(fullPath)) continue;
          results.push(...this.scanDirectory(fullPath, baseDir));
          continue;
        }

        if (!FileFilter.isAllowedFile(fullPath)) continue;

        const relativePath = path.relative(baseDir, fullPath);
        const fileName = entry.name;

        results.push({
          absolutePath: fullPath,
          relativePath,
          fileName,
          extension: path.extname(fileName),
          layer: FileContextResolver.resolveLayer(relativePath),
          kind: FileContextResolver.resolveKind(fileName)
        });
      }
    } catch (err) {
      console.error(`Error scanning ${rootDir}:`, err);
    }

    return results;
  }
}
