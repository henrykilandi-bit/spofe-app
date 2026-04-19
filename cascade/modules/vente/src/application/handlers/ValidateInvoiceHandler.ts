import { VenteGuardian } from "../../guardian/VenteGuardian";
import { ValidateInvoice } from "../commands/ValidateInvoice";
import { InvoiceValidated } from "../events/InvoiceValidated";

export class ValidateInvoiceHandler {
  constructor(private readonly eventStore: any) {}

  async handle(command: ValidateInvoice): Promise<void> {
    VenteGuardian.guardValidateInvoice({
      invoiceStatus: command.currentStatus,
      actor: command.actor,
    });

    const event: InvoiceValidated = {
      eventType: "InvoiceValidated",
      tenantId: command.actor.tenantId,
      invoiceId: command.invoiceId,
      occurredAt: new Date().toISOString(),
    };

    await this.eventStore.append(event);
  }
}
