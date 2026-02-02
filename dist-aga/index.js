#!/usr/bin/env node
/**
 * AGA (Architectural Governance Agent) CLI
 * =====================================
 *
 * Enforces architectural rules for SPOFE governance platform.
 *
 * Usage:
 *   npx ts-node aga/cli.ts [path] [options]
 *
 * Examples:
 *   npx ts-node aga/cli.ts .                      # Full scan
 *   npx ts-node aga/cli.ts . --rule ARCH_031      # Specific rule
 *   npx ts-node aga/cli.ts . --format json        # JSON output
 *   npx ts-node aga/cli.ts . --verbose            # Detailed output
 *   npx ts-node aga/cli.ts . --exit-on-violation  # Block CI/CD
 */
import * as fs from 'fs';
import * as path from 'path';
class AGA {
    config;
    args;
    violations = [];
    filesScanned = 0;
    startTime = Date.now();
    constructor() {
        this.args = this.parseArguments();
        this.config = this.loadConfig();
    }
    parseArguments() {
        const argv = process.argv.slice(2);
        const args = {
            scanPath: argv[0] || '.',
            configPath: './aga.config.json',
            format: 'console',
            verbose: false,
            exitOnViolation: false,
            validateOnly: false,
            suggestFixes: false,
        };
        for (let i = 1; i < argv.length; i++) {
            switch (argv[i]) {
                case '--config':
                    args.configPath = argv[++i];
                    break;
                case '--format':
                    args.format = argv[++i];
                    break;
                case '--rule':
                    if (!args.rules)
                        args.rules = [];
                    args.rules.push(argv[++i]);
                    break;
                case '--verbose':
                    args.verbose = true;
                    break;
                case '--exit-on-violation':
                    args.exitOnViolation = true;
                    break;
                case '--validate':
                    args.validateOnly = true;
                    break;
                case '--suggest-fixes':
                    args.suggestFixes = true;
                    break;
            }
        }
        return args;
    }
    loadConfig() {
        if (this.args.validateOnly) {
            if (!fs.existsSync(this.args.configPath)) {
                console.error(`❌ Config file not found: ${this.args.configPath}`);
                process.exit(1);
            }
            try {
                const config = JSON.parse(fs.readFileSync(this.args.configPath, 'utf-8'));
                console.log(`✅ Configuration valid: ${this.args.configPath}`);
                console.log(`   Rules defined: ${Object.keys(config.rules).length}`);
                console.log(`   Layers defined: ${Object.keys(config.layers).length}`);
                process.exit(0);
            }
            catch (err) {
                console.error(`❌ Invalid JSON in ${this.args.configPath}`);
                console.error(err.message);
                process.exit(1);
            }
        }
        if (!fs.existsSync(this.args.configPath)) {
            console.error(`❌ Config file not found: ${this.args.configPath}`);
            console.error(`\n   Create aga.config.json first.`);
            process.exit(1);
        }
        try {
            return JSON.parse(fs.readFileSync(this.args.configPath, 'utf-8'));
        }
        catch (err) {
            console.error(`❌ Invalid JSON in ${this.args.configPath}`);
            console.error(err.message);
            process.exit(1);
        }
    }
    getAllTypeScriptFiles(dir) {
        const files = [];
        const walk = (current) => {
            if (!fs.existsSync(current))
                return;
            const entries = fs.readdirSync(current, { withFileTypes: true });
            for (const entry of entries) {
                if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'aga-reports', 'aga'].includes(entry.name)) {
                    continue;
                }
                const fullPath = path.join(current, entry.name);
                if (entry.isDirectory()) {
                    walk(fullPath);
                }
                else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
                    files.push(fullPath);
                }
            }
        };
        walk(dir);
        return files;
    }
    checkLayerSeparation(filePath, content) {
        const relativePath = path.relative(this.args.scanPath, filePath);
        // Check if application imports infrastructure
        if (relativePath.includes('application') || relativePath.includes('src/application')) {
            const forbiddenPatterns = [
                /from\s+['"].*infrastructure['"]/,
                /from\s+['"].*\.\.\/infrastructure['"]/,
                /require\s*\(\s*['"].*infrastructure['"]\s*\)/,
                /import.*from\s+['"].*PostgresDbClient['"]/,
                /import.*from\s+['"]pg['"]/,
            ];
            forbiddenPatterns.forEach((pattern) => {
                const matches = content.matchAll(new RegExp(pattern.source, 'g'));
                for (const match of matches) {
                    const line = content.substring(0, match.index).split('\n').length;
                    this.violations.push({
                        rule: 'ARCH_010',
                        level: 'error',
                        file: relativePath,
                        line,
                        message: 'Application layer cannot import from infrastructure layer',
                        suggestion: 'Use dependency injection: request required service from constructor',
                        pattern: match[0],
                    });
                }
            });
        }
        // Check if domain imports application or infrastructure
        if (relativePath.includes('domain') || relativePath.includes('src/domain')) {
            const forbiddenPatterns = [
                /from\s+['"].*infrastructure['"]/,
                /from\s+['"].*application['"]/,
                /from\s+['"]pg['"]/,
                /from\s+['"]http['"]/,
                /from\s+['"]fs['"]/,
            ];
            forbiddenPatterns.forEach((pattern) => {
                const matches = content.matchAll(new RegExp(pattern.source, 'g'));
                for (const match of matches) {
                    const line = content.substring(0, match.index).split('\n').length;
                    this.violations.push({
                        rule: 'ARCH_010',
                        level: 'error',
                        file: relativePath,
                        line,
                        message: 'Domain layer cannot depend on application or infrastructure layers',
                        suggestion: 'Domain layer should contain only pure business logic',
                        pattern: match[0],
                    });
                }
            });
        }
    }
    checkCommandPurity(filePath, content) {
        const relativePath = path.relative(this.args.scanPath, filePath);
        if (relativePath.includes('commands')) {
            if (content.includes('async execute') || (content.includes('async') && content.includes('execute'))) {
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('async') && line.includes('execute')) {
                        this.violations.push({
                            rule: 'ARCH_031',
                            level: 'error',
                            file: relativePath,
                            line: idx + 1,
                            message: 'Commands must not contain async/await',
                            suggestion: 'Commands are intent-only; execution happens in TransactionManager',
                            pattern: line.trim(),
                        });
                    }
                });
            }
            const forbiddenImports = ['pg', 'axios', 'http', 'fs', 'fetch', 'Pool'];
            forbiddenImports.forEach((imp) => {
                if (content.includes(`from '${imp}'`) || content.includes(`require('${imp}')`)) {
                    const lines = content.split('\n');
                    lines.forEach((line, idx) => {
                        if (line.includes(imp) && (line.includes('from') || line.includes('require'))) {
                            this.violations.push({
                                rule: 'ARCH_031',
                                level: 'error',
                                file: relativePath,
                                line: idx + 1,
                                message: `Commands must not import '${imp}'`,
                                suggestion: 'Commands are pure intent; request external services via constructor',
                                pattern: line.trim(),
                            });
                        }
                    });
                }
            });
        }
    }
    checkNoDirectMutation(filePath, content) {
        const relativePath = path.relative(this.args.scanPath, filePath);
        if (relativePath.includes('domain')) {
            const forbiddenMethods = /private\s+save\s*\(|private\s+delete\s*\(|private\s+update\s*\(|private\s+persist\s*\(/g;
            const matches = content.matchAll(forbiddenMethods);
            for (const match of matches) {
                const line = content.substring(0, match.index).split('\n').length;
                this.violations.push({
                    rule: 'ARCH_034',
                    level: 'error',
                    file: relativePath,
                    line,
                    message: `Domain entity has hidden '${match[0].trim()}' method (direct mutation)`,
                    suggestion: 'Return modified data; let TransactionManager handle persistence',
                    pattern: match[0],
                });
            }
            if (content.includes('this.db.') || content.includes('PostgresDbClient')) {
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if ((line.includes('this.db.') || line.includes('PostgresDbClient')) && !line.trim().startsWith('//')) {
                        this.violations.push({
                            rule: 'ARCH_034',
                            level: 'error',
                            file: relativePath,
                            line: idx + 1,
                            message: 'Domain entity contains direct database access (mutation)',
                            suggestion: 'Entities should be persistence-agnostic',
                            pattern: line.trim(),
                        });
                    }
                });
            }
        }
    }
    checkGuardianUsage(filePath, content) {
        const relativePath = path.relative(this.args.scanPath, filePath);
        if ((relativePath.includes('application') || relativePath.includes('api')) && (relativePath.includes('.ts') || relativePath.includes('.js'))) {
            const directDbPatterns = [
                /db\.insert/,
                /db\.update/,
                /db\.delete/,
                /PostgresDbClient.*\.insert/,
                /PostgresDbClient.*\.update/,
                /PostgresDbClient.*\.delete/,
            ];
            directDbPatterns.forEach((pattern) => {
                const matches = content.matchAll(new RegExp(pattern.source, 'g'));
                for (const match of matches) {
                    const line = content.substring(0, match.index).split('\n').length;
                    this.violations.push({
                        rule: 'ARCH_036',
                        level: 'error',
                        file: relativePath,
                        line,
                        message: 'Direct database write detected (bypasses Guardian)',
                        suggestion: 'Use TransactionManager.executeDecision() - it calls Guardian before persisting',
                        pattern: match[0],
                    });
                }
            });
        }
    }
    checkProcessNesting(filePath, content) {
        const relativePath = path.relative(this.args.scanPath, filePath);
        if (relativePath.includes('commands')) {
            const patterns = [/new\s+\w+Command\s*\(/, /\.execute\s*\(/];
            patterns.forEach((pattern) => {
                const matches = content.matchAll(new RegExp(pattern.source, 'g'));
                for (const match of matches) {
                    const context = content.substring(Math.max(0, match.index - 50), match.index + 50);
                    if (context.includes('Command')) {
                        const line = content.substring(0, match.index).split('\n').length;
                        this.violations.push({
                            rule: 'ARCH_038',
                            level: 'error',
                            file: relativePath,
                            line,
                            message: 'Command calling another command detected (nesting)',
                            suggestion: 'Composition happens at API layer; each command is independent',
                            pattern: match[0],
                        });
                    }
                }
            });
        }
    }
    async scan() {
        const files = this.getAllTypeScriptFiles(this.args.scanPath);
        this.filesScanned = files.length;
        if (this.args.verbose) {
            console.log(`\n🔍 Scanning ${files.length} files...`);
        }
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                this.checkLayerSeparation(file, content);
                this.checkCommandPurity(file, content);
                this.checkNoDirectMutation(file, content);
                this.checkGuardianUsage(file, content);
                this.checkProcessNesting(file, content);
            }
            catch (err) {
                if (this.args.verbose) {
                    console.warn(`⚠️  Could not read ${file}`);
                }
            }
        }
    }
    generateReport() {
        const executionTime = Date.now() - this.startTime;
        const errors = this.violations.filter((v) => v.level === 'error').length;
        const warnings = this.violations.filter((v) => v.level === 'warning').length;
        return {
            project: this.config.projectName,
            version: this.config.projectVersion,
            scanDate: new Date().toISOString(),
            totalFiles: this.filesScanned,
            rulesChecked: Object.keys(this.config.rules).length,
            violations: this.violations,
            summary: {
                errors,
                warnings,
                status: errors === 0 ? 'PASS' : 'FAIL',
            },
            executionTime,
        };
    }
    reportConsole(report) {
        const border = '═'.repeat(70);
        console.log(`\n${border}`);
        console.log(`AGA Architectural Governance Report`);
        console.log(border);
        console.log(`\nProject:        ${report.project}`);
        console.log(`Version:        ${report.version}`);
        console.log(`Scan Date:      ${new Date(report.scanDate).toLocaleString()}`);
        console.log(`Total Files:    ${report.totalFiles}`);
        console.log(`Rules Checked:  ${report.rulesChecked}`);
        if (report.violations.length === 0) {
            console.log(`\nRESULTS:`);
            console.log('-'.repeat(70));
            for (const [rule, _] of Object.entries(this.config.rules)) {
                console.log(`✅ ${rule}`.padEnd(20) + '0 violations');
            }
            console.log('-'.repeat(70));
        }
        else {
            console.log(`\nVIOLATIONS FOUND:`);
            console.log('-'.repeat(70));
            const groupedByRule = {};
            report.violations.forEach((v) => {
                if (!groupedByRule[v.rule])
                    groupedByRule[v.rule] = [];
                groupedByRule[v.rule].push(v);
            });
            for (const [rule, violations] of Object.entries(groupedByRule)) {
                console.log(`\n❌ ${rule} — ${this.config.rules[rule].name}`);
                console.log(`   ${this.config.rules[rule].description}`);
                violations.forEach((v) => {
                    console.log(`   File: ${v.file}${v.line ? `:${v.line}` : ''}`);
                    console.log(`   Issue: ${v.message}`);
                    if (v.suggestion) {
                        console.log(`   Suggestion: ${v.suggestion}`);
                    }
                    if (this.args.verbose && v.pattern) {
                        console.log(`   Pattern: ${v.pattern}`);
                    }
                    console.log('');
                });
            }
            console.log('-'.repeat(70));
        }
        console.log(`\nStatus:  ${report.summary.status === 'PASS' ? '✅' : '❌'} ARCHITECTURE ${report.summary.status}`);
        console.log(`Violations: ${report.summary.errors} errors, ${report.summary.warnings} warnings`);
        console.log(`Time: ${report.executionTime}ms`);
        console.log(`\n${border}\n`);
    }
    reportJSON(report) {
        console.log(JSON.stringify(report, null, 2));
    }
    reportGitHub(report) {
        report.violations.forEach((v) => {
            const level = v.level === 'error' ? 'error' : 'warning';
            const message = `${v.rule}: ${v.message}${v.suggestion ? ` (${v.suggestion})` : ''}`;
            if (v.line) {
                console.log(`::${level} file=${v.file},line=${v.line}::${message}`);
            }
            else {
                console.log(`::${level} file=${v.file}::${message}`);
            }
        });
        if (report.summary.status === 'PASS') {
            console.log('✅ All architecture checks passed');
        }
        else {
            console.log(`❌ Architecture violations: ${report.summary.errors} errors`);
        }
    }
    async run() {
        await this.scan();
        const report = this.generateReport();
        switch (this.args.format) {
            case 'json':
                this.reportJSON(report);
                break;
            case 'github':
                this.reportGitHub(report);
                break;
            case 'console':
            default:
                this.reportConsole(report);
        }
        if (this.args.exitOnViolation && report.summary.errors > 0) {
            process.exit(1);
        }
        process.exit(0);
    }
}
// Run AGA
const aga = new AGA();
aga.run().catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(2);
});
//# sourceMappingURL=index.js.map