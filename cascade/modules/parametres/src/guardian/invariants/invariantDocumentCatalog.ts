import { DocumentsCatalog } from '../types/DocumentsCatalog';
import { GuardianViolation } from '../../shared/errors';

export function invariantDocumentCatalog(
  catalog: DocumentsCatalog
): void {
  const activeBehaviorPatterns = ['TRIGGER', 'ACTION', 'AUTO', 'WORKFLOW', 'MANDATORY'];

  for (const doc of catalog.documentTypes) {
    if (!doc.documentTypeCode) {
      throw new GuardianViolation(
        'G-P06: documentTypeCode obligatoire'
      );
    }

    if (!doc.allowedModules.length) {
      throw new GuardianViolation(
        `G-P06: Le type de document ${doc.documentTypeCode} doit avoir au moins un module autorisé`
      );
    }

    if (!['DRAFT', 'VALIDATED', 'CLOSED', 'LOCKED'].includes(doc.initialState)) {
      throw new GuardianViolation(
        `G-P04: Le type de document ${doc.documentTypeCode} a un état initial invalide: ${doc.initialState}`
      );
    }

    const code = doc.documentTypeCode.toUpperCase();
    if (activeBehaviorPatterns.some(pattern => code.includes(pattern))) {
      throw new GuardianViolation(
        `G-P06: Le type de document ${doc.documentTypeCode} suggère un comportement actif, interdit dans Paramètres`
      );
    }

    if ((doc as any).dependsOn) {
      throw new GuardianViolation(
        'G-P06: Les dépendances entre documents sont interdites'
      );
    }
  }
}
