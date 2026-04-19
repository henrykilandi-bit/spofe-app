# PRÉCOMPTABILITÉ — COMMANDS & EVENTS v1.0.0

## COMMANDS (WRITE)

| Command | Description |
| ------- | ----------- |
| CreateDocument | Création d'un document |
| UpdateDocumentMetadata | Enrichissement factuel |
| SubmitForValidation | Soumission à validation |
| ValidateDocument | Validation du document |
| RejectDocument | Rejet du document |
| SuspendDocument | Mise en litige |

## EVENTS (FACTS DOCUMENTAIRES)

| Event | Description |
| ----- | ----------- |
| DocumentCreated | Document capturé |
| DocumentMetadataUpdated | Métadonnées enrichies |
| DocumentSubmitted | Soumis à validation |
| DocumentValidated | Document validé |
| DocumentRejected | Document rejeté |
| DocumentSuspended | Document suspendu |

## RÈGLES

- Événements factuels uniquement
- Aucun événement comptable
- Aucun événement fiscal
- Append-only strict
