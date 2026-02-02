import fs from 'fs';
import path from 'path';

const MODULES_DIR = 'frontend/modules';

let failed = false;

for (const moduleName of fs.readdirSync(MODULES_DIR)) {
  const signaturePath = path.join(
    MODULES_DIR,
    moduleName,
    '.spofe-template.json'
  );

  if (!fs.existsSync(signaturePath)) {
    console.error(
      `❌ [TEMPLATE ORIGIN] ${moduleName} is not created from SPOFE-clean template`
    );
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('✅ All modules originate from SPOFE-clean template');
