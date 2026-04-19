# COMMANDS & EVENTS — MODULE VENTE v1.0.0

## PRINCIPES

- Les commandes créent des documents
- Les événements constatent des faits
- Aucun événement ne déclenche de calcul
- Aucun événement n'écrit dans un autre module

---

## COMMANDS

### CreateQuote
### ValidateQuote
### CreateOrder
### ValidateOrder
### CreateDeliveryNote
### ValidateDeliveryNote
### CreateInvoice
### ValidateInvoice

---

## EVENTS

### QuoteCreated
### QuoteValidated
### OrderCreated
### OrderValidated
### DeliveryNoteCreated
### DeliveryNoteValidated
### InvoiceCreated
### InvoiceValidated

---

## CONTRAINTE FONDAMENTALE

Aucun événement Vente ne :
- calcule un montant
- calcule une taxe
- déclenche une décision automatique
