import { QuoteCreated } from "../../application/events/QuoteCreated";
import { QuoteValidated } from "../../application/events/QuoteValidated";
export declare class QuoteProjectionHandler {
    private readonly db;
    constructor(db: any);
    onQuoteCreated(event: QuoteCreated): Promise<void>;
    onQuoteValidated(event: QuoteValidated): Promise<void>;
}
//# sourceMappingURL=QuoteProjectionHandler.d.ts.map