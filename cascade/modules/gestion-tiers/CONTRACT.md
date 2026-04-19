# CONTRACT MODULE GESTION-TIERS

## Objet du contrat

Le présent contrat définit les engagements techniques et fonctionnels du module **Gestion-Tiers** dans l'écosystème SPOFE.

## Engagements techniques

### Architecture
- **Respect strict** de l'architecture SPOFE en couches
- **Séparation** Domain / Application / Infrastructure
- **Isolation** des invariants dans le Guardian Layer
- **Abstraction** des dépendances externes

### Performance
- **Latence** : < 100ms pour les commandes simples
- **Throughput** : Support de 1000 operations/sec minimum
- **Disponibilité** : 99.9% (hors maintenance planifiée)

### Qualité
- **Couverture tests** : > 90% pour le Guardian Layer
- **Documentation** : API contracts à jour
- **Monitoring** : Métriques exposées pour observabilité

## Conformité réglementaire

Le présent contrat est établi conformément à la gouvernance SPOFE P0.

Il est expressément convenu que :
- le module est **référentiel-agnostique** dans son core,
- toute interprétation comptable relève de modules dédiés,
- le référentiel comptable par défaut de SPOFE est **OHADA**.

Référence :
`CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md`

## Garanties fonctionnelles

### Invariants métier
- **G01-G10** : Validation stricte selon Guardian Pattern
- **Immutabilité** : Événements non modifiables une fois persistés
- **Consistance** : État cohérent garanti par les invariants

### Évolutivité
- **Backward compatibility** : Préservée pour les versions mineures
- **Extension points** : APIs stables pour adaptations futures
- **Migration** : Scripts fournis pour montées de version

## Interfaces contractuelles

### API Commands
```typescript
interface TierCommands {
  createTier(command: CreateTierCommand): Promise<TierCreatedEvent>;
  updateTier(command: UpdateTierCommand): Promise<TierUpdatedEvent>;
  changeTierStatus(command: ChangeTierStatusCommand): Promise<TierStatusChangedEvent>;
}
```

### API Queries
```typescript
interface TierQueries {
  getTierById(id: TierId): Promise<TierSummaryView>;
  searchTiers(criteria: TierSearchCriteria): Promise<TierSummaryView[]>;
}
```

## Responsabilités

### Du module
- Maintenir la cohérence des données tiers
- Exposer des APIs stables et documentées
- Respecter les invariants Guardian
- Fournir des métriques de monitoring

### Du consommateur
- Respecter les contrats d'interface
- Gérer la logique métier spécifique dans sa couche
- Ne pas contourner les invariants Guardian

## Limitations et exclusions

### Non couvert par ce module :
- **Comptabilité** : Écritures automatiques vers un grand livre
- **Workflow** : Processus d'approbation multi-niveaux
- **Integration** : Synchronisation avec systèmes externes
- **Reporting** : Génération de rapports comptables réglementaires

## Conditions de résiliation

Ce contrat peut être renégocié en cas de :
- Évolution majeure de l'architecture SPOFE
- Changement dans la gouvernance P0
- Migration vers une version majeure incompatible

Toute modification nécessite :
- Validation par l'architecture SPOFE
- Mise à jour de la documentation contractuelle
- Plan de migration pour les consommateurs existants

---

**Version contrat :** 1.0  
**Date d'entrée en vigueur :** 2026-02-03  
**Signataire technique :** Architecture SPOFE  
**Révision suivante :** 2026-08-03 (ou évolution P0)