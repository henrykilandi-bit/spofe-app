#!/usr/bin/env node
/**
 * SPOFE — Module Structure Validator
 * Vérifie que tous les modules suivent la structure officielle
 */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const MODULES_DIR = path.join(ROOT, "cascade", "modules");

console.log("🔍 VALIDATION STRUCTURE MODULES SPOFE");
console.log("=====================================");

if (!fs.existsSync(MODULES_DIR)) {
  console.error("❌ Dossier cascade/modules/ introuvable");
  process.exit(1);
}

const modules = fs.readdirSync(MODULES_DIR).filter(name => {
  const modulePath = path.join(MODULES_DIR, name);
  return fs.statSync(modulePath).isDirectory();
});

console.log(`\n📊 ${modules.length} module(s) trouvé(s):`);

let validModules = 0;
let invalidModules = 0;

for (const moduleName of modules) {
  const modulePath = path.join(MODULES_DIR, moduleName);
  
  console.log(`\n🔍 Validation: ${moduleName}`);
  
  // Structure obligatoire
  const requiredDirs = [
    "contract",
    "src",
    "tests", 
    "experimental"
  ];
  
  const requiredFiles = [
    "contract/CONTRACT.md",
    "contract/SCOPE.md", 
    "contract/ARCHITECTURE.md",
    "contract/GUARDIAN.md",
    "README.md",
    "tsconfig.module.json",
    "package.json"
  ];
  
  let isValid = true;
  
  // Vérifier les dossiers
  for (const dir of requiredDirs) {
    const dirPath = path.join(modulePath, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`   ❌ Dossier manquant: ${dir}`);
      isValid = false;
    }
  }
  
  // Vérifier les fichiers
  for (const file of requiredFiles) {
    const filePath = path.join(modulePath, file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ Fichier manquant: ${file}`);
      isValid = false;
    }
  }
  
  // Vérifier le package.json
  const packageJsonPath = path.join(modulePath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (packageJson.name !== `@spofe/${moduleName}`) {
      console.log(`   ⚠️  package.json name: attendu @spofe/${moduleName}, trouvé ${packageJson.name}`);
    }
  }
  
  if (isValid) {
    console.log(`   ✅ ${moduleName} — Structure conforme`);
    validModules++;
  } else {
    console.log(`   ❌ ${moduleName} — Structure non conforme`);
    invalidModules++;
  }
}

console.log("\n📋 RAPPORT FINAL");
console.log("================");
console.log(`✅ Modules conformes: ${validModules}`);
console.log(`❌ Modules non conformes: ${invalidModules}`);

if (invalidModules > 0) {
  console.log("\n💡 RECOMMANDATION:");
  console.log("Utilisez 'npm run new-module' pour créer de nouveaux modules conformes");
  process.exit(1);
} else {
  console.log("\n🎯 ✅ TOUS LES MODULES SONT CONFORMES");
  process.exit(0);
}