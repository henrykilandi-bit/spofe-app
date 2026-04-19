import { Router } from 'express';
import { venteRoutes } from './routes/vente.routes';
import { QuotesController } from './controllers/QuotesController';
import { OrdersController } from './controllers/OrdersController';
import { DeliveriesController } from './controllers/DeliveriesController';
import { InvoicesController } from './controllers/InvoicesController';

export function venteApi(db: any): Router {
  const quotes = new QuotesController(db);
  const orders = new OrdersController(db);
  const deliveries = new DeliveriesController(db);
  const invoices = new InvoicesController(db);

  return venteRoutes(quotes, orders, deliveries, invoices);
}
