/**
 * 💰 MonetaryContext - Référentiels Monétaires & Fiscaux
 *
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
//# sourceMappingURL=MonetaryContext.d.ts.map