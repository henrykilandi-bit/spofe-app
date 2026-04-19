import { CreateInvoice } from "../commands/CreateInvoice";
export declare class CreateInvoiceHandler {
    private readonly eventStore;
    constructor(eventStore: any);
    handle(command: CreateInvoice): Promise<void>;
}
//# sourceMappingURL=CreateInvoiceHandler.d.ts.map