const fs = require('fs');
const path = require('path');

console.log('🔍 TEST MANUEL DES CONVENTIONS SPOFE v2.2');
console.log('========================================\n');

// Vérification des DTOs
const dtoDir = 'cascade/src/dto';
if (fs.existsSync(dtoDir)) {
  const dtoFiles = fs.readdirSync(dtoDir).filter(file => file.endsWith('.dto.js'));
  const compliantDtos = dtoFiles.filter(file => file.endsWith('Dto.js'));
  
  console.log('📋 DTOs Analysis:');
  console.log(`   Total DTOs: ${dtoFiles.length}`);
  console.log(`   Conformes SILC v1.0: ${compliantDtos.length}`);
  console.log(`   Taux de conformité: ${dtoFiles.length > 0 ? ((compliantDtos.length / dtoFiles.length) * 100).toFixed(1) : 0}%`);
  
  if (compliantDtos.length < dtoFiles.length) {
    console.log('\n❌ DTOs non conformes:');
    dtoFiles.filter(file => !file.endsWith('Dto.js')).forEach(file => {
      console.log(`   • ${file}`);
    });
  } else {
    console.log('✅ Tous les DTOs respectent le contrat SILC v1.0!');
  }
}

// Vérification des Controllers
const controllerDir = 'cascade/src/controllers';
if (fs.existsSync(controllerDir)) {
  const controllerFiles = fs.readdirSync(controllerDir).filter(file => file.endsWith('.js'));
  const compliantControllers = controllerFiles.filter(file => file.endsWith('-controller.js'));
  
  console.log('\n🎮 Controllers Analysis:');
  console.log(`   Total Controllers: ${controllerFiles.length}`);
  console.log(`   Conformes kebab-case-controller.js: ${compliantControllers.length}`);
  console.log(`   Taux de conformité: ${controllerFiles.length > 0 ? ((compliantControllers.length / controllerFiles.length) * 100).toFixed(1) : 0}%`);
  
  if (compliantControllers.length < controllerFiles.length) {
    console.log('\n❌ Controllers non conformes:');
    controllerFiles.filter(file => !file.endsWith('-controller.js')).forEach(file => {
      console.log(`   • ${file} → devrait être ${file.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`);
    });
  }
}

// Vérification des Models
const modelDir = 'cascade/src/models';
if (fs.existsSync(modelDir)) {
  const modelFiles = fs.readdirSync(modelDir).filter(file => file.endsWith('.js'));
  const compliantModels = modelFiles.filter(file => /^[A-Z][a-zA-Z0-9]*\.js$/.test(file));
  
  console.log('\n📊 Models Analysis:');
  console.log(`   Total Models: ${modelFiles.length}`);
  console.log(`   Conformes PascalCase.js: ${compliantModels.length}`);
  console.log(`   Taux de conformité: ${modelFiles.length > 0 ? ((compliantModels.length / modelFiles.length) * 100).toFixed(1) : 0}%`);
  
  if (compliantModels.length === modelFiles.length) {
    console.log('✅ Tous les Models respectent la convention PascalCase!');
  }
}

// Vérification des Pages Frontend
const pagesDir = 'frontend/src/pages';
if (fs.existsSync(pagesDir)) {
  const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.jsx'));
  const compliantPages = pageFiles.filter(file => /^[a-z]+(?:-[a-z]+)*\.jsx$/.test(file));
  
  console.log('\n📄 Frontend Pages Analysis:');
  console.log(`   Total Pages: ${pageFiles.length}`);
  console.log(`   Conformes kebab-case.jsx: ${compliantPages.length}`);
  console.log(`   Taux de conformité: ${pageFiles.length > 0 ? ((compliantPages.length / pageFiles.length) * 100).toFixed(1) : 0}%`);
  
  if (compliantPages.length < pageFiles.length) {
    console.log('\n❌ Pages non conformes:');
    pageFiles.filter(file => !/^[a-z]+(?:-[a-z]+)*\.jsx$/.test(file)).forEach(file => {
      console.log(`   • ${file} → devrait être ${file.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`);
    });
  }
}

// Score global
let totalFiles = 0;
let totalCompliant = 0;

if (fs.existsSync(dtoDir)) {
  const dtoFiles = fs.readdirSync(dtoDir).filter(file => file.endsWith('.dto.js'));
  const compliantDtos = dtoFiles.filter(file => file.endsWith('Dto.js'));
  totalFiles += dtoFiles.length;
  totalCompliant += compliantDtos.length;
}

if (fs.existsSync(controllerDir)) {
  const controllerFiles = fs.readdirSync(controllerDir).filter(file => file.endsWith('.js'));
  const compliantControllers = controllerFiles.filter(file => file.endsWith('-controller.js'));
  totalFiles += controllerFiles.length;
  totalCompliant += compliantControllers.length;
}

if (fs.existsSync(modelDir)) {
  const modelFiles = fs.readdirSync(modelDir).filter(file => file.endsWith('.js'));
  const compliantModels = modelFiles.filter(file => /^[A-Z][a-zA-Z0-9]*\.js$/.test(file));
  totalFiles += modelFiles.length;
  totalCompliant += compliantModels.length;
}

if (fs.existsSync(pagesDir)) {
  const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.jsx'));
  const compliantPages = pageFiles.filter(file => /^[a-z]+(?:-[a-z]+)*\.jsx$/.test(file));
  totalFiles += pageFiles.length;
  totalCompliant += compliantPages.length;
}

console.log('\n📊 GLOBAL COMPLIANCE SCORE:');
console.log(`   Total files checked: ${totalFiles}`);
console.log(`   Compliant files: ${totalCompliant}`);
console.log(`   Global compliance rate: ${totalFiles > 0 ? ((totalCompliant / totalFiles) * 100).toFixed(1) : 0}%`);

if (totalCompliant === totalFiles && totalFiles > 0) {
  console.log('\n🎉 PERFECT COMPLIANCE ACHIEVED!');
  console.log('✅ All files respect SPOFE v2.2 conventions!');
} else {
  console.log(`\n⚠️  ${totalFiles - totalCompliant} files need correction`);
  console.log('📄 Run npm run conventions:fix to auto-correct issues');
}

console.log('\n✅ Manual conventions check completed!');
