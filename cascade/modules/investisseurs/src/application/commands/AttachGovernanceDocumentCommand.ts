export interface AttachGovernanceDocumentCommand {
  tenantId: string;
  actorId: string;
  actorRole: "ENTREPRENEUR" | "COACH";

  documentId: string;
  documentType: "AG_PV" | "RESOLUTION" | "CONVOCATION";
  documentStatus: "VALIDATED";
}
