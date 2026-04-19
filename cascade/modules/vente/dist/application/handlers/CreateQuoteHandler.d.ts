import { CreateQuote } from "../commands/CreateQuote";
export declare class CreateQuoteHandler {
    private readonly eventStore;
    constructor(eventStore: any);
    handle(command: CreateQuote): Promise<void>;
}
//# sourceMappingURL=CreateQuoteHandler.d.ts.map