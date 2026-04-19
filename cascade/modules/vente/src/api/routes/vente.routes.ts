import { Router } from 'express';
import { QuotesController } from '../controllers/QuotesController';
import { OrdersController } from '../controllers/OrdersController';
import { DeliveriesController } from '../controllers/DeliveriesController';
import { InvoicesController } from '../controllers/InvoicesController';

export function venteRoutes(
  quotes: QuotesController,
  orders: OrdersController,
  deliveries: DeliveriesController,
  invoices: InvoicesController
) {
  const router = Router();

  // GET /vente/devis
  router.get('/devis', quotes.getQuotes.bind(quotes));

  // GET /vente/commandes
  router.get('/commandes', orders.getOrders.bind(orders));

  // GET /vente/livraisons
  router.get('/livraisons', deliveries.getDeliveries.bind(deliveries));

  // GET /vente/factures
  router.get('/factures', invoices.getInvoices.bind(invoices));

  return router;
}
