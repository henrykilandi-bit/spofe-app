#!/usr/bin/env node
/**
 * SPOFE — New Module Generator
 * Golden Module compliant
 * Official location: cascade/modules/<module-name>
 */

import fs from "fs";
import path from "path";

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("❌ Module name is required");
  console.error("Usage: node tools/spofe-new-module.js <module-name>");
  process.exit(1);
}

const ROOT = process.cwd();
const MODULES_DIR = path.join(ROOT, "cascade", "modules");
const MODULE_DIR = path.join(MODULES_DIR, moduleName);

if (!fs.existsSync(MODULES_DIR)) {
  console.error("❌ cascade/modules directory not found");
  process.exit(1);
}

if (fs.existsSync(MODULE_DIR)) {
  console.error(`❌ Module '${moduleName}' already exists`);
  process.exit(1);
}

const mkdir = (p) => fs.mkdirSync(p, { recursive: true });
const write = (p, c) => fs.writeFileSync(p, c, "utf8");

/* ───────────────────────────── */
/* 1. Directory structure */
/* ───────────────────────────── */

[
  "contract",
  "src/api/controllers",
  "src/api/dto",
  "src/application/commands",
  "src/application/handlers",
  "src/application/events",
  "src/domain/aggregates",
  "src/domain/value-objects",
  "src/domain/invariants",
  "src/domain/guardian",
  "src/infrastructure/repositories/write",
  "src/infrastructure/repositories/read",
  "src/sql/migrations",
  "tests/unit",
  "tests/integration",
  "tests/e2e",
  "tests/contract",
  "experimental/legacy",
  "experimental/drafts",
  "experimental/poc",
  "experimental/disabled-tests"
].forEach(dir => mkdir(path.join(MODULE_DIR, dir)));

/* ───────────────────────────── */
/* 2. Contract files */
/* ───────────────────────────── */

write(`${MODULE_DIR}/contract/CONTRACT.md`, `# ${moduleName} — Contract v1.0.0

## Objectif
Décrire le périmètre fonctionnel du module ${moduleName}.

## Responsabilités
- À définir

## Hors périmètre
- À définir

## Dépendances inter-modules
- À définir

## Version
v1.0.0
`);

write(`${MODULE_DIR}/contract/SCOPE.md`, `# ${moduleName} — Contractual Scope (SPOFE)

## IN SCOPE
- src/**
- tests/**
- contract/**
- sql/**
- BUILD_PROOF.md
- BUILD_PROOF.sig

## OUT OF SCOPE
- experimental/**
`);

write(`${MODULE_DIR}/contract/ARCHITECTURE.md`, `# ${moduleName} — Architecture (Golden Module)

Ce module doit suivre STRICTEMENT l'architecture SPOFE :

- CQRS strict
- Guardian central
- Read-models SQL
- BUILD_PROOF obligatoire

Référence : module Immobilisation (Golden Module).
`);

write(`${MODULE_DIR}/contract/GUARDIAN.md`, `# Guardian — ${moduleName}

## Règle fondamentale
Aucune logique métier hors Guardian.

## Invariants
- ${moduleName.toUpperCase()}-001 : À définir
`);

write(`${MODULE_DIR}/contract/COMMANDS_EVENTS.md`, `# Commands & Events — ${moduleName}

## Commands
- Create${capitalize(moduleName)}

## Events
- ${capitalize(moduleName)}Created
`);

write(`${MODULE_DIR}/contract/READ_MODELS.md`, `# Read Models — ${moduleName}

## Vues SQL
- view_${moduleName}_list
- view_${moduleName}_detail
`);

write(`${MODULE_DIR}/contract/API_READ_ONLY.md`, `# API Read-Only — ${moduleName}

## Endpoints
- GET /${moduleName}
- GET /${moduleName}/{id}

## Headers
- X-Tenant-Id (obligatoire)
`);

write(`${MODULE_DIR}/contract/${moduleName}.openapi.json`, `{
  "openapi": "3.0.3",
  "info": {
    "title": "${moduleName} API",
    "version": "1.0.0"
  },
  "paths": {}
}`);

/* ───────────────────────────── */
/* 3. Meta files */
/* ───────────────────────────── */

write(`${MODULE_DIR}/experimental/README.md`, `# Experimental (Non-Contractual)

Code hors périmètre SPOFE.
Non couvert par BUILD_PROOF.
`);

write(`${MODULE_DIR}/README.md`, `# Module ${moduleName}

Module SPOFE généré automatiquement.
Emplacement officiel : cascade/modules/${moduleName}
`);

write(`${MODULE_DIR}/tsconfig.module.json`, `{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["src", "tests"],
  "exclude": ["experimental"]
}`);

write(`${MODULE_DIR}/package.json`, `{
  "name": "@spofe/${moduleName}",
  "private": true,
  "version": "1.0.0",
  "type": "module"
}`);

console.log(`✅ Module '${moduleName}' créé dans cascade/modules/${moduleName}`);
console.log("👉 Prochaine étape : compléter CONTRACT.md puis définir le Guardian");
process.exit(0);

function capitalize(str) {
  return str.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}