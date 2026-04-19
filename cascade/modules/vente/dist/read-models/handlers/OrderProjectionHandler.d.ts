import { OrderCreated } from "../../application/events/OrderCreated";
import { OrderValidated } from "../../application/events/OrderValidated";
export declare class OrderProjectionHandler {
    private readonly db;
    constructor(db: any);
    onOrderCreated(event: OrderCreated): Promise<void>;
    onOrderValidated(event: OrderValidated): Promise<void>;
}
//# sourceMappingURL=OrderProjectionHandler.d.ts.map