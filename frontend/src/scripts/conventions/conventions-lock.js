#!/usr/bin/env node
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let config = {};
try {
  let configPath = path.resolve(__dirname, '../../../.spofe-config.json');
  if (!fs.existsSync(configPath)) {
    configPath = path.resolve(__dirname, '../../../../.spofe-config.json');
  }
  if (!fs.existsSync(configPath)) {
    configPath = path.resolve(process.cwd(), '.spofe-config.json');
  }
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.error('❌ Erreur: Impossible de charger .spofe-config.json');
  console.error('Chemin cherché:', path.resolve(__dirname, '../../../.spofe-config.json'));
  process.exit(1);
}
class ConventionLocker {
  constructor() {
    this.lockFile = path.resolve(__dirname, '../../../.conventions.lock');
    this.logsDir = path.resolve(__dirname, '../../../logs');
    if (!fs.existsSync(this.logsDir)) fs.mkdirSync(this.logsDir, { recursive: true });
  }
  isLocked() { return fs.existsSync(this.lockFile); }
  displayLockStatus() {
    if (this.isLocked()) {
      console.log('\n🔒 CONVENTIONS VERROUILLÉES\n');
    } else {
      console.log('\n🔓 CONVENTIONS DÉVERROUILLÉES (Mode dev)\n');
    }
  }
  async run(command = 'status') {
    switch (command.toLowerCase()) {
      case 'status': this.displayLockStatus(); break;
      case 'lock': 
        fs.writeFileSync(this.lockFile, JSON.stringify({timestamp: new Date().toISOString()}, null, 2));
        console.log('✅ Lock créé\n');
        break;
      case 'unlock':
        if (this.isLocked()) fs.unlinkSync(this.lockFile);
        console.log('🔓 Lock relâché\n');
        break;
      default: this.displayLockStatus();
    }
  }
}
const locker = new ConventionLocker();
const command = process.argv[2] || 'status';
await locker.run(command);
