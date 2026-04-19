import type { GuardianContext, GuardianValidation, GuardianCommand } from './types';

/**
 * 🛡️ MODULE OIE — GUARDIAN (v1.0.0)
 * Guardian SPOFE - Autorité constitutionnelle du module
 * 
 * Rôle : Garantir l'intégrité et la conformité de toutes les opérations métier
 */
export class OieGuardian {
  private readonly certifiedModules: string[];

  constructor(certifiedModules?: string[]) {
    this.certifiedModules = certifiedModules || [];
  }

  /**
   * Valide une commande de déclaration d'objectif
   */
  validateDeclareObjective(
    ctx: GuardianContext,
    command: GuardianCommand
  ): GuardianValidation[] {
    const validations: GuardianValidation[] = [];

    // G01 - Tenant obligatoire
    validations.push({
      invariant: 'OIE-G01',
      isValid: !!command.tenantId && command.tenantId === ctx.tenantId,
      reason: !command.tenantId || command.tenantId !== ctx.tenantId 
        ? 'Tenant ID mismatch or missing' 
        : undefined
    });

    // G02 - Label obligatoire
    validations.push({
      invariant: 'OIE-G02',
      isValid: !!(command.label as string)?.trim(),
      reason: !(command.label as string)?.trim() 
        ? 'Objective label is required' 
        : undefined
    });

    // G03 - Type valide
    const validTypes = ['FINANCIAL', 'OPERATIONAL', 'STRATEGIC', 'QUALITATIVE'];
    validations.push({
      invariant: 'OIE-G03',
      isValid: validTypes.includes(command.type as string),
      reason: !validTypes.includes(command.type as string)
        ? `Invalid objective type. Must be one of: ${validTypes.join(', ')}`
        : undefined
    });

    // G04 - Période obligatoire
    validations.push({
      invariant: 'OIE-G04',
      isValid: !!(command.periodId as string)?.trim(),
      reason: !(command.periodId as string)?.trim()
        ? 'Period ID is required'
        : undefined
    });

    // G15 - Pas de calcul (règle système)
    const noCalculation = this.validateNoCalculation(command);
    validations.push(noCalculation);

    return validations;
  }

  /**
   * Valide une commande d'enregistrement d'indicateur
   */
  validateRegisterIndicator(
    ctx: GuardianContext,
    command: GuardianCommand,
    existingObjectives: string[]
  ): GuardianValidation[] {
    const validations: GuardianValidation[] = [];

    // G05 - Tenant obligatoire
    validations.push({
      invariant: 'OIE-G05',
      isValid: !!command.tenantId && command.tenantId === ctx.tenantId,
      reason: !command.tenantId || command.tenantId !== ctx.tenantId
        ? 'Tenant ID mismatch or missing'
        : undefined
    });

    // G06 - Label obligatoire
    validations.push({
      invariant: 'OIE-G06',
      isValid: !!(command.label as string)?.trim(),
      reason: !(command.label as string)?.trim()
        ? 'Indicator label is required'
        : undefined
    });

    // G07 - Source valide
    validations.push({
      invariant: 'OIE-G07',
      isValid: !!(command.source as { module: string; readModel: string })?.module?.trim(),
      reason: !(command.source as { module: string; readModel: string })?.module?.trim()
        ? 'Source module is required'
        : undefined
    });

    // G08 - Objectifs liés valides
    const linkedObjectives = command.linkedObjectiveIds as string[] || [];
    const invalidObjectives = linkedObjectives.filter(id => !existingObjectives.includes(id));
    validations.push({
      invariant: 'OIE-G08',
      isValid: invalidObjectives.length === 0,
      reason: invalidObjectives.length > 0
        ? `Invalid linked objectives: ${invalidObjectives.join(', ')}`
        : undefined
    });

    // G15 - Pas de calcul (règle système)
    const noCalculation = this.validateNoCalculation(command);
    validations.push(noCalculation);

    return validations;
  }

  /**
   * Valide une commande d'enregistrement d'événement stratégique
   */
  validateRegisterEvent(
    ctx: GuardianContext,
    command: GuardianCommand,
    existingObjectives: string[]
  ): GuardianValidation[] {
    const validations: GuardianValidation[] = [];

    // G09 - Tenant obligatoire
    validations.push({
      invariant: 'OIE-G09',
      isValid: !!command.tenantId && command.tenantId === ctx.tenantId,
      reason: !command.tenantId || command.tenantId !== ctx.tenantId
        ? 'Tenant ID mismatch or missing'
        : undefined
    });

    // G10 - Type d'événement obligatoire
    validations.push({
      invariant: 'OIE-G10',
      isValid: !!(command.type as string)?.trim(),
      reason: !(command.type as string)?.trim()
        ? 'Event type is required'
        : undefined
    });

    // G11 - Label obligatoire
    validations.push({
      invariant: 'OIE-G11',
      isValid: !!(command.label as string)?.trim(),
      reason: !(command.label as string)?.trim()
        ? 'Event label is required'
        : undefined
    });

    // G12 - Objectifs liés valides
    const relatedObjectives = command.relatedObjectiveIds as string[] || [];
    const invalidObjectives = relatedObjectives.filter(id => !existingObjectives.includes(id));
    validations.push({
      invariant: 'OIE-G12',
      isValid: invalidObjectives.length === 0,
      reason: invalidObjectives.length > 0
        ? `Invalid related objectives: ${invalidObjectives.join(', ')}`
        : undefined
    });

    // G15 - Pas de calcul (règle système)
    const noCalculation = this.validateNoCalculation(command);
    validations.push(noCalculation);

    return validations;
  }

  /**
   * Validation système : Pas de calcul autorisé
   */
  private validateNoCalculation(command: GuardianCommand): GuardianValidation {
    const commandText = JSON.stringify(command).toLowerCase();
    const forbiddenPatterns = [
      'calculate', 'compute', 'aggregate', 'sum', 'average',
      '+', '-', '*', '/', '=', '>', '<'
    ];

    const hasForbiddenPattern = forbiddenPatterns.some(pattern => 
      commandText.includes(pattern)
    );

    return {
      invariant: 'OIE-G15',
      isValid: !hasForbiddenPattern,
      reason: hasForbiddenPattern
        ? 'No calculation or computation allowed in commands'
        : undefined
    };
  }

  /**
   * Vérifie si un module est certifié
   */
  isModuleCertified(moduleName: string): boolean {
    return this.certifiedModules.includes(moduleName);
  }

  /**
   * Retourne la liste des modules certifiés
   */
  getCertifiedModules(): readonly string[] {
    return this.certifiedModules;
  }

  /**
   * Ajoute un module certifié
   */
  addCertifiedModule(moduleName: string): void {
    if (!this.certifiedModules.includes(moduleName)) {
      this.certifiedModules.push(moduleName);
    }
  }

  /**
   * Valide toutes les validations retournées
   */
  enforceValidations(validations: GuardianValidation[]): void {
    const failures = validations.filter(v => !v.isValid);
    
    if (failures.length > 0) {
      const reasons = failures.map(f => `${f.invariant}: ${f.reason}`).join('; ');
      throw new Error(`Guardian validation failed: ${reasons}`);
    }
  }
}
