#!/usr/bin/env node

/**
 * Wrapper script pour démarrer le frontend via PM2 sur Windows
 * Ce script lance directement vite au lieu d'utiliser npm
 */

const { spawn } = require('child_process');
const path = require('path');

// Trouver vite dans node_modules
const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite.cmd');

console.log('🚀 Starting SPOFE Frontend via PM2...');
console.log('📂 Working directory:', __dirname);
console.log('🔧 Vite path:', vitePath);

// Lancer vite avec les mêmes arguments que dans package.json
const child = spawn(vitePath, ['--host'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

child.on('error', (error) => {
  console.error('❌ Error starting frontend:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`⚠️ Frontend process exited with code ${code}`);
  process.exit(code);
});

// Gérer les signaux pour un arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping frontend...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping frontend...');
  child.kill('SIGTERM');
});
