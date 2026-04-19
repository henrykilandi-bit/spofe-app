export interface ParametersFrameRM {
    frameId: string;
    version: string;
    status: 'ACTIVE' | 'DEPRECATED';
    effectiveFrom: string;
    identity: {
        legalName: string;
        legalForm: string;
        countryCode: string;
        defaultCurrency: string;
        timezone: string;
        defaultLanguage: string;
    };
    fiscal: {
        fiscalYears: {
            periodId: string;
            startDate: string;
            endDate: string;
            status: 'OPEN' | 'CLOSED' | 'LOCKED';
        }[];
        allowedFrequencies: string[];
    };
    monetary: {
        currencies: {
            code: string;
            label: string;
            active: boolean;
        }[];
        taxRates: {
            taxCode: string;
            rate: number;
            countryCode: string;
            active: boolean;
        }[];
    };
    normative: {
        accountingFramework: {
            frameworkCode: string;
            active: boolean;
        };
        accounts: {
            accountCode: string;
            label: string;
            frameworkCode: string;
            active: boolean;
        }[];
        journalTypes: string[];
        numberingFormats: string[];
    };
    states: {
        genericStates: string[];
        documentStates: {
            code: string;
            mappedGenericState: string;
        }[];
        periodStates: string[];
    };
    roles: {
        roles: {
            roleCode: string;
            label: string;
            capabilities: string[];
        }[];
        separationOfDuties: Record<string, unknown>;
    };
    documents: {
        documentTypes: {
            documentTypeCode: string;
            label: string;
            category: string;
            allowedModules: string[];
            initialState: string;
            active: boolean;
        }[];
    };
}
//# sourceMappingURL=ParametersFrameRM.d.ts.map