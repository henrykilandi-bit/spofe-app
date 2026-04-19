import { Router } from 'express';
import { ActionsController } from '../controllers/ActionsController';

export const actionsRoutes = Router();

actionsRoutes.get(
  '/coaching/actions',
  ActionsController.list
);
