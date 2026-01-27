/**
 * Logger Utility
 * Utilitaire de logging avec couleurs et formatage
 */

import chalk from 'chalk';

export class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.timestamp = true;
  }

  banner(message) {
    console.log(chalk.cyan.bold('╔' + '═'.repeat(message.length + 2) + '╗'));
    console.log(chalk.cyan.bold('║ ' + message + ' ║'));
    console.log(chalk.cyan.bold('╚' + '═'.repeat(message.length + 2) + '╝'));
  }

  section(title) {
    console.log('');
    console.log(chalk.magenta.bold(`\n█ ${title}`));
    console.log(chalk.magenta('─'.repeat(title.length + 2)));
  }

  info(message) {
    const prefix = this.timestamp ? `[${this.getTime()}] ` : '';
    console.log(chalk.blue(`ℹ ${prefix}${message}`));
  }

  success(message) {
    const prefix = this.timestamp ? `[${this.getTime()}] ` : '';
    console.log(chalk.green(`✓ ${prefix}${message}`));
  }

  warn(message) {
    const prefix = this.timestamp ? `[${this.getTime()}] ` : '';
    console.log(chalk.yellow(`⚠ ${prefix}${message}`));
  }

  error(message) {
    const prefix = this.timestamp ? `[${this.getTime()}] ` : '';
    console.log(chalk.red(`✗ ${prefix}${message}`));
  }

  debug(message) {
    if (this.verbose) {
      const prefix = this.timestamp ? `[${this.getTime()}] ` : '';
      console.log(chalk.gray(`🐛 ${prefix}${message}`));
    }
  }

  progress(current, total, message = '') {
    const percent = Math.round((current / total) * 100);
    const filled = Math.round((percent / 10));
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
    const progressMsg = `[${bar}] ${percent}%`;
    
    if (message) {
      console.log(chalk.cyan(`  ${progressMsg} ${message}`));
    } else {
      console.log(chalk.cyan(`  ${progressMsg}`));
    }
  }

  table(data) {
    console.table(data);
  }

  getTime() {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // Aliases courtes
  log = this.info;
  ok = this.success;
  err = this.error;
  wrn = this.warn;
}
