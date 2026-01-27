// ===============================================
// 🧠 FILE: scripts/utils/env-utils.js
// ===============================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ENV_PATH = path.join(process.cwd(), '.env');

function checkEnvIntegrity(vars = []) {
  if (!fs.existsSync(ENV_PATH)) return false;
  const content = fs.readFileSync(ENV_PATH, 'utf-8');
  return vars.every(v => content.includes(`${v}=`));
}

async function fixMissingEnv(variable) {
  if (!fs.existsSync(ENV_PATH)) fs.writeFileSync(ENV_PATH, '');
  const content = fs.readFileSync(ENV_PATH, 'utf-8');
  if (content.includes(`${variable}=`)) return false;

  let value = '';
  switch (variable) {
    case 'JWT_SECRET':
      value = crypto.randomBytes(32).toString('hex');
      break;
    case 'CORS_ORIGIN':
      value = 'http://localhost:3000';
      break;
    default:
      value = 'default';
  }

  fs.appendFileSync(ENV_PATH, `\n${variable}=${value}`);
  console.log(`🧩 Variable ajoutée : ${variable}`);
  return true;
}

module.exports = { checkEnvIntegrity, fixMissingEnv };
