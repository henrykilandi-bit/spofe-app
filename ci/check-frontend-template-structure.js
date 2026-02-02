import fs from 'fs';
import path from 'path';

const MODULES_DIR = 'frontend/modules';

const TEMPLATE_STRUCTURE = [
  'module.manifest.md',
  'index.ts',
  'api/module.api.ts',
  'ui/ModuleView.tsx',
  'ui/module.ui.ts',
  'routes/module.routes.ts',
  'hooks/useModuleUI.ts',
  'tests/module.contract.spec.ts',
  '.spofe-template.json'
];

let failed = false;

for (const moduleName of fs.readdirSync(MODULES_DIR)) {
  const base = path.join(MODULES_DIR, moduleName);

  for (const file of TEMPLATE_STRUCTURE) {
    const fullPath = path.join(base, file);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ [TEMPLATE] ${moduleName} missing ${file}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('✅ All frontend modules match template structure');
