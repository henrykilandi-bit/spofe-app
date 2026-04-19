/**
 * ConsolidatedTreasuryJournal.ts
 * Projection — Journal consolidé des mouvements
 *
 * @module tresoconsolidation
 * @layer read-models/projections
 * @governance SPOFE P0
 * @guardian G-TRESO-05, G-TRESO-07, G-TRESO-08
 *
 * Concaténation + tri chronologique déterministe.
 * Marquage source explicite (CAISSE | BANQUE).
 */

import { CaisseJournalRM } from '../ports/CaisseReadModelPort';
import { BanqueJournalRM } from '../ports/BanqueReadModelPort';

export interface ConsolidatedTreasuryJournalRM {
  movementId: string;
  date: string;
  source: 'CAISSE' | 'BANQUE';
  sourceId: string;
  libelle: string;
  montant: number;
  devise: string;
  referenceExterne?: string;
  createdAt: string;
}

export const computeConsolidatedJournal = (
  caisse: CaisseJournalRM[],
  banque: BanqueJournalRM[]
): ConsolidatedTreasuryJournalRM[] =>
  [
    ...caisse.map(m => ({
      movementId: m.movementId,
      date: m.date,
      source: 'CAISSE' as const,
      sourceId: m.movementId,
      libelle: m.libelle,
      montant: m.montant,
      devise: m.devise,
      referenceExterne: m.referenceExterne,
      createdAt: m.createdAt,
    })),
    ...banque.map(m => ({
      movementId: m.movementId,
      date: m.date,
      source: 'BANQUE' as const,
      sourceId: m.movementId,
      libelle: m.libelle,
      montant: m.montant,
      devise: m.devise,
      referenceExterne: m.referenceExterne,
      createdAt: m.createdAt,
    })),
  ].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
