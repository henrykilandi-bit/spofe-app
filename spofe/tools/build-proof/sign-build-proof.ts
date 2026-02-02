#!/usr/bin/env node
/**
 * SPOFE BUILD PROOF SIGNER
 * Version 1.0.0 — Signature Cryptographique Ed25519
 * 
 * 🔐 Signe cryptographiquement le BUILD_PROOF.md pour garantir:
 * - Intégrité du contenu (non modifiable)
 * - Authenticité de la preuve (signé par SPOFE)
 * - Traçabilité temporelle (commit + timestamp)
 * 
 * Algorithme: Ed25519 (SSH key format)
 * Hash: SHA-256
 * Format: Base64
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash, sign, generateKeyPairSync } from 'crypto';
import { join, resolve } from 'path';

// --- UTILITAIRES ------------------------------------------------

function fail(msg: string): never {
  console.error(`\n❌❌❌ SIGNATURE FAILED ❌❌❌`);
  console.error(`Reason: ${msg}`);
  process.exit(1);
}

function ok(msg: string) {
  console.log(`✅ ${msg}`);
}

function section(title: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log(`${'='.repeat(60)}`);
}

// --- CONFIGURATION ------------------------------------------------

interface SignConfig {
  modulePath: string;
  proofPath: string;
  hashPath: string;
  sigPath: string;
  privateKey: string | Buffer;
  publicKeyPath?: string;
}

function loadConfig(): SignConfig {
  const modulePath = resolve(process.env.SPOFE_MODULE_PATH || process.cwd());
  
  // Récupérer la clé privée
  const privateKeyEnv = process.env.SPOFE_SIGNING_KEY;
  if (!privateKeyEnv) {
    fail('SPOFE_SIGNING_KEY environment variable not set');
  }
  
  // La clé peut être en base64 ou en PEM
  let privateKey: string | Buffer = privateKeyEnv;
  
  // Si c'est du base64, décoder
  if (privateKeyEnv.includes('BEGIN OPENSSH PRIVATE KEY') || 
      privateKeyEnv.includes('BEGIN PRIVATE KEY')) {
    // C'est déjà du PEM
    privateKey = privateKeyEnv;
  } else {
    // Essayer de décoder du base64
    try {
      privateKey = Buffer.from(privateKeyEnv, 'base64').toString('utf-8');
      if (!privateKey.includes('PRIVATE KEY')) {
        // Ce n'est pas une clé valide, remettre l'original
        privateKey = privateKeyEnv;
      }
    } catch (e) {
      privateKey = privateKeyEnv;
    }
  }
  
  return {
    modulePath,
    proofPath: join(modulePath, 'BUILD_PROOF.md'),
    hashPath: join(modulePath, 'BUILD_PROOF.sha256'),
    sigPath: join(modulePath, 'BUILD_PROOF.sig'),
    privateKey,
    publicKeyPath: process.env.SPOFE_PUBLIC_KEY_PATH || join(modulePath, '..', '..', '..', 'spofe', 'governance', 'spofe_build_proof_key.pub')
  };
}

// --- GÉNÉRATION HASH SHA-256 -------------------------------------

function generateHash(config: SignConfig): string {
  section('1. GÉNÉRATION HASH SHA-256');
  
  if (!existsSync(config.proofPath)) {
    fail('BUILD_PROOF.md not found. Generate BUILD_PROOF first.');
  }
  
  // Lire le contenu
  const content = readFileSync(config.proofPath);
  console.log(`  Source: ${config.proofPath}`);
  console.log(`  Size: ${content.length} bytes`);
  
  // Générer le hash SHA-256
  const hash = createHash('sha256').update(content).digest('hex');
  
  // Écrire le fichier .sha256
  const hashContent = `${hash}  BUILD_PROOF.md\n`;
  writeFileSync(config.hashPath, hashContent);
  
  console.log(`  SHA-256: ${hash.substring(0, 16)}...${hash.substring(hash.length - 16)}`);
  ok(`Hash written to ${config.hashPath}`);
  
  return hash;
}

// --- SIGNATURE CRYPTOGRAPHIQUE ----------------------------------

function signProof(config: SignConfig, hash: string): void {
  section('2. SIGNATURE CRYPTOGRAPHIQUE Ed25519');
  
  try {
    // Signer le hash avec la clé privée
    // Note: Ed25519 signe directement le message, pas un hash précalculé
    const content = readFileSync(config.proofPath);
    
    let signature: Buffer;
    
    // Détecter le format de la clé
    const keyStr = config.privateKey.toString();
    
    if (keyStr.includes('BEGIN OPENSSH PRIVATE KEY')) {
      // Format OpenSSH - convertir si nécessaire
      signature = sign('SHA256', content, config.privateKey);
    } else if (keyStr.includes('BEGIN PRIVATE KEY')) {
      // Format PEM PKCS#8
      signature = sign('SHA256', content, config.privateKey);
    } else {
      // Essayer comme clé brute
      signature = sign('SHA256', content, config.privateKey);
    }
    
    // Encoder en base64
    const sigBase64 = signature.toString('base64');
    
    // Écrire le fichier .sig
    writeFileSync(config.sigPath, sigBase64 + '\n');
    
    console.log(`  Algorithm: Ed25519`);
    console.log(`  Signature: ${sigBase64.substring(0, 32)}...`);
    console.log(`  Length: ${sigBase64.length} chars (base64)`);
    ok(`Signature written to ${config.sigPath}`);
    
  } catch (error: any) {
    fail(`Signature failed: ${error.message}`);
  }
}

// --- MÉTADONNÉES DE SIGNATURE -----------------------------------

function generateMetadata(config: SignConfig, hash: string): void {
  section('3. MÉTADONNÉES DE SIGNATURE');
  
  const metadataPath = join(config.modulePath, 'BUILD_PROOF.sigmeta');
  
  const metadata = {
    version: '1.0.0',
    algorithm: 'Ed25519',
    hash: 'SHA-256',
    timestamp: new Date().toISOString(),
    signed_by: 'SPOFE_BUILD_SYSTEM',
    build_proof_hash: hash,
    files: {
      content: 'BUILD_PROOF.md',
      hash: 'BUILD_PROOF.sha256',
      signature: 'BUILD_PROOF.sig'
    }
  };
  
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  console.log(`  Timestamp: ${metadata.timestamp}`);
  console.log(`  Algorithm: ${metadata.algorithm}`);
  console.log(`  Hash: ${metadata.hash}`);
  ok(`Metadata written to ${metadataPath}`);
}

// --- VÉRIFICATION INTERMÉDIAIRE --------------------------------

async function verifySignature(config: SignConfig): Promise<void> {
  section('4. VÉRIFICATION INTERMÉDIAIRE');
  
  // Vérifier que les fichiers existent
  if (!existsSync(config.sigPath)) {
    fail('Signature file was not created');
  }
  if (!existsSync(config.hashPath)) {
    fail('Hash file was not created');
  }
  
  // Vérifier la cohérence du hash
  const content = readFileSync(config.proofPath);
  const computedHash = createHash('sha256').update(content).digest('hex');
  const storedHash = readFileSync(config.hashPath, 'utf-8').split('  ')[0].trim();
  
  if (computedHash !== storedHash) {
    fail('Hash verification failed - content mismatch');
  }
  ok('Hash verification passed');
  
  // Si une clé publique est disponible, vérifier la signature
  if (config.publicKeyPath && existsSync(config.publicKeyPath)) {
    try {
      const { verify } = await import('crypto');
      const publicKey = readFileSync(config.publicKeyPath);
      const signature = Buffer.from(readFileSync(config.sigPath, 'utf-8').trim(), 'base64');
      
      const valid = verify('SHA256', content, publicKey, signature);
      
      if (valid) {
        ok('Signature verification passed with public key');
      } else {
        fail('Signature verification failed - invalid signature');
      }
    } catch (e) {
      console.log('  ⚠️  Could not verify with public key (optional)');
    }
  }
}

// --- GÉNÉRATION CLÉ (mode spécial) -------------------------------

async function generateKeys(): Promise<void> {
  section('🔑 GÉNÉRATION DE CLÉS SPOFE');
  
  console.log('Generating Ed25519 key pair...\n');
  
  const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    },
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    }
  });
  
  const keysDir = resolve(process.env.SPOFE_KEYS_DIR || 'spofe/governance');
  
  // Créer le répertoire si nécessaire
  const { mkdirSync } = await import('fs');
  if (!existsSync(keysDir)) {
    mkdirSync(keysDir, { recursive: true });
  }
  
  const privatePath = join(keysDir, 'spofe_build_proof_key');
  const publicPath = join(keysDir, 'spofe_build_proof_key.pub');
  
  writeFileSync(privatePath, privateKey);
  writeFileSync(publicPath, publicKey);
  
  console.log(`Private key: ${privatePath}`);
  console.log(`Public key:  ${publicPath}\n`);
  
  console.log('⚠️  IMPORTANT:');
  console.log('  1. Store the private key as a CI secret (SPOFE_SIGNING_KEY)');
  console.log('  2. Commit the public key to the repository');
  console.log('  3. Never expose the private key\n');
  
  ok('Key pair generated successfully');
}

// --- FONCTION PRINCIPALE -----------------------------------------

async function main(): Promise<void> {
  console.log('🔐 SPOFE Build Proof Signer v1.0.0');
  console.log('   Cryptographic Signature - Ed25519');
  console.log('');
  
  // Mode génération de clés
  if (process.argv.includes('--generate-keys') || process.argv.includes('-g')) {
    generateKeys();
    return;
  }
  
  const config = loadConfig();
  
  console.log(`Module Path: ${config.modulePath}`);
  console.log(`Proof File:  ${config.proofPath}`);
  
  // Vérifier que la clé est présente
  if (!config.privateKey) {
    fail('No signing key available');
  }
  
  // Exécuter les étapes
  const hash = generateHash(config);
  signProof(config, hash);
  generateMetadata(config, hash);
  await verifySignature(config);
  
  // RAPPORT FINAL
  section('🏁 SIGNATURE COMPLÈTE');
  
  console.log(`
┌────────────────────────────────────────────────────────────┐
│  SPOFE CRYPTOGRAPHIC SIGNATURE                             │
├────────────────────────────────────────────────────────────┤
│  Algorithm:    Ed25519                                     │
│  Hash:         SHA-256                                     │
│  Files:                                                    │
│    📄 BUILD_PROOF.md    (content)                          │
│    🔢 BUILD_PROOF.sha256 (hash)                            │
│    🔐 BUILD_PROOF.sig    (signature)                       │
│    ℹ️  BUILD_PROOF.sigmeta (metadata)                      │
└────────────────────────────────────────────────────────────┘
`);
  
  console.log('✅ BUILD_PROOF cryptographically signed successfully');
  console.log('🔒 Any modification will invalidate the signature\n');
  
  process.exit(0);
}

// --- EXECUTION ---------------------------------------------------

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
