export interface DateRangeQuery {
  fromDate?: string;
  toDate?: string;
}

export interface CashRegisterQuery extends DateRangeQuery {
  cashRegisterId?: string;
}

export interface MovementQuery extends CashRegisterQuery {
  movementType?: "IN" | "OUT";
}