/**
 * 👥 RolesCatalog - Rôles & Capacités
 *
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
//# sourceMappingURL=RolesCatalog.d.ts.map