export interface CashRegisterRepositoryPort {
  exists(cashRegisterId: string): Promise<boolean>;
  isOpen(cashRegisterId: string): Promise<boolean>;
  hasActiveOpening(cashRegisterId: string): Promise<boolean>;
  isPeriodLocked(cashRegisterId: string): Promise<boolean>;
}