import ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export interface WriteViolation {
  file: string;
  line: number;
  reason: string;
}

export function scanForWrites(
  moduleRoot: string
): WriteViolation[] {
  const violations: WriteViolation[] = [];

  const files = collectTsFiles(moduleRoot);

  for (const file of files) {
    if (file.includes('/src/guardian/') || file.includes('\\src\\guardian\\')) {
      continue; // Guardian is allowed
    }

    const source = fs.readFileSync(file, 'utf-8');
    const sf = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.ES2022,
      true
    );

    function visit(node: ts.Node) {
      // Assignment
      if (ts.isBinaryExpression(node) &&
          node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        violations.push({
          file,
          line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          reason: 'Assignment outside Guardian',
        });
      }

      // Property assignment (obj.prop = value)
      if (ts.isPropertyAccessExpression(node) && 
          node.parent && 
          ts.isBinaryExpression(node.parent) &&
          node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        violations.push({
          file,
          line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          reason: 'Property assignment outside Guardian',
        });
      }

      // Mutating calls
      if (ts.isCallExpression(node)) {
        const expr = node.expression.getText(sf);
        if (
          /(save|insert|update|delete|append|emit|push|splice|pop|shift|unshift|sort|reverse|fill|copyWithin|set|add|delete|clear|has|write|create|remove|destroy|execute|commit|rollback)/i.test(expr)
        ) {
          violations.push({
            file,
            line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            reason: `Mutating call '${expr}' outside Guardian`,
          });
        }
      }

      // Element assignment (array[index] = value)
      if (ts.isElementAccessExpression(node) &&
          node.parent &&
          ts.isBinaryExpression(node.parent) &&
          node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        violations.push({
          file,
          line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          reason: 'Element assignment outside Guardian',
        });
      }

      // Postfix/Prefix increment/decrement
      if (ts.isPostfixUnaryExpression(node) || ts.isPrefixUnaryExpression(node)) {
        const operator = node.operator;
        if (operator === ts.SyntaxKind.PlusPlusToken || operator === ts.SyntaxKind.MinusMinusToken) {
          violations.push({
            file,
            line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1,
            reason: 'Increment/decrement outside Guardian',
          });
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sf);
  }

  return violations;
}

function collectTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const e of entries) {
    const full = path.join(dir, e.name);
    
    // Skip node_modules and other non-source directories
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'build' || e.name === 'tests') {
        continue;
      }
      files.push(...collectTsFiles(full));
    } else if (e.isFile() && full.endsWith('.ts')) {
      // Skip test files and spec files
      if (full.includes('.spec.') || full.includes('.test.') || full.includes('/tests/') || full.includes('\\tests\\')) {
        continue;
      }
      files.push(full);
    }
  }

  return files;
}
