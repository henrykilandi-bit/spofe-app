/**
 * Résolution du contexte architectural d'un fichier
 * Basé sur le chemin et le nom du fichier
 */
import { FileKind, FileLayer } from './ScannerTypes.js';
export declare class FileContextResolver {
    static resolveLayer(filePath: string): FileLayer;
    static resolveKind(fileName: string): FileKind;
}
//# sourceMappingURL=FileContextResolver.d.ts.map