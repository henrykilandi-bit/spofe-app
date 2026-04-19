/**
 * 🧱 ParametersFrame - Agrégat Racine du Module Paramètres
 *
 * C'est l'unité de vérité du module.
 * Tout est inclus dans un cadre versionné unique.
 * Aucune mutation partielle n'est autorisée.
 */
export type FrameStatus = 'ACTIVE' | 'DEPRECATED';
export interface ParametersFrame {
    /** Identifiant unique du cadre */
    frameId: string;
    /** Version du cadre (ex: v1.0.0) */
    version: string;
    /** Statut du cadre */
    status: FrameStatus;
    /** Date d'entrée en vigueur */
    effectiveFrom: Date;
    /** Contexte d'identité de l'entité */
    identityContext: IdentityContext;
    /** Contexte fiscal et périodes */
    fiscalContext: FiscalContext;
    /** Contexte monétaire et taxes */
    monetaryContext: MonetaryContext;
    /** Contexte normatif et comptable */
    normativeContext: NormativeContext;
    /** Catalogue des états et statuts */
    statesCatalog: StatesCatalog;
    /** Catalogue des rôles et capacités */
    rolesCatalog: RolesCatalog;
    /** Catalogue des types de documents */
    documentsCatalog: DocumentsCatalog;
}
/**
 * 🏢 Identité & Contexte de l'Entité
 * Valeurs atomiques, aucune dérivation.
 */
export interface IdentityContext {
    /** Raison sociale */
    legalName: string;
    /** Forme juridique */
    legalForm: string;
    /** Code pays (ISO) */
    countryCode: string;
    /** Devise par défaut (ISO) */
    defaultCurrency: string;
    /** Fuseau horaire */
    timezone: string;
    /** Langue par défaut */
    defaultLanguage: string;
}
/**
 * 📅 Exercices & Périodes
 * Aucun calcul de durée ou de chevauchement automatique.
 */
export type PeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';
export interface FiscalPeriod {
    /** Identifiant unique de la période */
    periodId: string;
    /** Date de début */
    startDate: Date;
    /** Date de fin */
    endDate: Date;
    /** Statut de la période */
    status: PeriodStatus;
}
export type AllowedFrequency = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export interface FiscalContext {
    /** Années fiscales déclarées */
    fiscalYears: FiscalPeriod[];
    /** Fréquences autorisées */
    allowedFrequencies: AllowedFrequency[];
}
/**
 * 💰 Référentiels Monétaires & Fiscaux
 * Taux déclarés, jamais calculés.
 */
export interface Currency {
    /** Code ISO de la devise */
    code: string;
    /** Libellé */
    label: string;
    /** Statut d'activation */
    active: boolean;
}
export interface TaxRate {
    /** Code de la taxe */
    taxCode: string;
    /** Taux (en pourcentage) */
    rate: number;
    /** Code pays */
    countryCode: string;
    /** Statut d'activation */
    active: boolean;
}
export interface MonetaryContext {
    /** Devises autorisées */
    currencies: Currency[];
    /** Taux de taxes déclarés */
    taxRates: TaxRate[];
}
/**
 * 📊 Cadres Comptables & Normatifs
 */
export type AccountingFramework = 'PCG' | 'IFRS' | 'OHADA' | 'CUSTOM';
export interface AccountReference {
    /** Code du compte */
    accountCode: string;
    /** Libellé */
    label: string;
    /** Cadre comptable */
    frameworkCode: AccountingFramework;
    /** Statut d'activation */
    active: boolean;
}
export interface JournalType {
    /** Code du journal */
    journalCode: string;
    /** Libellé */
    label: string;
    /** Type */
    type: string;
    /** Statut d'activation */
    active: boolean;
}
export interface NumberingFormat {
    /** Type de document */
    documentType: string;
    /** Format de numérotation */
    format: string;
    /** Masque */
    mask: string;
}
export interface NormativeContext {
    /** Cadre comptable de référence */
    accountingFramework: AccountingFramework;
    /** Comptes autorisés */
    accounts: AccountReference[];
    /** Types de journaux */
    journalTypes: JournalType[];
    /** Formats de numérotation */
    numberingFormats: NumberingFormat[];
}
/**
 * 🔄 États & Statuts Normés
 * Tout état spécialisé doit mapper vers un état générique.
 */
export type GenericState = 'DRAFT' | 'VALIDATED' | 'CLOSED' | 'LOCKED';
export interface DocumentState {
    /** Code de l'état */
    code: string;
    /** État générique mappé */
    mappedGenericState: GenericState;
}
export interface PeriodState {
    /** Code de l'état */
    code: PeriodStatus;
}
export interface StatesCatalog {
    /** États génériques */
    genericStates: GenericState[];
    /** États de documents */
    documentStates: DocumentState[];
    /** États de périodes */
    periodStates: PeriodState[];
}
/**
 * 👥 Rôles & Capacités
 * Aucune décision d'accès, uniquement des capacités déclarées.
 */
export type Capability = 'READ' | 'WRITE' | 'CLOSE' | 'EXPORT';
export interface Role {
    /** Code du rôle */
    roleCode: string;
    /** Libellé */
    label: string;
    /** Capacités associées */
    capabilities: Capability[];
}
export interface SoDMatrix {
    /** Matrice de séparation des responsabilités */
    [roleCode: string]: {
        /** Rôles incompatibles */
        incompatibleRoles: string[];
        /** Capacités restreintes */
        restrictedCapabilities: Capability[];
    };
}
export interface RolesCatalog {
    /** Rôles définis */
    roles: Role[];
    /** Matrice SoD */
    separationOfDuties: SoDMatrix;
}
/**
 * 📄 Catalogue des Types de Documents
 * Aucune dépendance entre documents.
 */
export type DocumentCategory = 'COMMERCIAL' | 'LOGISTIC' | 'FINANCIAL' | 'ADMIN';
export interface DocumentType {
    /** Code du type de document */
    documentTypeCode: string;
    /** Libellé */
    label: string;
    /** Catégorie */
    category: DocumentCategory;
    /** Modules autorisés à consommer ce type */
    allowedModules: string[];
    /** État générique initial */
    initialState: GenericState;
    /** Statut d'activation */
    active: boolean;
}
export interface DocumentsCatalog {
    /** Types de documents définis */
    documentTypes: DocumentType[];
}
//# sourceMappingURL=ParametersFrame.d.ts.map