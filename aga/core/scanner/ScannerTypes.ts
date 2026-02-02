/**
 * Types communs pour le scanner
 */

export type FileLayer =
  | 'domain'
  | 'application'
  | 'infrastructure'
  | 'presentation'
  | 'unknown';

export type FileKind =
  | 'entity'
  | 'process'
  | 'service'
  | 'repository'
  | 'dto'
  | 'contract'
  | 'test'
  | 'unknown';

export interface ScannedFile {
  absolutePath: string;
  relativePath: string;
  fileName: string;
  extension: string;
  layer: FileLayer;
  kind: FileKind;
}
