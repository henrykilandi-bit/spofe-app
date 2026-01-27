// ===============================================
// 🧠 FILE: scripts/utils/notifier.js
// ===============================================
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

class SPOFENotifier {
  async sendAll(reportPath) {
    const reportName = path.basename(reportPath);
    const reportContent = fs.readFileSync(reportPath, 'utf-8');
    const summary = this.extractSummary(reportContent);

    console.log(`🔔 Envoi alerte SPOFE : ${reportName}`);
    await this.sendEmail(reportName, summary, reportContent);
    if (process.env.DISCORD_WEBHOOK_URL) await this.sendDiscord(summary, reportName);
    console.log('✅ Alertes envoyées.');
  }

  extractSummary(content) {
    const lines = content.split('\n').filter(Boolean);
    const title = lines.find(l => l.startsWith('## 🔎')) || '🚨 Rapport SPOFE généré';
    const details = lines.find(l => l.includes('Statut:')) || 'Erreur détectée';
    return `${title}\n${details}`;
  }

  async sendEmail(reportName, summary, content) {
    if (!process.env.SMTP_HOST) {
      console.log('📘 SMTP non configuré : envoi e-mail désactivé.');
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'spofe-monitor@local',
        to: process.env.ALERT_EMAIL_TO,
        subject: `🚨 SPOFE AutoFix Alert — ${reportName}`,
        text: summary,
        attachments: [{ filename: reportName, content }]
      });

      console.log('📧 Email envoyé à', process.env.ALERT_EMAIL_TO);
    } catch (err) {
      console.error('❌ Erreur envoi mail:', err.message);
    }
  }

  async sendDiscord(summary, reportName) {
    try {
      await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        username: 'SPOFE AutoFix',
        embeds: [{
          title: `🚨 SPOFE Alerte : ${reportName}`,
          description: summary,
          color: 15158332,
          footer: { text: 'SPOFE AutoFix v2.1' },
          timestamp: new Date().toISOString()
        }]
      });
      console.log('💬 Alerte Discord envoyée.');
    } catch (err) {
      console.error('❌ Discord:', err.message);
    }
  }
}

module.exports = SPOFENotifier;
