/**
 * Résolution du contexte architectural d'un fichier
 * Basé sur le chemin et le nom du fichier
 */

import path from 'path';
import { FileKind, FileLayer } from './ScannerTypes.js';

export class FileContextResolver {

  static resolveLayer(filePath: string): FileLayer {
    if (filePath.includes('/domain/') || filePath.includes('\\domain\\')) 
      return 'domain';
    if (filePath.includes('/application/') || filePath.includes('\\application\\')) 
      return 'application';
    if (filePath.includes('/infrastructure/') || filePath.includes('\\infrastructure\\')) 
      return 'infrastructure';
    if (filePath.includes('/presentation/') || filePath.includes('\\presentation\\')) 
      return 'presentation';
    return 'unknown';
  }

  static resolveKind(fileName: string): FileKind {
    if (fileName.endsWith('.entity.ts')) return 'entity';
    if (fileName.endsWith('.process.ts')) return 'process';
    if (fileName.endsWith('.service.ts')) return 'service';
    if (fileName.endsWith('.repository.ts')) return 'repository';
    if (fileName.endsWith('Dto.ts') || fileName.includes('DTO')) return 'dto';
    if (fileName.endsWith('.contract.ts') || fileName.endsWith('.contract.md')) 
      return 'contract';
    if (fileName.includes('.spec.') || fileName.includes('.test.')) return 'test';
    return 'unknown';
  }
}
