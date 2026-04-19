# @spofe/kernel-events

**Standard canonique SPOFE pour les événements métier.**

## 🔒 Règles OBLIGATOIRES

1. **Tout Event métier DOIT implémenter `DomainEvent`**
2. **INTERDIT de créer des Events sans `createDomainEvent()`**
3. **Toute redéfinition locale invalide le BUILD_PROOF**

## ✅ Usage correct

```typescript
import { createDomainEvent, DomainEvent } from '@spofe/kernel-events';

// Payload typé
export interface AssetCreatedPayload {
  assetCode: string;
  label: string;
  acquisitionDate: Date;
}

// Factory Event
export const createAssetCreatedEvent = (
  params: {
    assetId: string;
    tenantId: string;
    actorId: string;
    payload: AssetCreatedPayload;
  }
): DomainEvent<AssetCreatedPayload> => 
  createDomainEvent({
    eventType: 'IMMOBILISATION_ASSET_CREATED',
    aggregateId: params.assetId,
    tenantId: params.tenantId,
    actorId: params.actorId,
    payload: params.payload,
  });
```

## ❌ Interdit

```typescript
// JAMAIS ça :
interface CustomEvent {
  assetId: string;
  createdAt: Date; // ❌ manque metadata
}
```