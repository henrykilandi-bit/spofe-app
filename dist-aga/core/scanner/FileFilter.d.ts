/**
 * Filtres pour la sélection de fichiers
 */
export declare class FileFilter {
    static ALLOWED_EXTENSIONS: string[];
    static EXCLUDED_DIRS: string[];
    static isAllowedFile(filePath: string): boolean;
    static isExcludedDirectory(dirPath: string): boolean;
}
//# sourceMappingURL=FileFilter.d.ts.map