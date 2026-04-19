/**
 * TresoconsolidationController.ts
 * Controller Read-Only — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer api/controllers
 * @governance SPOFE P0
 * @guardian G-TRESO-01, G-TRESO-10
 *
 * Controller framework-agnostic exposant les endpoints GET uniquement.
 * Guardian appelé via les handlers applicatifs.
 */

import { HttpRequest, HttpResponse } from '../http/HttpTypes';
import {
  GetConsolidatedBalanceHandler,
} from '../../application/handlers/GetConsolidatedBalanceHandler';
import {
  GetBalanceBySourceHandler,
} from '../../application/handlers/GetBalanceBySourceHandler';
import {
  GetBalanceByCaisseHandler,
} from '../../application/handlers/GetBalanceByCaisseHandler';
import {
  GetBalanceByBankAccountHandler,
} from '../../application/handlers/GetBalanceByBankAccountHandler';
import {
  GetConsolidatedJournalHandler,
} from '../../application/handlers/GetConsolidatedJournalHandler';

export class TresoconsolidationController {
  constructor(
    private readonly getBalance: GetConsolidatedBalanceHandler,
    private readonly getBySource: GetBalanceBySourceHandler,
    private readonly getByCaisse: GetBalanceByCaisseHandler,
    private readonly getByBank: GetBalanceByBankAccountHandler,
    private readonly getJournal: GetConsolidatedJournalHandler
  ) {}

  /**
   * GET /api/tresoconsolidation/balance
   * Retourne le solde consolidé global
   */
  async balance(req: HttpRequest): Promise<HttpResponse> {
    const result = await this.getBalance.execute({
      tenantId: req.tenantId,
      asOf: req.query?.asOf,
    });
    return { status: 200, body: result };
  }

  /**
   * GET /api/tresoconsolidation/balance/by-source
   * Retourne la ventilation par source (CAISSE | BANQUE)
   */
  async balanceBySource(req: HttpRequest): Promise<HttpResponse> {
    const result = await this.getBySource.execute({
      tenantId: req.tenantId,
      source: req.query?.source as any,
      asOf: req.query?.asOf,
    });
    return { status: 200, body: result };
  }

  /**
   * GET /api/tresoconsolidation/balance/by-caisse
   * Retourne le détail par caisse physique
   */
  async balanceByCaisse(req: HttpRequest): Promise<HttpResponse> {
    const result = await this.getByCaisse.execute({
      tenantId: req.tenantId,
      caisseId: req.query?.caisseId,
      asOf: req.query?.asOf,
    });
    return { status: 200, body: result };
  }

  /**
   * GET /api/tresoconsolidation/balance/by-bank-account
   * Retourne le détail par compte bancaire
   */
  async balanceByBankAccount(req: HttpRequest): Promise<HttpResponse> {
    const result = await this.getByBank.execute({
      tenantId: req.tenantId,
      bankAccountId: req.query?.bankAccountId,
      asOf: req.query?.asOf,
    });
    return { status: 200, body: result };
  }

  /**
   * GET /api/tresoconsolidation/journal
   * Retourne le journal consolidé des mouvements
   */
  async journal(req: HttpRequest): Promise<HttpResponse> {
    const result = await this.getJournal.execute({
      tenantId: req.tenantId,
      fromDate: req.query?.fromDate,
      toDate: req.query?.toDate,
      source: req.query?.source as any,
      sourceId: req.query?.sourceId,
    });
    return { status: 200, body: result };
  }
}
