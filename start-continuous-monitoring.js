#!/usr/bin/env node

/**
 * 📊 SURVEILLANCE TEMPS RÉEL CONTINUE
 * 
 * Monitoring continu et intelligent de la conformité SPOFE
 * - Surveillance temps réel des violations
 * - Alertes proactives automatiques
 * - Dashboard mis à jour automatiquement
 * - Rapports périodiques générés
 * - Performance tracking
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class StartContinuousMonitoring extends EventEmitter {
  constructor() {
    super();
    this.appPath = __dirname;
    this.contractPath = path.join(this.appPath, 'frontend-contract.json');
    this.dashboardPath = path.join(this.appPath, 'compliance-dashboard.html');
    this.monitoringDataPath = path.join(this.appPath, 'monitoring-data.json');
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertThresholds = {
      warning: 20,    // < 80% conformité
      error: 50,      // < 50% conformité
      critical: 70    // < 30% conformité
    };
    
    this.stats = {
      monitoringSessions: 0,
      totalChecks: 0,
      violationsDetected: 0,
      alertsTriggered: 0,
      dashboardUpdates: 0,
      reportsGenerated: 0,
      startTime: null,
      lastCheck: null
    };

    this.monitoringHistory = [];
    this.alertHistory = [];
  }

  async startContinuousMonitoring(options = {}) {
    const {
      interval = 30000,        // 30 secondes par défaut
      enableAlerts = true,
      enableDashboard = true,
      enableReports = true,
      reportInterval = 3600000  // 1 heure pour les rapports
    } = options;

    console.log('📊 DÉMARRAGE DE LA SURVEILLANCE TEMPS RÉEL CONTINUE');
    console.log('='.repeat(70));

    try {
      // 1. Initialisation du monitoring
      console.log('\n🔧 INITIALISATION DU MONITORING');
      await this.initializeMonitoring();
      
      // 2. Configuration des alertes
      if (enableAlerts) {
        console.log('\n🚨 CONFIGURATION DES ALERTES');
        this.setupAlertHandlers();
      }
      
      // 3. Démarrage du monitoring continu
      console.log('\n📊 DÉMARRAGE DU MONITORING CONTINU');
      this.startMonitoringLoop(interval, enableDashboard, enableReports, reportInterval);
      
      // 4. Affichage du statut
      this.displayMonitoringStatus();
      
      // 5. Gestion de l'arrêt propre
      this.setupGracefulShutdown();
      
      console.log('\n✅ SURVEILLANCE TEMPS RÉEL DÉMARRÉE');
      
      // Maintenir le processus en vie
      await this.keepAlive();
      
    } catch (error) {
      console.error('❌ Erreur démarrage monitoring:', error.message);
      throw error;
    }
  }

  async initializeMonitoring() {
    // Vérifier que le contrat existe
    if (!fs.existsSync(this.contractPath)) {
      throw new Error('Contrat frontend non trouvé');
    }
    
    // Charger les données de monitoring existantes
    if (fs.existsSync(this.monitoringDataPath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(this.monitoringDataPath, 'utf8'));
        this.monitoringHistory = existingData.history || [];
        this.alertHistory = existingData.alerts || [];
        console.log(`📋 Historique chargé: ${this.monitoringHistory.length} checks, ${this.alertHistory.length} alertes`);
      } catch (error) {
        console.warn('⚠️ Erreur chargement historique, démarrage neuf');
      }
    }
    
    this.stats.startTime = new Date().toISOString();
    this.stats.monitoringSessions++;
    
    console.log('✅ Monitoring initialisé');
  }

  setupAlertHandlers() {
    this.on('alert', (alert) => {
      this.handleAlert(alert);
    });
    
    this.on('threshold-breached', (data) => {
      this.handleThresholdBreached(data);
    });
    
    this.on('compliance-change', (data) => {
      this.handleComplianceChange(data);
    });
    
    console.log('✅ Gestionnaires d\'alertes configurés');
  }

  startMonitoringLoop(interval, enableDashboard, enableReports, reportInterval) {
    this.isMonitoring = true;
    
    // Check de conformité principal
    this.monitoringInterval = setInterval(async () => {
      await this.performComplianceCheck(enableDashboard);
    }, interval);
    
    // Génération de rapports périodiques
    if (enableReports) {
      setInterval(async () => {
        await this.generatePeriodicReport();
      }, reportInterval);
    }
    
    console.log(`📊 Monitoring démarré (intervalle: ${interval}ms)`);
  }

  async performComplianceCheck(enableDashboard) {
    try {
      this.stats.totalChecks++;
      this.stats.lastCheck = new Date().toISOString();
      
      // Exécuter la validation SILC
      const { spawn } = require('child_process');
      
      const result = await new Promise((resolve, reject) => {
        const process = spawn('node', ['silc-validator-enhanced.js', '--no-report', '--no-dashboard'], {
          cwd: this.appPath,
          stdio: 'pipe'
        });
        
        let output = '';
        process.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        process.on('close', (code) => {
          resolve({ code, output });
        });
        
        process.on('error', reject);
      });
      
      // Analyser les résultats
      const complianceData = this.parseComplianceOutput(result.output);
      
      // Ajouter à l'historique
      this.monitoringHistory.push({
        timestamp: new Date().toISOString(),
        complianceRate: complianceData.complianceRate,
        violations: complianceData.violations,
        totalEndpoints: complianceData.totalEndpoints
      });
      
      // Limiter l'historique à 1000 entrées
      if (this.monitoringHistory.length > 1000) {
        this.monitoringHistory = this.monitoringHistory.slice(-1000);
      }
      
      // Vérifier les seuils
      await this.checkThresholds(complianceData);
      
      // Mettre à jour le dashboard si nécessaire
      if (enableDashboard) {
        await this.updateDashboard(complianceData);
      }
      
      // Émettre l'événement de changement
      this.emit('compliance-change', complianceData);
      
      console.log(`📊 Check #${this.stats.totalChecks}: ${complianceData.complianceRate}% conformité (${complianceData.violations} violations)`);
      
    } catch (error) {
      console.error('❌ Erreur check de conformité:', error.message);
      this.stats.errors = (this.stats.errors || 0) + 1;
    }
  }

  parseComplianceOutput(output) {
    // Parser la sortie du validateur SILC
    const lines = output.split('\n');
    const complianceLine = lines.find(line => line.includes('Taux de conformité:'));
    const violationsLine = lines.find(line => line.includes('Violations:'));
    
    const complianceRate = complianceLine ? 
      parseFloat(complianceLine.match(/(\d+\.?\d*)%/)?.[1] || 0) : 0;
    
    const violations = violationsLine ? 
      parseInt(violationsLine.match(/Violations:\s*(\d+)/)?.[1] || 0) : 0;
    
    return {
      complianceRate,
      violations,
      totalEndpoints: 141, // Valeur par défaut
      timestamp: new Date().toISOString()
    };
  }

  async checkThresholds(complianceData) {
    const { complianceRate, violations } = complianceData;
    
    // Vérifier les seuils d'alerte
    if (complianceRate < (100 - this.alertThresholds.critical)) {
      this.emit('threshold-breached', {
        level: 'critical',
        complianceRate,
        violations,
        threshold: this.alertThresholds.critical
      });
    } else if (complianceRate < (100 - this.alertThresholds.error)) {
      this.emit('threshold-breached', {
        level: 'error',
        complianceRate,
        violations,
        threshold: this.alertThresholds.error
      });
    } else if (complianceRate < (100 - this.alertThresholds.warning)) {
      this.emit('threshold-breached', {
        level: 'warning',
        complianceRate,
        violations,
        threshold: this.alertThresholds.warning
      });
    }
    
    // Détecter les changements significatifs
    if (this.monitoringHistory.length > 1) {
      const previousCheck = this.monitoringHistory[this.monitoringHistory.length - 2];
      const change = Math.abs(complianceRate - previousCheck.complianceRate);
      
      if (change > 5) { // Changement de plus de 5%
      this.emit('alert', {
        type: 'significant_change',
        message: `Changement significatif de conformité: ${previousCheck.complianceRate}% → ${complianceData.complianceRate}%`,
        severity: change > 10 ? 'high' : 'medium',
        data: {
          previous: previousCheck.complianceRate,
          current: complianceData.complianceRate,
          change
        }
      });
    }
  }

  async updateDashboard(complianceData) {
    try {
      // Mettre à jour les données du dashboard
      const dashboardData = {
        lastUpdate: new Date().toISOString(),
        currentCompliance: complianceData,
        history: this.monitoringHistory.slice(-50), // 50 derniers checks
        alerts: this.alertHistory.slice(-10), // 10 dernières alertes
        stats: this.stats,
        trends: this.calculateTrends()
      };
      
      fs.writeFileSync(this.monitoringDataPath, JSON.stringify(dashboardData, null, 2));
      
      // Mettre à jour le dashboard HTML si nécessaire
      await this.updateDashboardHTML(dashboardData);
      
      this.stats.dashboardUpdates++;
      
    } catch (error) {
      console.error('❌ Erreur mise à jour dashboard:', error.message);
    }
  }

  calculateTrends() {
    if (this.monitoringHistory.length < 2) {
      return { trend: 'insufficient_data', change: 0 };
    }
    
    const recent = this.monitoringHistory.slice(-10); // 10 derniers checks
    const older = this.monitoringHistory.slice(-20, -10); // 10 checks précédents
    
    if (older.length === 0) {
      return { trend: 'insufficient_data', change: 0 };
    }
    
    const recentAvg = recent.reduce((sum, check) => sum + check.complianceRate, 0) / recent.length;
    const olderAvg = older.reduce((sum, check) => sum + check.complianceRate, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    let trend;
    if (Math.abs(change) < 1) {
      trend = 'stable';
    } else if (change > 0) {
      trend = 'improving';
    } else {
      trend = 'degrading';
    }
    
    return { trend, change: parseFloat(change.toFixed(2)) };
  }

  async updateDashboardHTML(dashboardData) {
    try {
      let dashboardHTML = fs.readFileSync(this.dashboardPath, 'utf8');
      
      // Mettre à jour les métriques dans le HTML
      dashboardHTML = dashboardHTML.replace(
        /<div class="text-2xl font-bold text-yellow-400">[\d.]+%<\/div>/,
        `<div class="text-2xl font-bold text-yellow-400">${dashboardData.currentCompliance.complianceRate}%</div>`
      );
      
      dashboardHTML = dashboardHTML.replace(
        /<div class="text-gray-400">[\d.]+ violations<\/div>/,
        `<div class="text-gray-400">${dashboardData.currentCompliance.violations} violations</div>`
      );
      
      // Mettre à jour le timestamp
      dashboardHTML = dashboardHTML.replace(
        /Dernière mise à jour: [\d-T:Z.]+/,
        `Dernière mise à jour: ${new Date().toLocaleString()}`
      );
      
      fs.writeFileSync(this.dashboardPath, dashboardHTML);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour dashboard HTML:', error.message);
    }
  }

  handleAlert(alert) {
    this.alertHistory.push({
      ...alert,
      timestamp: new Date().toISOString()
    });
    
    this.stats.alertsTriggered++;
    
    // Limiter l'historique des alertes
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }
    
    // Afficher l'alerte
    const severityColors = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    
    console.log(`${severityColors[alert.severity] || '⚠️'} ALERTE: ${alert.message}`);
    
    // Sauvegarder l'alerte
    this.saveAlertData();
  }

  handleThresholdBreached(data) {
    this.emit('alert', {
      type: 'threshold_breached',
      message: `Seuil ${data.level} dépassé: ${data.complianceRate}% de conformité (${data.violations} violations)`,
      severity: data.level,
      data
    });
  }

  handleComplianceChange(data) {
    this.stats.violationsDetected = data.violations;
    
    // Détecter les améliorations significatives
    if (this.monitoringHistory.length > 1) {
      const previous = this.monitoringHistory[this.monitoringHistory.length - 2];
      if (data.complianceRate > previous.complianceRate + 2) {
        this.emit('alert', {
          type: 'improvement',
          message: `Amélioration de la conformité: ${previous.complianceRate}% → ${data.complianceRate}%`,
          severity: 'low',
          data: {
            previous: previous.complianceRate,
            current: data.complianceRate,
            improvement: data.complianceRate - previous.complianceRate
          }
        });
      }
    }
  }

  async generatePeriodicReport() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        type: 'periodic_report',
        period: '1h',
        stats: this.stats,
        summary: {
          totalChecks: this.stats.totalChecks,
          averageCompliance: this.calculateAverageCompliance(),
          totalAlerts: this.stats.alertsTriggered,
          trend: this.calculateTrends()
        },
        history: this.monitoringHistory.slice(-60), // 1 heure d'historique
        alerts: this.alertHistory.slice(-20) // 20 dernières alertes
      };
      
      const reportPath = path.join(this.appPath, `monitoring-report-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      this.stats.reportsGenerated++;
      
      console.log(`📋 Rapport périodique généré: ${reportPath}`);
      
    } catch (error) {
      console.error('❌ Erreur génération rapport périodique:', error.message);
    }
  }

  calculateAverageCompliance() {
    if (this.monitoringHistory.length === 0) return 0;
    
    const sum = this.monitoringHistory.reduce((total, check) => total + check.complianceRate, 0);
    return (sum / this.monitoringHistory.length).toFixed(2);
  }

  saveAlertData() {
    try {
      const data = {
        history: this.monitoringHistory,
        alerts: this.alertHistory,
        stats: this.stats,
        lastUpdate: new Date().toISOString()
      };
      
      fs.writeFileSync(this.monitoringDataPath, JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde alertes:', error.message);
    }
  }

  displayMonitoringStatus() {
    console.log('\n📊 STATUT DU MONITORING:');
    console.log(`   • Session: #${this.stats.monitoringSessions}`);
    console.log(`   • Démarré: ${this.stats.startTime}`);
    console.log(`   • Seuils: Warning ${this.alertThresholds.warning}%, Error ${this.alertThresholds.error}%, Critical ${this.alertThresholds.critical}%`);
    console.log(`   • Historique: ${this.monitoringHistory.length} checks`);
    console.log(`   • Alertes: ${this.alertHistory.length}`);
    
    console.log('\n🎯 COMMANDES DISPONIBLES:');
    console.log('   • Ctrl+C: Arrêt propre du monitoring');
    console.log('   • Dashboard: compliance-dashboard.html');
    console.log('   • Données: monitoring-data.json');
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n📡 Signal ${signal} reçu, arrêt propre du monitoring...`);
      
      // Arrêter le monitoring
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      this.isMonitoring = false;
      
      // Générer le rapport final
      await this.generateFinalReport();
      
      console.log('✅ Monitoring arrêté proprement');
      process.exit(0);
    };
    
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  async generateFinalReport() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        type: 'final_report',
        session: {
          id: this.stats.monitoringSessions,
          startTime: this.stats.startTime,
          endTime: new Date().toISOString(),
          duration: this.calculateSessionDuration()
        },
        stats: this.stats,
        summary: {
          totalChecks: this.stats.totalChecks,
          averageCompliance: this.calculateAverageCompliance(),
          totalAlerts: this.stats.alertsTriggered,
          dashboardUpdates: this.stats.dashboardUpdates,
          reportsGenerated: this.stats.reportsGenerated
        },
        history: this.monitoringHistory,
        alerts: this.alertHistory
      };
      
      const reportPath = path.join(this.appPath, `monitoring-final-report-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log(`📋 Rapport final généré: ${reportPath}`);
      
    } catch (error) {
      console.error('❌ Erreur génération rapport final:', error.message);
    }
  }

  calculateSessionDuration() {
    if (!this.stats.startTime) return '0s';
    
    const start = new Date(this.stats.startTime);
    const end = new Date();
    const duration = end - start;
    
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  async keepAlive() {
    // Maintenir le processus en vie
    return new Promise(() => {
      // Cette promesse ne se résout jamais, gardant le processus actif
    });
  }
}

// Point d'entrée
if (require.main === module) {
  const monitor = new StartContinuousMonitoring();
  
  // Options de configuration
  const options = {
    interval: process.env.MONITORING_INTERVAL ? parseInt(process.env.MONITORING_INTERVAL) : 30000,
    enableAlerts: process.env.ENABLE_ALERTS !== 'false',
    enableDashboard: process.env.ENABLE_DASHBOARD !== 'false',
    enableReports: process.env.ENABLE_REPORTS !== 'false',
    reportInterval: process.env.REPORT_INTERVAL ? parseInt(process.env.REPORT_INTERVAL) : 3600000
  };
  
  monitor.startContinuousMonitoring(options)
    .catch(error => {
      console.error('\n❌ ERREUR LORS DU DÉMARRAGE DU MONITORING:', error.message);
      process.exit(1);
    });
}

module.exports = StartContinuousMonitoring;
