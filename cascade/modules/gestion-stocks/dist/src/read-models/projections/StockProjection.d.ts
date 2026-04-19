import { StockMovementRM, StockQuantityRM } from '../types';
type StockEvent = {
    type: 'StockEntered';
    payload: StockMovementRM;
} | {
    type: 'StockExited';
    payload: StockMovementRM;
} | {
    type: 'StockAdjusted';
    payload: StockMovementRM;
} | {
    type: 'StockTransferred';
    payload: StockMovementRM;
};
export declare class StockProjection {
    private movements;
    private quantities;
    apply(event: StockEvent): void;
    private key;
    private increment;
    private decrement;
    snapshotMovements(): StockMovementRM[];
    snapshotQuantities(): StockQuantityRM[];
}
export {};
//# sourceMappingURL=StockProjection.d.ts.map