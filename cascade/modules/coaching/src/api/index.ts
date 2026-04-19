import { Router } from 'express';
import { dashboardRoutes } from './routes/dashboard.routes';
import { journalRoutes } from './routes/journal.routes';
import { actionsRoutes } from './routes/actions.routes';
import { sessionsRoutes } from './routes/sessions.routes';
import { exchangesRoutes } from './routes/exchanges.routes';

export const coachingApi = Router();

coachingApi.use(dashboardRoutes);
coachingApi.use(journalRoutes);
coachingApi.use(actionsRoutes);
coachingApi.use(sessionsRoutes);
coachingApi.use(exchangesRoutes);
