# Module Budgeting - Guardian Definition

## Module Name: budgeting

## Version: 2.1.0

## Guardian Purpose
This module's Guardian enforces budgeting business rules, data integrity constraints, and system invariants to ensure reliable budget management within the SPOFE constitutional framework.

## INVARIANTS

- BG01 : Isolation stricte par tenant
- BG02 : Scénario budgétaire unique actif
- BG03 : Lignes budgétaires cohérentes
- BG04 : Période valide
- BG05 : Révision versionée
- BG06 : Append-only strict
- BG07 : Validation acteur SPOFE
- BG08 : Cohérence catégorielle
- BG09 : Budget total amount must be greater than zero
- BG10 : Budget allocation sum cannot exceed total budget amount
- BG11 : Budget period must be valid (start date < end date)
- BG12 : Budget status must follow valid state transitions
- BG13 : Active budgets cannot overlap for the same organizational unit
- BG14 : Budget name must be unique within the same fiscal year
- BG15 : Budget owner must be a valid user with appropriate permissions
- BG16 : Budget currency must match organizational base currency
- BG17 : Budget allocations must reference valid cost centers
- BG18 : Budget revisions must maintain audit trail with reasons
- BG19 : Budget variance calculations must be mathematically consistent
- BG20 : Budget approval workflow must respect authorization limits
- BG21 : Budget actuals must be sourced from comptabilité module only
- BG22 : Budget transfers between allocations must be authorized and logged
- BG23 : Budget closure requires all pending transactions to be resolved
- BG24 : Dependencies on parametres module must be available before operations
- BG25 : Communication with comptabilité module must be resilient and consistent

## Guardian Enforcement
The BudgetingGuardian class implements these invariants through:
- Pre-condition validation before command execution
- Post-condition verification after state changes
- Cross-module consistency checks during integration
- Continuous monitoring of data integrity
- Automated rollback mechanisms for constraint violations

## Constitutional Compliance
This Guardian operates within SPOFE's constitutional framework, ensuring that all budgeting operations respect system-wide governance principles and maintain financial data integrity across module boundaries.