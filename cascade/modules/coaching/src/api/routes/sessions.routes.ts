import { Router } from 'express';
import { SessionsController } from '../controllers/SessionsController';

export const sessionsRoutes = Router();

sessionsRoutes.get(
  '/coaching/sessions',
  SessionsController.list
);
