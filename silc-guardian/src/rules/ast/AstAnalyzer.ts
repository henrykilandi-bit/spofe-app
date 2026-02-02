import { readFileSync } from "fs";

export interface AstNode {
  type: string;
  name?: string;
  line?: number;
}

/**
 * AstAnalyzer — Inspection sémantique du code
 * Niveau 2 d'intelligence : compréhension de la structure du code
 * Lightweight implementation without external AST parser
 */
export class AstAnalyzer {
  static parseFile(filePath: string): any {
    try {
      const code = readFileSync(filePath, "utf-8");
      return this.simpleTokenize(code, filePath);
    } catch (error) {
      console.error(`Erreur AST parsing ${filePath}:`, error);
      return null;
    }
  }

  private static simpleTokenize(code: string, filePath: string): any {
    const ast: any = {
      type: "Program",
      filePath,
      body: [],
      exports: [],
      imports: []
    };

    // Extract imports
    const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      ast.imports.push({
        type: "ImportDeclaration",
        source: match[3],
        specifiers: match[1] || match[2]
      });
    }

    // Extract exports
    const exportRegex = /export\s+(?:class|interface|const|function)\s+(\w+)/g;
    while ((match = exportRegex.exec(code)) !== null) {
      ast.exports.push({ name: match[1] });
    }

    // Extract class declarations
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?\s*{/g;
    while ((match = classRegex.exec(code)) !== null) {
      ast.body.push({
        type: "ClassDeclaration",
        name: match[1],
        extends: match[2],
        implements: match[3]?.split(",").map(s => s.trim())
      });
    }

    // Extract interface declarations
    const interfaceRegex = /interface\s+(\w+)\s*{/g;
    while ((match = interfaceRegex.exec(code)) !== null) {
      ast.body.push({
        type: "InterfaceDeclaration",
        name: match[1]
      });
    }

    return ast;
  }

  static extractClassMethods(ast: any): string[] {
    const methods: string[] = [];
    if (!ast || !ast.body) return methods;

    ast.body.forEach((node: any) => {
      if (node.type === "ClassDeclaration") {
        // Extract methods from class using regex
        const methodRegex = /(?:public|private|protected)?\s*(\w+)\s*\(/g;
        let match;
        while ((match = methodRegex.exec(node.body || "")) !== null) {
          if (match[1] !== node.name) {
            methods.push(match[1]);
          }
        }
      }
    });

    return methods;
  }

  static extractClassNames(ast: any): string[] {
    if (!ast || !ast.body) return [];
    return ast.body
      .filter((node: any) => node.type === "ClassDeclaration")
      .map((node: any) => node.name);
  }

  static findFunctionCalls(ast: any): string[] {
    const calls: string[] = [];
    if (!ast || !ast.imports) return calls;

    // Extract method names from imports and uses
    ast.imports.forEach((imp: any) => {
      if (imp.specifiers) {
        imp.specifiers.split(",").forEach((spec: string) => {
          calls.push(spec.trim());
        });
      }
    });

    return calls;
  }
}
