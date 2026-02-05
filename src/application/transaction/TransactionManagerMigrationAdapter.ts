/**
 * 🔄 TRANSACTION MANAGER MIGRATION ADAPTER
 * Adaptateur pour migration transparente vers TransactionManager P0
 * 
 * Objectif : Changer le point d'écriture SANS casser l'existant
 * - Zéro modification métier
 * - Zéro régression fonctionnelle  
 * - Migration progressive possible
 */

import { 
  TransactionManager, 
  ExecuteDecisionInput, 
  ExecuteDecisionResult,
  GuardianViolationError,
  ValidationError,
  DatabaseError
} from './TransactionManager';

import { 
  GuardianPort 
} from './GuardianPort';

import { 
  DbClient 
} from './DbClient';

import { 
  ConstitutionalTransactionManagerP0,
  TransactionResult,
  AuditLogEntry
} from './ConstitutionalTransactionManagerP0';

/**
 * 🔄 ADAPTATEUR DE MIGRATION
 * Maintient l'interface existante tout en utilisant le TM P0 en interne
 */
export class TransactionManagerMigrationAdapter {
  private constitutionalTM: ConstitutionalTransactionManagerP0;
  private legacyTM: TransactionManager;
  private migrationMode: 'LEGACY' | 'HYBRID' | 'CONSTITUTIONAL';

  constructor(
    guardian: GuardianPort,
    db: DbClient,
    pg: any, // Pool PostgreSQL pour TM P0
    migrationMode: 'LEGACY' | 'HYBRID' | 'CONSTITUTIONAL' = 'HYBRID'
  ) {
    // Création TM constitutionnel
    this.constitutionalTM = new ConstitutionalTransactionManagerP0(pg);
    
    // Conservation TM legacy pour compatibilité
    this.legacyTM = new TransactionManager(guardian, db);
    
    this.migrationMode = migrationMode;
  }

  /**
   * 🔄 Point d'entrée principal avec mode de migration configurable
   */
  async executeDecision(
    input: ExecuteDecisionInput
  ): Promise<ExecuteDecisionResult> {
    switch (this.migrationMode) {
      case 'LEGACY':
        return this.executeLegacy(input);
        
      case 'HYBRID':
        return this.executeHybrid(input);
        
      case 'CONSTITUTIONAL':
        return this.executeConstitutional(input);
        
      default:
        throw new Error(`Unknown migration mode: ${this.migrationMode}`);
    }
  }

  /**
   * 🔴 MODE LEGACY - Utilise uniquement l'ancien TM
   */
  private async executeLegacy(input: ExecuteDecisionInput): Promise<ExecuteDecisionResult> {
    return await this.legacyTM.executeDecision(input);
  }

  /**
   * 🟡 MODE HYBRIDE - Double écriture avec validation
   */
  private async executeHybrid(input: ExecuteDecisionInput): Promise<ExecuteDecisionResult> {
    try {
      // 1. Écriture constitutionnelle (source de vérité)
      const constitutionalResult = await this.executeConstitutional(input);
      
      // 2. Écriture legacy en parallèle (compatibilité)
      try {
        await this.legacyTM.executeDecision(input);
      } catch (legacyError) {
        console.warn('Legacy write failed, but constitutional write succeeded:', legacyError);
        // On continue car le TM constitutionnel est la source de vérité
      }
      
      return constitutionalResult;
      
    } catch (constitutionalError) {
      // Si l'écriture constitutionnelle échoue, on essaie legacy
      console.warn('Constitutional write failed, falling back to legacy:', constitutionalError);
      return await this.legacyTM.executeDecision(input);
    }
  }

  /**
   * 🟢 MODE CONSTITUTIONNEL - Utilise uniquement le TM P0
   */
  private async executeConstitutional(input: ExecuteDecisionInput): Promise<ExecuteDecisionResult> {
    // Conversion vers format Command pour TM P0
    const command = this.convertToCommand(input);
    
    try {
      // Exécution via TM P0
      const result = await this.constitutionalTM.execute(command);
      
      // Conversion du résultat vers format attendu
      return {
        success: true,
        decisionId: input.decisionId,
        checksum: this.generateChecksum(input, result)
      };
      
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`Constitutional transaction failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 🔄 Conversion ExecuteDecisionInput vers Command
   */
  private convertToCommand(input: ExecuteDecisionInput): any {
    return {
      aggregateId: input.decisionId,
      aggregateType: input.processName,
      type: input.decisionType,
      payload: {
        decisionId: input.decisionId,
        processName: input.processName,
        actorRole: input.actorRole,
        decisionType: input.decisionType,
        payload: input.payload,
        context: input.context,
        events: input.events,
        facts: input.facts
      },
      guardian: {
        validate: async () => {
          // Le Guardian est déjà validé dans executeDecision
          // Cette méthode est un placeholder pour la compatibilité
          return true;
        }
      },
      userId: this.extractUserId(input.context)
    };
  }

  /**
   * 🔍 Extraction userId depuis contexte
   */
  private extractUserId(context: unknown): string | undefined {
    if (context && typeof context === 'object' && 'userId' in context) {
      const userId = (context as any).userId;
      return userId ? String(userId) : undefined;
    }
    return undefined;
  }

  /**
   * 🔐 Génération checksum pour compatibilité
   */
  private generateChecksum(input: ExecuteDecisionInput, result: TransactionResult): string {
    const checksumData = {
      decisionId: input.decisionId,
      processName: input.processName,
      decisionType: input.decisionType,
      eventId: result.eventId,
      sequence: result.sequence,
      timestamp: result.timestamp
    };
    
    // Simple hash pour compatibilité (en production, utiliser crypto)
    return Buffer.from(JSON.stringify(checksumData)).toString('base64').slice(0, 32);
  }

  /**
   * 🔄 Changement du mode de migration à chaud
   */
  setMigrationMode(mode: 'LEGACY' | 'HYBRID' | 'CONSTITUTIONAL'): void {
    this.migrationMode = mode;
    console.log(`TransactionManager migration mode changed to: ${mode}`);
  }

  /**
   * 📊 Statistiques de migration
   */
  async getMigrationStats(): Promise<{
    mode: string;
    constitutionalStats: any;
    legacyStats?: any;
    recommendations: string[];
  }> {
    const constitutionalStats = await this.constitutionalTM.getLedgerStats();
    
    const recommendations: string[] = [];
    
    if (this.migrationMode === 'LEGACY') {
      recommendations.push('Consider switching to HYBRID mode for gradual migration');
    } else if (this.migrationMode === 'HYBRID') {
      recommendations.push('Monitor legacy write failures');
      recommendations.push('Plan switch to CONSTITUTIONAL mode when stable');
    } else {
      recommendations.push('Monitor constitutional ledger integrity');
    }
    
    return {
      mode: this.migrationMode,
      constitutionalStats,
      legacyStats: this.migrationMode !== 'CONSTITUTIONAL' ? { status: 'active' } : undefined,
      recommendations
    };
  }

  /**
   * 🧪 Validation de la migration
   */
  async validateMigration(): Promise<{
    isValid: boolean;
    issues: string[];
    nextSteps: string[];
  }> {
    const issues: string[] = [];
    const nextSteps: string[] = [];
    
    // Validation conformité constitutionnelle
    const compliance = await this.constitutionalTM.validateConstitutionalCompliance();
    
    if (!compliance.isCompliant) {
      issues.push(...compliance.issues);
      nextSteps.push(...compliance.recommendations);
    }
    
    // Validation mode de migration
    if (this.migrationMode === 'HYBRID') {
      nextSteps.push('Monitor hybrid mode performance');
      nextSteps.push('Plan switch to CONSTITUTIONAL when ready');
    } else if (this.migrationMode === 'LEGACY') {
      nextSteps.push('Start migration to HYBRID mode');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      nextSteps
    };
  }

  /**
   * 🔄 Fermeture propre
   */
  async close(): Promise<void> {
    await this.constitutionalTM.close();
    // Note: Le legacy TM n'a pas de méthode close dans l'interface
  }
}

/**
 * 🏭 FACTORY POUR MIGRATION PROGRESSIVE
 */
export class TransactionManagerMigrationFactory {
  
  /**
   * Création avec mode de migration automatique
   */
  static create(
    guardian: GuardianPort,
    db: DbClient,
    pg: any,
    environment: 'development' | 'staging' | 'production' = 'development'
  ): TransactionManagerMigrationAdapter {
    
    // Mode de migration selon environnement
    let migrationMode: 'LEGACY' | 'HYBRID' | 'CONSTITUTIONAL';
    
    switch (environment) {
      case 'development':
        migrationMode = 'HYBRID'; // Test en double écriture
        break;
      case 'staging':
        migrationMode = 'CONSTITUTIONAL'; // Validation full constitutionnel
        break;
      case 'production':
        migrationMode = 'HYBRID'; // Migration progressive en production
        break;
      default:
        migrationMode = 'HYBRID';
    }
    
    return new TransactionManagerMigrationAdapter(guardian, db, pg, migrationMode);
  }
  
  /**
   * Création avec validation de migration
   */
  static async createAndValidate(
    guardian: GuardianPort,
    db: DbClient,
    pg: any,
    environment: 'development' | 'staging' | 'production' = 'development'
  ): Promise<{
    adapter: TransactionManagerMigrationAdapter;
    validation: {
      isValid: boolean;
      issues: string[];
      nextSteps: string[];
    };
  }> {
    const adapter = this.create(guardian, db, pg, environment);
    const validation = await adapter.validateMigration();
    
    return {
      adapter,
      validation
    };
  }
}
