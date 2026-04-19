import {
  CashJournalView,
  CashRegisterStateView,
  CashSessionHistoryView,
  CashMovementHistoryView,
  CashDiscrepancyView
} from "../../read-models";

export interface CashReadRepositoryPort {
  getJournal(params: any): Promise<CashJournalView[]>;
  getState(cashRegisterId: string): Promise<CashRegisterStateView | null>;
  getSessions(params: any): Promise<CashSessionHistoryView[]>;
  getMovements(params: any): Promise<CashMovementHistoryView[]>;
  getDiscrepancies(params: any): Promise<CashDiscrepancyView[]>;
}