import { DeliveryNoteCreated } from "../../application/events/DeliveryNoteCreated";
import { DeliveryNoteValidated } from "../../application/events/DeliveryNoteValidated";
export declare class DeliveryProjectionHandler {
    private readonly db;
    constructor(db: any);
    onDeliveryNoteCreated(event: DeliveryNoteCreated): Promise<void>;
    onDeliveryNoteValidated(event: DeliveryNoteValidated): Promise<void>;
}
//# sourceMappingURL=DeliveryProjectionHandler.d.ts.map