import { InvoiceCreated } from "../../application/events/InvoiceCreated";
import { InvoiceValidated } from "../../application/events/InvoiceValidated";
export declare class InvoiceProjectionHandler {
    private readonly db;
    constructor(db: any);
    onInvoiceCreated(event: InvoiceCreated): Promise<void>;
    onInvoiceValidated(event: InvoiceValidated): Promise<void>;
}
//# sourceMappingURL=InvoiceProjectionHandler.d.ts.map