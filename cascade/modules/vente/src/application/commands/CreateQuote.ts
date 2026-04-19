export interface CreateQuote {
  tenantId: string;
  source: "SPOFE_INTERNAL";
  actor: {
    actorId: string;
    tenantId: string;
  };
}
