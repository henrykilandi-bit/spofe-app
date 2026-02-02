import fs from 'fs';
import path from 'path';

const MODULES_DIR = 'frontend/modules';

const FORBIDDEN_PATTERNS = [
  'services',
  'store',
  'queries',
  '.service.ts',
  '.repository.ts'
];

function scan(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (full.includes(pattern)) {
        console.error(`❌ [FORBIDDEN FILE] ${full}`);
        process.exit(1);
      }
    }

    if (fs.statSync(full).isDirectory()) {
      scan(full);
    }
  }
}

scan(MODULES_DIR);
console.log('✅ No forbidden frontend files detected');
