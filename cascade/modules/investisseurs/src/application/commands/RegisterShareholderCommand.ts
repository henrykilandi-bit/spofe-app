export interface RegisterShareholderCommand {
  tenantId: string;
  actorId: string;
  actorRole: "ENTREPRENEUR" | "COACH" | "SYSTEM";

  shareholderId: string;
  name: string;
  shares: number;
  percentage: number;
}
