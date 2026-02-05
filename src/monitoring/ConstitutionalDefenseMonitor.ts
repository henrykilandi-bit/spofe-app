/**
 * 📊 CONSTITUTIONAL DEFENSE MONITOR
 * Surveillance des mécanismes de défense constitutionnelle Niveau 2
 * 
 * Fonctionnalités :
 * - Monitoring temps réel des défenses
 * - Alertes automatiques
 * - Tableaux de bord
 * - Validation continue
 */

import { Pool } from 'pg';

export interface DefenseMechanism {
  mechanismName: string;
  isActive: boolean;
  statusMessage: string;
  lastCheck: Date;
  statusIcon: string;
}

export interface DefenseAlert {
  alertLevel: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  alertMessage: string;
  immediateActionRequired: boolean;
  timestamp: Date;
}

export interface DefenseMetrics {
  totalEvents: number;
  chainIntegrityValid: boolean;
  lastEventTime: Date;
  averageInsertionTime: number;
  activeDefenses: number;
  totalDefenses: number;
  defenseLevel: number;
}

export class ConstitutionalDefenseMonitor {
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  /**
   * 📊 Statut complet des mécanismes de défense
   */
  async getDefenseStatus(): Promise<DefenseMechanism[]> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT 
          mechanism_name,
          is_active,
          status_message,
          last_check,
          CASE 
            WHEN is_active THEN '🛡️ ACTIVE'
            ELSE '⚠️ INACTIVE'
          END as status_icon
        FROM v_constitutional_defense_status
        ORDER BY mechanism_name
      `;
      
      const result = await client.query(query);
      
      return result.rows.map(row => ({
        mechanismName: row.mechanism_name,
        isActive: row.is_active,
        statusMessage: row.status_message,
        lastCheck: new Date(row.last_check),
        statusIcon: row.status_icon
      }));
      
    } finally {
      client.release();
    }
  }

  /**
   * 🚨 Alertes de défense constitutionnelle
   */
  async getDefenseAlerts(): Promise<DefenseAlert[]> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        SELECT 
          alert_level,
          alert_message,
          immediate_action_required
        FROM check_constitutional_defense_alerts()
      `;
      
      const result = await client.query(query);
      
      return result.rows.map(row => ({
        alertLevel: row.alert_level,
        alertMessage: row.alert_message,
        immediateActionRequired: row.immediate_action_required,
        timestamp: new Date()
      }));
      
    } finally {
      client.release();
    }
  }

  /**
   * 📈 Métriques complètes de défense
   */
  async getDefenseMetrics(): Promise<DefenseMetrics> {
    const client = await this.pool.connect();
    
    try {
      // Statistiques ledger
      const statsQuery = `SELECT * FROM get_ledger_statistics()`;
      const statsResult = await client.query(statsQuery);
      const stats = statsResult.rows[0];
      
      // Statistiques défense
      const defenseQuery = `SELECT * FROM validate_constitutional_defense_level2()`;
      const defenseResult = await client.query(defenseQuery);
      
      const activeDefenses = defenseResult.rows.filter(row => row.is_active).length;
      const totalDefenses = defenseResult.rows.length;
      
      // Performance insertion (moyenne des dernières 24h)
      const performanceQuery = `
        SELECT 
          AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at)))) * 1000 as avg_interval_ms
        FROM domain_events 
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `;
      const performanceResult = await client.query(performanceQuery);
      const avgInsertionTime = performanceResult.rows[0]?.avg_interval_ms || 0;
      
      return {
        totalEvents: parseInt(stats.total_events),
        chainIntegrityValid: stats.chain_integrity,
        lastEventTime: new Date(stats.last_event_date),
        averageInsertionTime: Math.round(avgInsertionTime),
        activeDefenses,
        totalDefenses,
        defenseLevel: 2
      };
      
    } finally {
      client.release();
    }
  }

  /**
   * 🔍 Validation complète de la défense
   */
  async validateDefense(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const status = await this.getDefenseStatus();
    const alerts = await this.getDefenseAlerts();
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Vérification mécanismes inactifs
    const inactiveMechanisms = status.filter(m => !m.isActive);
    if (inactiveMechanisms.length > 0) {
      issues.push(`Inactive defense mechanisms: ${inactiveMechanisms.map(m => m.mechanismName).join(', ')}`);
      recommendations.push('Deploy missing defense mechanisms immediately');
    }
    
    // Vérification alertes critiques
    const criticalAlerts = alerts.filter(a => a.alertLevel === 'CRITICAL');
    if (criticalAlerts.length > 0) {
      issues.push(`Critical alerts detected: ${criticalAlerts.map(a => a.alertMessage).join('; ')}`);
      recommendations.push('Address critical alerts immediately');
    }
    
    // Vérification intégrité chaîne
    const metrics = await this.getDefenseMetrics();
    if (!metrics.chainIntegrityValid) {
      issues.push('Cryptographic chain integrity compromised');
      recommendations.push('Investigate chain integrity violation immediately');
    }
    
    // Recommandations proactives
    if (metrics.averageInsertionTime > 1000) {
      recommendations.push('Consider optimizing insertion performance');
    }
    
    if (metrics.activeDefenses < metrics.totalDefenses) {
      recommendations.push('Ensure all defense mechanisms are deployed and active');
    }
    
    return {
      isValid: issues.length === 0 && metrics.chainIntegrityValid,
      issues,
      recommendations
    };
  }

  /**
   * 🧪 Test de résistance des défenses
   */
  async runDefenseStressTest(): Promise<{
    testPassed: boolean;
    results: Array<{
      testName: string;
      result: string;
      defenseSuccessful: boolean;
    }>;
  }> {
    const client = await this.pool.connect();
    
    try {
      // Test 1 : Injection hash
      const hashTestResult = await client.query('SELECT * FROM test_hash_injection()');
      
      // Test 2 : Falsification previous_hash
      const previousHashTestResult = await client.query('SELECT * FROM test_previous_hash_falsification()');
      
      // Test 3 : Concurrence
      const concurrencyTestResult = await client.query('SELECT test_concurrent_inserts() as result');
      
      const results = [
        ...hashTestResult.rows,
        ...previousHashTestResult.rows,
        {
          test_name: 'Concurrency Test',
          attempt_result: concurrencyTestResult.rows[0]?.result || 'Unknown',
          defense_successful: concurrencyTestResult.rows[0]?.result?.includes('ACTIVE') || false
        }
      ];
      
      const testPassed = results.every(r => r.defense_successful);
      
      return {
        testPassed,
        results
      };
      
    } finally {
      client.release();
    }
  }

  /**
   * 📊 Génération rapport défense constitutionnelle
   */
  async generateDefenseReport(): Promise<{
    timestamp: Date;
    defenseLevel: number;
    overallStatus: 'SECURE' | 'WARNING' | 'COMPROMISED';
    mechanisms: DefenseMechanism[];
    alerts: DefenseAlert[];
    metrics: DefenseMetrics;
    validation: {
      isValid: boolean;
      issues: string[];
      recommendations: string[];
    };
    stressTest?: {
      testPassed: boolean;
      results: any[];
    };
  }> {
    const [
      mechanisms,
      alerts,
      metrics,
      validation
    ] = await Promise.all([
      this.getDefenseStatus(),
      this.getDefenseAlerts(),
      this.getDefenseMetrics(),
      this.validateDefense()
    ]);
    
    // Détermination statut global
    let overallStatus: 'SECURE' | 'WARNING' | 'COMPROMISED';
    
    if (!validation.isValid || !metrics.chainIntegrityValid) {
      overallStatus = 'COMPROMISED';
    } else if (alerts.some(a => a.alertLevel === 'WARNING' || a.alertLevel === 'ERROR')) {
      overallStatus = 'WARNING';
    } else {
      overallStatus = 'SECURE';
    }
    
    // Test de résistance (optionnel, seulement si système est stable)
    let stressTest;
    if (overallStatus === 'SECURE') {
      try {
        stressTest = await this.runDefenseStressTest();
      } catch (error) {
        console.warn('Stress test failed:', error);
      }
    }
    
    return {
      timestamp: new Date(),
      defenseLevel: 2,
      overallStatus,
      mechanisms,
      alerts,
      metrics,
      validation,
      stressTest
    };
  }

  /**
   * 🔄 Monitoring continu (pour utilisation en background)
   */
  async startContinuousMonitoring(intervalMs: number = 60000): Promise<void> {
    console.log('🛡️ Starting continuous constitutional defense monitoring...');
    
    const monitor = async () => {
      try {
        const report = await this.generateDefenseReport();
        
        // Log du statut
        console.log(`🛡️ Defense Status: ${report.overallStatus} (${report.metrics.activeDefenses}/${report.metrics.totalDefenses} defenses active)`);
        
        // Alertes si nécessaire
        if (report.overallStatus === 'COMPROMISED') {
          console.error('🚨 CRITICAL: Constitutional defense compromised!');
          console.error('Issues:', report.validation.issues);
        } else if (report.overallStatus === 'WARNING') {
          console.warn('⚠️ WARNING: Defense issues detected');
          console.warn('Alerts:', report.alerts.filter(a => a.alertLevel !== 'INFO').map(a => a.alertMessage));
        }
        
        // Métriques clés
        if (report.metrics.totalEvents > 0) {
          console.log(`📊 Ledger: ${report.metrics.totalEvents} events, integrity: ${report.metrics.chainIntegrityValid ? 'VALID' : 'INVALID'}`);
        }
        
      } catch (error) {
        console.error('❌ Defense monitoring error:', error);
      }
    };
    
    // Exécution immédiate
    await monitor();
    
    // Planification continue
    setInterval(monitor, intervalMs);
  }

  /**
   * 🔧 Fermeture propre
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

/**
 * 🏭 FACTORY POUR MONITORING DÉFENSE
 */
export class ConstitutionalDefenseMonitorFactory {
  
  /**
   * Création du monitor avec configuration automatique
   */
  static create(): ConstitutionalDefenseMonitor {
    const databaseUrl = process.env.DATABASE_URL || 
                      'postgresql://spofe:password@localhost:5432/spofe';
    
    return new ConstitutionalDefenseMonitor(databaseUrl);
  }
  
  /**
   * Démarrage monitoring automatique
   */
  static async startAutoMonitoring(intervalMs: number = 60000): Promise<ConstitutionalDefenseMonitor> {
    const monitor = this.create();
    await monitor.startContinuousMonitoring(intervalMs);
    return monitor;
  }
}
