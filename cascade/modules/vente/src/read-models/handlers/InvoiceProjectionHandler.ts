import { InvoiceCreated } from "../../application/events/InvoiceCreated";
import { InvoiceValidated } from "../../application/events/InvoiceValidated";

export class InvoiceProjectionHandler {
  constructor(private readonly db: any) {}

  async onInvoiceCreated(event: InvoiceCreated) {
    await this.db.insert("sales_invoices", {
      tenant_id: event.tenantId,
      invoice_id: event.invoiceId,
      order_id: event.invoiceId,
      delivery_note_id: event.invoiceId,
      status: "DRAFT",
      issued_at: event.occurredAt,
    });
  }

  async onInvoiceValidated(event: InvoiceValidated) {
    await this.db.update(
      "sales_invoices",
      { status: "VALIDATED", issued_at: event.occurredAt },
      { invoice_id: event.invoiceId }
    );
  }
}
