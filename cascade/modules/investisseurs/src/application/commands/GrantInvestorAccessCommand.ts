export interface GrantInvestorAccessCommand {
  tenantId: string;
  actorId: string;
  actorRole: "ENTREPRENEUR" | "COACH";

  investorId: string;
  scope: string[];
}
