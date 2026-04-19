/**
 * 🧪 Tests P0 - ParametersGuardian
 * 
 * Ces tests valident les invariants constitutionnels P0 du Guardian.
 * Un seul test qui échoue = le module n'est pas certifiable.
 */

import { ParametersGuardian } from '../../../src/guardian/ParametersGuardian';
import { ParametersFrame, FrameStatus, GenericState } from '../../../src/domain/ParametersFrame.js';

describe('🛡️ ParametersGuardian - Invariants P0', () => {
  
  /**
   * Helper pour créer un ParametersFrame valide
   */
  const createValidFrame = (): ParametersFrame => ({
    frameId: 'parametres-v1.0.0',
    version: '1.0.0',
    status: 'ACTIVE',
    effectiveFrom: '2026-01-01',
    identityContext: {
      legalName: 'SPOFE Test Company',
      legalForm: 'SAS',
      countryCode: 'FR',
      defaultCurrency: 'EUR',
      timezone: 'Europe/Paris',
      defaultLanguage: 'fr'
    },
    fiscalContext: {
      fiscalYears: [
        {
          periodId: '2026',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          status: 'OPEN'
        }
      ],
      allowedFrequencies: ['MONTHLY', 'QUARTERLY', 'YEARLY']
    },
    monetaryContext: {
      currencies: [
        { code: 'EUR', label: 'Euro', active: true },
        { code: 'USD', label: 'US Dollar', active: true }
      ],
      taxRates: [
        { taxCode: 'TVA_20', rate: 20.0, countryCode: 'FR', active: true }
      ]
    },
    normativeContext: {
      accountingFramework: 'PCG',
      accounts: [
        { accountCode: '101000', label: 'Capital', frameworkCode: 'PCG', active: true }
      ],
      journalTypes: [
        { journalCode: 'AC', label: 'Achats', type: 'PURCHASE', active: true }
      ],
      numberingFormats: [
        { documentType: 'INVOICE', format: 'AC{YYYY}{MM}{NNNN}', mask: 'AC2026010001' }
      ]
    },
    statesCatalog: {
      genericStates: ['DRAFT', 'VALIDATED', 'CLOSED', 'LOCKED'],
      documentStates: [
        { code: 'DRAFT', mappedGenericState: 'DRAFT' },
        { code: 'VALIDATED', mappedGenericState: 'VALIDATED' }
      ],
      periodStates: [
        { code: 'OPEN' },
        { code: 'CLOSED' },
        { code: 'LOCKED' }
      ]
    },
    rolesCatalog: {
      roles: [
        { roleCode: 'DIRIGEANT', label: 'Dirigeant', capabilities: ['READ', 'WRITE', 'CLOSE', 'EXPORT'] },
        { roleCode: 'COMPTABLE', label: 'Comptable', capabilities: ['READ', 'WRITE'] }
      ],
      separationOfDuties: {
        DIRIGEANT: {
          incompatibleRoles: [],
          restrictedCapabilities: []
        }
      }
    },
    documentsCatalog: {
      documentTypes: [
        {
          documentTypeCode: 'PURCHASE_ORDER',
          label: 'Bon de commande',
          category: 'COMMERCIAL',
          allowedModules: ['vente', 'budget'],
          initialState: 'DRAFT',
          active: true
        }
      ]
    }
  });

  describe('🛑 G-P01 - Un seul cadre actif', () => {
    it('devrait accepter un cadre ACTIVE avec version et date d\'effet', () => {
      const frame = createValidFrame();
      
      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).not.toThrow();
    });

    it('devrait rejeter un cadre ACTIVE sans version', () => {
      const frame = createValidFrame();
      frame.version = '';

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P01: Un cadre ACTIVE doit avoir une version et une date d\'effet');
    });

    it('devrait rejeter un cadre ACTIVE sans date d\'effet', () => {
      const frame = createValidFrame();
      frame.effectiveFrom = '1970-01-01';

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P01: Un cadre ACTIVE doit avoir une version et une date d\'effet');
    });
  });

  describe('🛑 G-P02 - Append-only strict', () => {
    it('devrait accepter un frame avec frameId et version', () => {
      const frame = createValidFrame();

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).not.toThrow();
    });

    it('devrait rejeter un frame sans frameId', () => {
      const frame = createValidFrame();
      frame.frameId = '';

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P02: Un ParametersFrame doit avoir un frameId non modifiable');
    });

    it('devrait rejeter un frame sans version', () => {
      const frame = createValidFrame();
      frame.version = '';

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P02: Un ParametersFrame doit avoir une version non modifiable');
    });
  });

  describe('🛑 G-P04 - États normés obligatoires', () => {
    it('devrait accepter des états de documents valides', () => {
      const frame = createValidFrame();

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).not.toThrow();
    });

    it('devrait rejeter un état de document avec mapping invalide', () => {
      const frame = createValidFrame();
      frame.statesCatalog.documentStates.push({
        code: 'INVALID_STATE',
        mappedGenericState: 'INVALID' as GenericState
      });

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P04: L\'état document INVALID_STATE mappe vers un état générique invalide: INVALID');
    });

    it('devrait rejeter un type de document avec état initial invalide', () => {
      const frame = createValidFrame();
      frame.documentsCatalog.documentTypes[0].initialState = 'INVALID' as GenericState;

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P04: Le type de document PURCHASE_ORDER a un état initial invalide: INVALID');
    });
  });

  describe('🛑 G-P05 - Périodes cohérentes', () => {
    it('devrait accepter des périodes avec dates cohérentes', () => {
      const frame = createValidFrame();

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).not.toThrow();
    });

    it('devrait rejeter une période avec startDate >= endDate', () => {
      const frame = createValidFrame();
      frame.fiscalContext.fiscalYears[0].startDate = new Date('2026-12-31');
      frame.fiscalContext.fiscalYears[0].endDate = new Date('2026-01-01');

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P05: La période 2026 a des dates incohérentes');
    });

    it('devrait rejeter des périodes qui se chevauchent', () => {
      const frame = createValidFrame();
      frame.fiscalContext.fiscalYears.push({
        periodId: '2026-BIS',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-12-31'),
        status: 'OPEN'
      });

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P05: Chevauchement de périodes détecté: 2026 et 2026-BIS');
    });
  });

  describe('🛑 G-P06 - Catalogue documentaire passif', () => {
    it('devrait accepter un catalogue documentaire passif', () => {
      const frame = createValidFrame();

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).not.toThrow();
    });

    it('devrait rejeter un type de document sans modules autorisés', () => {
      const frame = createValidFrame();
      frame.documentsCatalog.documentTypes[0].allowedModules = [];

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P06: Le type de document PURCHASE_ORDER doit avoir au moins un module autorisé');
    });

    it('devrait rejeter un type de document suggérant un comportement actif', () => {
      const frame = createValidFrame();
      frame.documentsCatalog.documentTypes[0].documentTypeCode = 'AUTO_WORKFLOW_DOC';

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P06: Le type de document AUTO_WORKFLOW_DOC suggère un comportement actif, interdit dans Paramètres');
    });
  });

  describe('🛑 G-P08 - Version explicite', () => {
    it('devrait accepter un frame avec version, date d\'effet et statut valides', () => {
      const frame = createValidFrame();

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).not.toThrow();
    });

    it('devrait rejeter un frame sans version', () => {
      const frame = createValidFrame();
      frame.version = '';

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P08: Version manquante');
    });

    it('devrait rejeter un frame avec statut invalide', () => {
      const frame = createValidFrame();
      frame.status = 'INVALID' as FrameStatus;

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P08: Statut invalide: INVALID');
    });
  });

  describe('🛑 G-P09 - Lisibilité & auditabilité', () => {
    it('devrait accepter un frame avec tous les identifiants valides', () => {
      const frame = createValidFrame();

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).not.toThrow();
    });

    it('devrait rejeter un frame avec frameId vide', () => {
      const frame = createValidFrame();
      frame.frameId = '';

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P09: Identifiant obligatoire manquant ou vide: frameId');
    });

    it('devrait rejeter une devise avec code invalide', () => {
      const frame = createValidFrame();
      frame.monetaryContext.currencies[0].code = 'EURO'; // Trop long

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P09: Code devise invalide: EURO');
    });
  });

  describe('🧪 Tests d\'intégration des invariants', () => {
    it('devrait valider un frame complet et valide', () => {
      const frame = createValidFrame();

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).not.toThrow();
    });

    it('devrait rejeter un frame avec plusieurs violations', () => {
      const frame = createValidFrame();
      frame.version = ''; // Violation G-P08
      frame.frameId = ''; // Violation G-P02 et G-P09

      expect(() => {
        ParametersGuardian.validateFrame(frame);
      }).toThrow('G-P09: Identifiant obligatoire manquant ou vide: frameId');
    });
  });
});
