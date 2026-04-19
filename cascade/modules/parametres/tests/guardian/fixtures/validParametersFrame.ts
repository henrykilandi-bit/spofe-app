import { ParametersFrame } from '../../../src/guardian/types/ParametersFrame';

export function validParametersFrame(): ParametersFrame {
  return {
    frameId: 'FRAME-001',
    version: '1.0.0',
    status: 'ACTIVE',
    effectiveFrom: '2026-01-01',

    identityContext: {
      legalName: 'ACME SA',
      legalForm: 'SA',
      countryCode: 'FR',
      defaultCurrency: 'EUR',
      timezone: 'Europe/Paris',
      defaultLanguage: 'fr'
    },

    fiscalContext: {
      fiscalYears: [],
      allowedFrequencies: ['MONTHLY', 'YEARLY']
    },

    monetaryContext: {
      currencies: [{ code: 'EUR', label: 'Euro', active: true }],
      taxRates: [{ taxCode: 'VAT20', rate: 0.2, countryCode: 'FR', active: true }]
    },

    normativeContext: {
      accountingFramework: 'PCG',
      accounts: [],
      journalTypes: [],
      numberingFormats: []
    },

    statesCatalog: {
      genericStates: ['DRAFT', 'VALIDATED', 'CLOSED', 'LOCKED'],
      documentStates: [{ code: 'DOC_DRAFT', mappedGenericState: 'DRAFT' }],
      periodStates: [{ code: 'OPEN' }, { code: 'CLOSED' }, { code: 'LOCKED' }]
    },

    rolesCatalog: {
      roles: [{ roleCode: 'DIRIGEANT', label: 'Dirigeant', capabilities: ['READ', 'WRITE'] }],
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
          documentTypeCode: 'INVOICE',
          label: 'Facture',
          category: 'FINANCIAL',
          allowedModules: ['VENTE', 'PRECOMPTABILITE'],
          initialState: 'DRAFT',
          active: true
        }
      ]
    }
  };
}
