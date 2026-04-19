# READ MODELS — MODULE VENTE v1.0.0

## PRINCIPES

Les read-models du module Vente sont des projections
documentaires en lecture seule.

Ils ne contiennent aucun calcul économique.

---

## READ MODELS EXPOSÉS

### SalesQuoteRM
- tenantId
- quoteId
- customerId
- status
- createdAt
- validatedAt

### SalesOrderRM
- tenantId
- orderId
- quoteId
- customerId
- status
- createdAt
- validatedAt

### DeliveryNoteRM
- tenantId
- deliveryNoteId
- orderId
- status
- deliveredAt

### SalesInvoiceRM
- tenantId
- invoiceId
- orderId
- deliveryNoteId
- status
- issuedAt

---

## RÈGLES D'EXPOSITION

- Lecture seule
- Append-only
- Isolation stricte par tenant
- Aucune agrégation économique
