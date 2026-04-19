import { ParametersFrame } from '../../guardian/types/ParametersFrame.js';
import { ParametersFrameRM } from '../types/ParametersFrameRM.js';
import { FiscalPeriod } from '../../guardian/types/FiscalContext.js';
import { Currency, TaxRate } from '../../guardian/types/MonetaryContext.js';
import { AccountReference } from '../../guardian/types/NormativeContext.js';
import { GenericState, DocumentState, PeriodState } from '../../guardian/types/StatesCatalog.js';
import { Role } from '../../guardian/types/RolesCatalog.js';
import { DocumentType } from '../../guardian/types/DocumentsCatalog.js';

export class ParametersFrameProjection {
  static project(frame: ParametersFrame): ParametersFrameRM {
    return {
      frameId: frame.frameId,
      version: frame.version,
      status: frame.status,
      effectiveFrom: frame.effectiveFrom,

      identity: {
        legalName: frame.identityContext.legalName,
        legalForm: frame.identityContext.legalForm,
        countryCode: frame.identityContext.countryCode,
        defaultCurrency: frame.identityContext.defaultCurrency,
        timezone: frame.identityContext.timezone,
        defaultLanguage: frame.identityContext.defaultLanguage
      },

      fiscal: {
        fiscalYears: frame.fiscalContext.fiscalYears.map((p: FiscalPeriod) => ({
          periodId: p.periodId,
          startDate: p.startDate.toISOString().split('T')[0],
          endDate: p.endDate.toISOString().split('T')[0],
          status: p.status
        })),
        allowedFrequencies: [...frame.fiscalContext.allowedFrequencies]
      },

      monetary: {
        currencies: frame.monetaryContext.currencies.map((c: Currency) => ({
          code: c.code,
          label: c.label,
          active: c.active
        })),
        taxRates: frame.monetaryContext.taxRates.map((t: TaxRate) => ({
          taxCode: t.taxCode,
          rate: t.rate,
          countryCode: t.countryCode,
          active: t.active
        }))
      },

      normative: {
        accountingFramework: {
          frameworkCode: frame.normativeContext.accountingFramework,
          active: true
        },
        accounts: frame.normativeContext.accounts.map((a: AccountReference) => ({
          accountCode: a.accountCode,
          label: a.label,
          frameworkCode: a.frameworkCode,
          active: a.active
        })),
        journalTypes: frame.normativeContext.journalTypes.map(jt => typeof jt === 'string' ? jt : jt.toString()),
        numberingFormats: frame.normativeContext.numberingFormats.map(nf => typeof nf === 'string' ? nf : nf.toString())
      },

      states: {
        genericStates: frame.statesCatalog.genericStates.map((s: GenericState) => s),
        documentStates: frame.statesCatalog.documentStates.map((ds: DocumentState) => ({
          code: ds.code,
          mappedGenericState: ds.mappedGenericState
        })),
        periodStates: frame.statesCatalog.periodStates.map((ps: PeriodState) => ps.code)
      },

      roles: {
        roles: frame.rolesCatalog.roles.map((r: Role) => ({
          roleCode: r.roleCode,
          label: r.label,
          capabilities: [...r.capabilities]
        })),
        separationOfDuties: { ...frame.rolesCatalog.separationOfDuties }
      },

      documents: {
        documentTypes: frame.documentsCatalog.documentTypes.map((d: DocumentType) => ({
          documentTypeCode: d.documentTypeCode,
          label: d.label,
          category: d.category,
          allowedModules: [...d.allowedModules],
          initialState: d.initialState,
          active: d.active
        }))
      }
    };
  }
}
