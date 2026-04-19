"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametersFrameProjection = void 0;
class ParametersFrameProjection {
    static project(frame) {
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
                fiscalYears: frame.fiscalContext.fiscalYears.map((p) => ({
                    periodId: p.periodId,
                    startDate: p.startDate.toISOString().split('T')[0],
                    endDate: p.endDate.toISOString().split('T')[0],
                    status: p.status
                })),
                allowedFrequencies: [...frame.fiscalContext.allowedFrequencies]
            },
            monetary: {
                currencies: frame.monetaryContext.currencies.map((c) => ({
                    code: c.code,
                    label: c.label,
                    active: c.active
                })),
                taxRates: frame.monetaryContext.taxRates.map((t) => ({
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
                accounts: frame.normativeContext.accounts.map((a) => ({
                    accountCode: a.accountCode,
                    label: a.label,
                    frameworkCode: a.frameworkCode,
                    active: a.active
                })),
                journalTypes: frame.normativeContext.journalTypes.map(jt => typeof jt === 'string' ? jt : jt.toString()),
                numberingFormats: frame.normativeContext.numberingFormats.map(nf => typeof nf === 'string' ? nf : nf.toString())
            },
            states: {
                genericStates: frame.statesCatalog.genericStates.map((s) => s.code),
                documentStates: frame.statesCatalog.documentStates.map((ds) => ({
                    code: ds.code,
                    mappedGenericState: ds.mappedGenericState
                })),
                periodStates: frame.statesCatalog.periodStates.map((ps) => ps.code)
            },
            roles: {
                roles: frame.rolesCatalog.roles.map((r) => ({
                    roleCode: r.roleCode,
                    label: r.label,
                    capabilities: [...r.capabilities]
                })),
                separationOfDuties: { ...frame.rolesCatalog.separationOfDuties }
            },
            documents: {
                documentTypes: frame.documentsCatalog.documentTypes.map((d) => ({
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
exports.ParametersFrameProjection = ParametersFrameProjection;
//# sourceMappingURL=ParametersFrameProjection.js.map