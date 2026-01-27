import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const generate = (len) => crypto.randomBytes(len).toString('base64url');

// Vérifie la présence du fichier .env
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Fichier .env manquant. Copiez .env.example d\'abord.');
  process.exit(1);
}

// Lecture du .env existant
let envContent = fs.readFileSync(envPath, 'utf-8');

// Création des secrets
const secrets = {
  DB_PASSWORD: generate(32),
  JWT_SECRET: generate(64),
  JWT_REFRESH_SECRET: generate(64),
  ENCRYPTION_KEY: generate(32)
};

// Remplace ou ajoute les valeurs
Object.entries(secrets).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
});

// Écrit les secrets dans .env
fs.writeFileSync(envPath, envContent);

// Ajoute .env dans .gitignore si absent
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  if (!gitignoreContent.includes('.env')) {
    fs.appendFileSync(gitignorePath, '\n.env\n.env.local\n.env.*.local\n');
  }
}

console.log('✅ Secrets injectés dans .env (vérifié dans .gitignore)');
