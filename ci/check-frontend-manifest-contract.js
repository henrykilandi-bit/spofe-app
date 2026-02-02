import fs from 'fs';
import path from 'path';

const MODULES_DIR = 'frontend/modules';

let failed = false;

for (const moduleName of fs.readdirSync(MODULES_DIR)) {
  const manifestPath = path.join(
    MODULES_DIR,
    moduleName,
    'module.manifest.md'
  );

  const content = fs.readFileSync(manifestPath, 'utf8');

  if (!content.includes('frontendModuleContract: 1.0.0')) {
    console.error(
      `❌ [CONTRACT] ${moduleName} does not declare frontend module contract v1.0.0`
    );
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('✅ All modules declare correct frontend contract version');
