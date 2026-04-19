import { ValidateOrder } from "../commands/ValidateOrder";
export declare class ValidateOrderHandler {
    private readonly eventStore;
    constructor(eventStore: any);
    handle(command: ValidateOrder): Promise<void>;
}
//# sourceMappingURL=ValidateOrderHandler.d.ts.map