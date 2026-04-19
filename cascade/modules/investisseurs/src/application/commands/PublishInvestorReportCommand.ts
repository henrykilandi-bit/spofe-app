export interface PublishInvestorReportCommand {
  tenantId: string;
  actorId: string;
  actorRole: "ENTREPRENEUR" | "COACH";

  reportId: string;
  period: string;
  documentStatus: "VALIDATED";
}
