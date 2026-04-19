import { HttpRequest, HttpResponse } from './HttpTypes';
import { TierSummaryProjection, TierByStatusProjection, TierByRoleProjection, TierContactProjection, TierAuditProjection } from '../../read-models';
export declare class TierController {
    private readonly summary;
    private readonly byStatus;
    private readonly byRole;
    private readonly contacts;
    private readonly audit;
    constructor(summary: TierSummaryProjection, byStatus: TierByStatusProjection, byRole: TierByRoleProjection, contacts: TierContactProjection, audit: TierAuditProjection);
    getTier(req: HttpRequest): HttpResponse;
    listTiers(req: HttpRequest): HttpResponse;
    getTierContacts(req: HttpRequest): HttpResponse;
    getTierAudit(req: HttpRequest): HttpResponse;
    getTierStatus(req: HttpRequest): HttpResponse;
    tierExists(req: HttpRequest): HttpResponse;
}
//# sourceMappingURL=TierController.d.ts.map