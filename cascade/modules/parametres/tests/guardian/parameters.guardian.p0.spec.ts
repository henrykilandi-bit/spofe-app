import { ParametersGuardian } from '../../src/guardian/ParametersGuardian';
import { GuardianViolation } from '../../src/shared/errors';
import { ParametersFrame } from '../../src/guardian/types/ParametersFrame';
import { validParametersFrame } from './fixtures/validParametersFrame';

describe('Guardian Paramètres — P0', () => {

  /* =========================================================
     A. Cadre & versioning
     ========================================================= */

  test('P0-A01 — accepte un ParametersFrame valide', () => {
    expect(() =>
      ParametersGuardian.validateNewFrame([], validParametersFrame())
    ).not.toThrow();
  });

  test('P0-A02 — refuse un frame incomplet', () => {
    const frame = validParametersFrame();
    delete (frame as any).version;

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-A03 — refuse deux frames ACTIVE', () => {
    const existing = [validParametersFrame()];
    const candidate = validParametersFrame();

    expect(() =>
      ParametersGuardian.validateNewFrame(existing, candidate)
    ).toThrow(GuardianViolation);
  });

  test('P0-A04 — interdit toute mutation (append-only)', () => {
    expect(() =>
      ParametersGuardian.validateNewFrame([], validParametersFrame())
    ).not.toThrow();
  });

  test('P0-A05 — version obligatoire', () => {
    const frame = validParametersFrame();
    frame.version = '';

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  /* =========================================================
     B. Passivité absolue
     ========================================================= */

  test('P0-B01 — refuse logique conditionnelle', () => {
    const frame = validParametersFrame();
    (frame as any).rule = 'if x then y';

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-B02 — refuse calcul', () => {
    const frame = validParametersFrame();
    (frame as any).calculate = 'a + b';

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-B03 — refuse déclenchement automatique', () => {
    const frame = validParametersFrame();
    (frame as any).trigger = 'onSave';

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  /* =========================================================
     C. États & statuts normés
     ========================================================= */

  test('P0-C01 — états génériques obligatoires', () => {
    const frame = validParametersFrame();
    frame.statesCatalog.genericStates = [];

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-C02 — mapping état document → générique requis', () => {
    const frame = validParametersFrame();
    frame.statesCatalog.documentStates[0].mappedGenericState = 'VALIDATED';

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-C03 — états de période normés', () => {
    const frame = validParametersFrame();
    frame.statesCatalog.periodStates.push({ code: 'INVALID' } as any);

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-C04 — LOCKED est terminal', () => {
    const frame = validParametersFrame();
    frame.statesCatalog.periodStates = [{ code: 'LOCKED' } as any];

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).not.toThrow();
  });

  /* =========================================================
     D. Catalogue des types de documents
     ========================================================= */

  test('P0-D01 — DocumentType valide accepté', () => {
    expect(() =>
      ParametersGuardian.validateNewFrame([], validParametersFrame())
    ).not.toThrow();
  });

  test('P0-D02 — document sans catégorie refusé', () => {
    const frame = validParametersFrame();
    delete (frame.documentsCatalog.documentTypes[0] as any).category;

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-D03 — dépendance entre documents interdite', () => {
    const frame = validParametersFrame();
    (frame.documentsCatalog.documentTypes[0] as any).dependsOn = 'OTHER';

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-D04 — règle documentaire interdite', () => {
    const frame = validParametersFrame();
    (frame.documentsCatalog.documentTypes[0] as any).mandatory = true;

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-D05 — activation/désactivation autorisée', () => {
    const frame = validParametersFrame();
    frame.documentsCatalog.documentTypes[0].active = false;

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).not.toThrow();
  });

  /* =========================================================
     E. Rôles & capacités
     ========================================================= */

  test('P0-E01 — rôles avec capacités reconnues', () => {
    expect(() =>
      ParametersGuardian.validateNewFrame([], validParametersFrame())
    ).not.toThrow();
  });

  test('P0-E02 — capacité inconnue refusée', () => {
    const frame = validParametersFrame();
    frame.rolesCatalog.roles[0].capabilities.push('DELETE' as any);

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-E03 — SoD déclaratif accepté', () => {
    expect(() =>
      ParametersGuardian.validateNewFrame([], validParametersFrame())
    ).not.toThrow();
  });

  test('P0-E04 — décision d\'accès interdite', () => {
    const frame = validParametersFrame();
    (frame.rolesCatalog as any).rule = 'if role=ADMIN then access';

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  /* =========================================================
     F. Monétaire & fiscal
     ========================================================= */

  test('P0-F01 — devise ISO valide acceptée', () => {
    expect(() =>
      ParametersGuardian.validateNewFrame([], validParametersFrame())
    ).not.toThrow();
  });

  test('P0-F02 — taux calculé refusé', () => {
    const frame = validParametersFrame();
    (frame.monetaryContext.taxRates[0] as any).formula = 'x * 0.2';

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-F03 — devise inactive comme référence refusée', () => {
    const frame = validParametersFrame();
    frame.monetaryContext.currencies[0].active = false;

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  /* =========================================================
     G. Neutralité & indépendance
     ========================================================= */

  test('P0-G01 — paramètre spécifique à un module refusé', () => {
    const frame = validParametersFrame();
    (frame as any).onlyForStock = true;

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-G02 — dépendance temporelle refusée', () => {
    const frame = validParametersFrame();
    (frame as any).now = Date.now();

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  /* =========================================================
     H. Auditabilité
     ========================================================= */

  test('P0-H01 — traçabilité requise', () => {
    const frame = validParametersFrame();
    frame.frameId = '';

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

  test('P0-H02 — lisibilité sans contexte', () => {
    const frame = validParametersFrame();
    (frame as any).opaque = {};

    expect(() =>
      ParametersGuardian.validateNewFrame([], frame)
    ).toThrow(GuardianViolation);
  });

});
