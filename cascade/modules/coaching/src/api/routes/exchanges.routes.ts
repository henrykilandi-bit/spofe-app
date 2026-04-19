import { Router } from 'express';
import { ExchangesController } from '../controllers/ExchangesController';

export const exchangesRoutes = Router();

exchangesRoutes.get(
  '/coaching/exchanges',
  ExchangesController.list
);
