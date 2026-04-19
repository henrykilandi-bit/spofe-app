export interface RevokeInvestorAccessCommand {
  tenantId: string;
  actorId: string;
  actorRole: "ENTREPRENEUR" | "COACH";

  investorId: string;
  reason: string;
}
