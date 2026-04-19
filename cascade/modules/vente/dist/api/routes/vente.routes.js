import { Router } from 'express';
export function venteRoutes(quotes, orders, deliveries, invoices) {
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
//# sourceMappingURL=vente.routes.js.map