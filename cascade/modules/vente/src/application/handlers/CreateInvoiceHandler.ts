import { VenteGuardian } from "../../guardian/VenteGuardian";
import { CreateInvoice } from "../commands/CreateInvoice";
import { InvoiceCreated } from "../events/InvoiceCreated";

export class CreateInvoiceHandler {
  constructor(private readonly eventStore: any) {}

  async handle(command: CreateInvoice): Promise<void> {
    VenteGuardian.guardCreateInvoice(command);

    const event: InvoiceCreated = {
      eventType: "InvoiceCreated",
      tenantId: command.tenantId,
      invoiceId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
    };

    await this.eventStore.append(event);
  }
}
