#!/usr/bin/env node
/**
 * SPOFE New Module Generator — Tests
 * Validation automatique du générateur
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const TEST_MODULE = "test-module-" + Date.now();

console.log("🧪 SPOFE NEW MODULE GENERATOR — TESTS");
console.log("=====================================");

try {
  /* ───────────────────────────── */
  /* 1. Génération test */
  /* ───────────────────────────── */
  
  console.log(`\n✅ Test 1: Génération du module '${TEST_MODULE}'`);
  execSync(`node tools/spofe-new-module.js ${TEST_MODULE}`, { 
    cwd: ROOT, 
    stdio: 'inherit' 
  });

  const modulePath = path.join(ROOT, "cascade", "modules", TEST_MODULE);

  /* ───────────────────────────── */
  /* 2. Validation structure */
  /* ───────────────────────────── */
  
  console.log("\n✅ Test 2: Validation de la structure");
  
  const requiredPaths = [
    "contract/CONTRACT.md",
    "contract/SCOPE.md",
    "contract/ARCHITECTURE.md",
    "contract/GUARDIAN.md",
    "contract/COMMANDS_EVENTS.md",
    "contract/READ_MODELS.md",
    "contract/API_READ_ONLY.md",
    `contract/${TEST_MODULE}.openapi.json`,
    "src/api/controllers",
    "src/application/commands",
    "src/domain/aggregates",
    "src/domain/guardian",
    "src/infrastructure/repositories",
    "tests/unit",
    "tests/e2e",
    "experimental/legacy",
    "experimental/disabled-tests",
    "package.json",
    "tsconfig.module.json",
    "README.md"
  ];

  let missingPaths = [];
  for (const reqPath of requiredPaths) {
    const fullPath = path.join(modulePath, reqPath);
    if (!fs.existsSync(fullPath)) {
      missingPaths.push(reqPath);
    }
  }

  if (missingPaths.length > 0) {
    console.error(`❌ Fichiers/dossiers manquants:`);
    missingPaths.forEach(p => console.error(`   - ${p}`));
    process.exit(1);
  }

  console.log("   ✅ Tous les fichiers et dossiers requis sont présents");

  /* ───────────────────────────── */
  /* 3. Validation contenu */
  /* ───────────────────────────── */
  
  console.log("\n✅ Test 3: Validation du contenu");

  // CONTRACT.md
  const contractContent = fs.readFileSync(
    path.join(modulePath, "contract/CONTRACT.md"), 
    "utf8"
  );
  if (!contractContent.includes(`# ${TEST_MODULE} — Contract v1.0.0`)) {
    console.error("❌ CONTRACT.md: Titre incorrect");
    process.exit(1);
  }

  // SCOPE.md
  const scopeContent = fs.readFileSync(
    path.join(modulePath, "contract/SCOPE.md"), 
    "utf8"
  );
  if (!scopeContent.includes("## IN SCOPE") || !scopeContent.includes("experimental/**")) {
    console.error("❌ SCOPE.md: Contenu SPOFE incorrect");
    process.exit(1);
  }

  // package.json
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(modulePath, "package.json"), "utf8")
  );
  if (packageJson.name !== `@spofe/${TEST_MODULE}`) {
    console.error("❌ package.json: Nom de module incorrect");
    process.exit(1);
  }

  console.log("   ✅ Contenu conforme aux standards SPOFE");

  /* ───────────────────────────── */
  /* 4. Test duplicate */
  /* ───────────────────────────── */
  
  console.log("\n✅ Test 4: Test détection de doublons");
  
  try {
    execSync(`node tools/spofe-new-module.js ${TEST_MODULE}`, { 
      cwd: ROOT, 
      stdio: 'pipe' 
    });
    console.error("❌ Le script aurait dû échouer pour un module existant");
    process.exit(1);
  } catch (error) {
    console.log("   ✅ Détection correcte des modules existants");
  }

  /* ───────────────────────────── */
  /* 5. Nettoyage */
  /* ───────────────────────────── */
  
  console.log("\n🧹 Nettoyage du module de test");
  fs.rmSync(modulePath, { recursive: true, force: true });
  
  console.log("\n🎯 ✅ TOUS LES TESTS PASSÉS");
  console.log("=====================================");
  console.log("Le générateur SPOFE fonctionne parfaitement !");

} catch (error) {
  console.error("\n❌ ÉCHEC DES TESTS:");
  console.error(error.message);
  
  // Nettoyage en cas d'erreur
  const modulePath = path.join(ROOT, "cascade", "modules", TEST_MODULE);
  if (fs.existsSync(modulePath)) {
    fs.rmSync(modulePath, { recursive: true, force: true });
  }
  
  process.exit(1);
}