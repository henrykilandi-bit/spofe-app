import express from 'express';
import request from 'supertest';

import { CoachingGuardian } from '../../src/guardian/CoachingGuardian';
import {
  CreateCoachingActionHandler,
  PlanCoachingSessionHandler,
  AddCoachingJournalEntryHandler,
  AddCoachingExchangeHandler,
} from '../../src/application';

import {
  CoachingActionPlanProjection,
  CoachingSessionProjection,
  CoachingJournalProjection,
  CoachingExchangeProjection,
} from '../../src/read-models';

import { coachingApi } from '../../src/api';

export function createTestApp() {
  const guardian = new CoachingGuardian();

  // Handlers
  const createAction = new CreateCoachingActionHandler(guardian);
  const planSession = new PlanCoachingSessionHandler(guardian);
  const addJournal = new AddCoachingJournalEntryHandler(guardian);
  const addExchange = new AddCoachingExchangeHandler(guardian);

  // Read stores (in-memory)
  const actions: any[] = [];
  const sessions: any[] = [];
  const journal: any[] = [];
  const exchanges: any[] = [];

  // Projections
  const actionProjection = new CoachingActionPlanProjection();
  const sessionProjection = new CoachingSessionProjection();
  const journalProjection = new CoachingJournalProjection();
  const exchangeProjection = new CoachingExchangeProjection();

  // Fake command bus
  return {
    app: (() => {
      const app = express();
      app.use(coachingApi);
      return app;
    })(),

    commands: {
      createAction: (cmd: any) => {
        const evt = createAction.handle(cmd);
        actions.push(actionProjection.apply(evt));
      },
      planSession: (cmd: any) => {
        const evt = planSession.handle(cmd);
        sessions.push(sessionProjection.apply(evt));
      },
      addJournal: (cmd: any) => {
        const evt = addJournal.handle(cmd);
        journal.push(journalProjection.apply(evt));
      },
      addExchange: (cmd: any) => {
        const evt = addExchange.handle(cmd);
        exchanges.push(exchangeProjection.apply(evt));
      },
    },

    stores: {
      actions,
      sessions,
      journal,
      exchanges,
    },

    request: (app: any) => request(app),
  };
}
