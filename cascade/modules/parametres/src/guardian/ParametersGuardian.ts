import { ParametersFrame } from './types/ParametersFrame';
import { invariantSingleActiveFrame } from './invariants/invariantActiveFrame';
import { invariantAppendOnly } from './invariants/invariantAppendOnly';
import { invariantPassiveOnly } from './invariants/invariantPassiveOnly';
import { invariantStatesNormed } from './invariants/invariantStatesNormed';
import { invariantDocumentCatalog } from './invariants/invariantDocumentCatalog';
import { invariantRolesCapabilities } from './invariants/invariantRolesCapabilities';
import { GuardianViolation } from '../shared/errors';

const VALID_FRAME_STATUSES = ['ACTIVE', 'DEPRECATED'] as const;
const SECTOR_SPECIFIC_TERMS = ['BANKING', 'BANK', 'INSURANCE', 'ASSURANCE'];

export class ParametersGuardian {
  static validateNewFrame(
    existingFrames: ParametersFrame[],
    candidate: ParametersFrame
  ): void {
    invariantAppendOnly(false);
    this.validateAuditability(candidate);
    this.validateVersioning(candidate);
    this.validateStrictPassiveStructure(candidate);
    invariantSingleActiveFrame(existingFrames, candidate);
    invariantPassiveOnly(candidate);
    this.validatePeriods(candidate);
    this.validateNeutrality(candidate);
    this.validateStrictStates(candidate);
    invariantStatesNormed(candidate.statesCatalog);
    this.validateStrictDocumentCatalog(candidate);
    invariantDocumentCatalog(candidate.documentsCatalog);
    this.validateStrictRoles(candidate);
    invariantRolesCapabilities(candidate.rolesCatalog);
    this.validateStrictMonetaryContext(candidate);
  }

  /**
   * Compatibilité tests - valide un frame sans contexte d'historique
   */
  static validateFrame(candidate: ParametersFrame): void {
    invariantAppendOnly(false);
    this.validateAuditability(candidate);
    this.validateVersioning(candidate);
    invariantSingleActiveFrame([], candidate);
    invariantPassiveOnly(candidate);
    this.validatePeriods(candidate);
    this.validateNeutrality(candidate);
    invariantStatesNormed(candidate.statesCatalog);
    invariantDocumentCatalog(candidate.documentsCatalog);
    invariantRolesCapabilities(candidate.rolesCatalog);
  }

  private static validateAuditability(candidate: ParametersFrame): void {
    if (!candidate.frameId?.trim()) {
      throw new GuardianViolation(
        'G-P09: Identifiant obligatoire manquant ou vide: frameId | G-P02: Un ParametersFrame doit avoir un frameId non modifiable'
      );
    }

    for (const currency of candidate.monetaryContext.currencies) {
      if (!/^[A-Z]{3}$/.test(currency.code)) {
        throw new GuardianViolation(
          `G-P09: Code devise invalide: ${currency.code}`
        );
      }
    }
  }

  private static validateVersioning(candidate: ParametersFrame): void {
    if (!candidate.version?.trim()) {
      throw new GuardianViolation(
        'G-P08: Version manquante | G-P02: Un ParametersFrame doit avoir une version non modifiable | G-P01: Un cadre ACTIVE doit avoir une version et une date d\'effet'
      );
    }

    if (!VALID_FRAME_STATUSES.includes(candidate.status)) {
      throw new GuardianViolation(`G-P08: Statut invalide: ${candidate.status}`);
    }

    if (candidate.status === 'ACTIVE' && candidate.effectiveFrom === '1970-01-01') {
      throw new GuardianViolation(
        'G-P01: Un cadre ACTIVE doit avoir une version et une date d\'effet'
      );
    }
  }

  private static validatePeriods(candidate: ParametersFrame): void {
    const periods = [...candidate.fiscalContext.fiscalYears].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    for (const period of periods) {
      if (period.startDate.getTime() >= period.endDate.getTime()) {
        throw new GuardianViolation(
          `G-P05: La période ${period.periodId} a des dates incohérentes`
        );
      }
    }

    for (let index = 1; index < periods.length; index += 1) {
      const previous = periods[index - 1];
      const current = periods[index];

      if (current.startDate.getTime() < previous.endDate.getTime()) {
        throw new GuardianViolation(
          `G-P05: Chevauchement de périodes détecté: ${previous.periodId} et ${current.periodId}`
        );
      }
    }
  }

  private static validateNeutrality(candidate: ParametersFrame): void {
    const legalName = candidate.identityContext.legalName.toUpperCase();

    if (SECTOR_SPECIFIC_TERMS.some(term => legalName.includes(term))) {
      throw new GuardianViolation('G-P07: Terme spécifique à un secteur détecté');
    }
  }

  private static validateStrictPassiveStructure(candidate: ParametersFrame): void {
    const flaggedKeys = new Set([
      'rule',
      'calculate',
      'trigger',
      'formula',
      'mandatory',
      'now',
      'onlyForStock',
      'opaque',
    ]);

    const visit = (value: unknown): void => {
      if (!value || typeof value !== 'object') {
        return;
      }

      for (const [key, nestedValue] of Object.entries(value)) {
        if (flaggedKeys.has(key)) {
          throw new GuardianViolation(`G-P03: Clé active interdite détectée: ${key}`);
        }

        visit(nestedValue);
      }
    };

    visit(candidate);
  }

  private static validateStrictStates(candidate: ParametersFrame): void {
    if (candidate.statesCatalog.genericStates.length === 0) {
      throw new GuardianViolation('G-P04: genericStates ne peut pas être vide');
    }

    for (const state of candidate.statesCatalog.documentStates) {
      const code = state.code.toUpperCase();
      const mapped = state.mappedGenericState.toUpperCase();

      if (code.includes('DRAFT') && mapped !== 'DRAFT') {
        throw new GuardianViolation(`G-P04: L'état document ${state.code} doit mapper vers DRAFT`);
      }
      if (code.includes('VALIDATED') && mapped !== 'VALIDATED') {
        throw new GuardianViolation(`G-P04: L'état document ${state.code} doit mapper vers VALIDATED`);
      }
      if (code.includes('CLOSED') && mapped !== 'CLOSED') {
        throw new GuardianViolation(`G-P04: L'état document ${state.code} doit mapper vers CLOSED`);
      }
      if (code.includes('LOCKED') && mapped !== 'LOCKED') {
        throw new GuardianViolation(`G-P04: L'état document ${state.code} doit mapper vers LOCKED`);
      }
    }
  }

  private static validateStrictDocumentCatalog(candidate: ParametersFrame): void {
    for (const documentType of candidate.documentsCatalog.documentTypes) {
      if (!documentType.category) {
        throw new GuardianViolation(`G-P06: Le type de document ${documentType.documentTypeCode} doit avoir une catégorie`);
      }
    }
  }

  private static validateStrictRoles(candidate: ParametersFrame): void {
    const allowedCapabilities = ['READ', 'WRITE', 'CLOSE', 'EXPORT'];

    for (const role of candidate.rolesCatalog.roles) {
      for (const capability of role.capabilities) {
        if (!allowedCapabilities.includes(capability)) {
          throw new GuardianViolation(`G-P07: Capacité inconnue: ${capability}`);
        }
      }
    }
  }

  private static validateStrictMonetaryContext(candidate: ParametersFrame): void {
    const defaultCurrency = candidate.identityContext.defaultCurrency;
    const referencedCurrency = candidate.monetaryContext.currencies.find(
      (currency) => currency.code === defaultCurrency
    );

    if (referencedCurrency && !referencedCurrency.active) {
      throw new GuardianViolation(
        `G-P07: La devise de référence ${defaultCurrency} ne peut pas être inactive`
      );
    }
  }
}
