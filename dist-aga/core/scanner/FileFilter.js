/**
 * Filtres pour la sélection de fichiers
 */
import path from 'path';
export class FileFilter {
    static ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js'];
    static EXCLUDED_DIRS = [
        'node_modules',
        'dist',
        'build',
        '.git',
        'coverage',
        '.aga'
    ];
    static isAllowedFile(filePath) {
        const ext = path.extname(filePath);
        return this.ALLOWED_EXTENSIONS.includes(ext);
    }
    static isExcludedDirectory(dirPath) {
        return this.EXCLUDED_DIRS.some(excluded => dirPath.includes(`${path.sep}${excluded}${path.sep}`) ||
            dirPath.includes(`${path.sep}${excluded}`));
    }
}
//# sourceMappingURL=FileFilter.js.map