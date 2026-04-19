import { CreateOrder } from "../commands/CreateOrder";
export declare class CreateOrderHandler {
    private readonly eventStore;
    constructor(eventStore: any);
    handle(command: CreateOrder): Promise<void>;
}
//# sourceMappingURL=CreateOrderHandler.d.ts.map