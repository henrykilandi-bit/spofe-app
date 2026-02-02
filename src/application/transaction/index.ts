// ==================================================================================
// SPOFE Transaction — Index (public API)
// ==================================================================================
// Exporte les types et classes publiques du module transaction
// ==================================================================================

// TransactionManager — Orchestrateur principal
export {
  TransactionManager,
  type ExecuteDecisionInput,
  type ExecuteDecisionResult,
  GuardianViolationError,
  ValidationError,
  DatabaseError,
} from './TransactionManager';

// GuardianPort — Interface de validation
export {
  type GuardianPort,
  type GuardianVerdict,
  type GuardianValidationInput,
  VIOLATION_CODES,
  type ViolationCode,
  StubGuardianPort,
} from './GuardianPort';

// DbClient — Interface d'accès DB
export {
  type DbClient,
  type DecisionData,
  type EventData,
  type FactData,
  type AuditData,
  isValidDecisionData,
  isValidEventData,
  isValidFactData,
  isValidAuditData,
} from './DbClient';
