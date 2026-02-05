/**
 * Cost-Structure Repository
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Persistance append-only, aucune logique métier
 */
import { Pool } from 'pg';
import { EconomicProject } from '../domain/economic-project.aggregate';
import { ProjectStatus } from '../domain/value-objects';
export declare class CostStructureRepository {
    private readonly db;
    constructor(db: Pool);
    /**
     * Sauvegarder un projet économique (append-only)
     */
    save(project: EconomicProject): Promise<void>;
    /**
     * Sauvegarder une version de structure de coûts
     */
    private saveVersion;
    /**
     * Sauvegarder une ligne de coût
     */
    private saveCostLine;
    /**
     * Charger un projet par ID
     */
    findById(projectId: string): Promise<EconomicProject | null>;
    /**
     * Charger les versions d'un projet
     */
    private loadVersions;
    /**
     * Charger les lignes de coût d'une version
     */
    private loadCostLines;
    /**
     * Lister tous les projets d'un tenant
     */
    findByTenant(tenantId: string): Promise<Array<{
        projectId: string;
        name: string;
        status: ProjectStatus;
    }>>;
}
//# sourceMappingURL=cost-structure.repository.d.ts.map