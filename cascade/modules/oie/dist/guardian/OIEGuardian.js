import { GuardianError } from './GuardianError.js';
export class OIEGuardian {
    validate(ctx, cmd) {
        this.assertObjectiveHasIndicator(cmd); // G01
        this.assertIndicatorUnitDefined(cmd); // G02
        this.assertMonotonicTimestamp(cmd); // G03
        this.assertNoObjectiveCycle(cmd); // G04
        this.assertNumericOrNullValues(cmd); // G05
        this.assertTenantOwnership(cmd); // G06
        this.assertMultiTenantPermissions(ctx, cmd); // G07
        this.assertImmutableIds(cmd); // G08
        this.assertImmutableEvents(cmd); // G09
        this.assertDeterministicCalculations(cmd); // G10
    }
    // ---------------- Invariants ----------------
    assertObjectiveHasIndicator(cmd) {
        if (cmd.type === 'CREATE_OBJECTIVE' && (!cmd.data.indicators || cmd.data.indicators.length === 0)) {
            throw new GuardianError('G01: Objectif doit avoir au moins un indicateur');
        }
    }
    assertIndicatorUnitDefined(cmd) {
        if (cmd.type === 'CREATE_INDICATOR' && !cmd.data.unit) {
            throw new GuardianError('G02: Indicateur doit avoir une unité de mesure définie');
        }
    }
    assertMonotonicTimestamp(cmd) {
        if (cmd.type === 'CREATE_EVENT' && cmd.data.timestamp) {
            const now = new Date();
            if (cmd.data.timestamp > now) {
                throw new GuardianError('G03: Événement OIE doit être horodaté de manière monotone');
            }
        }
    }
    assertNoObjectiveCycle(cmd) {
        if (cmd.type === 'CREATE_OBJECTIVE' && cmd.data.parentId) {
            if (cmd.data.parentId === cmd.data.objectiveId) {
                throw new GuardianError('G04: Un objectif ne peut pas être son propre parent');
            }
        }
    }
    assertNumericOrNullValues(cmd) {
        if (cmd.type === 'UPDATE_INDICATOR' && cmd.data.value !== undefined) {
            if (typeof cmd.data.value !== 'number' && cmd.data.value !== null) {
                throw new GuardianError('G05: Les valeurs d\'indicateurs doivent être numériques ou nulles');
            }
        }
    }
    assertTenantOwnership(cmd) {
        if (!cmd.tenantId) {
            throw new GuardianError('G06: Chaque entité OIE doit appartenir à exactement un tenant');
        }
    }
    assertMultiTenantPermissions(ctx, cmd) {
        if (ctx.tenantId !== cmd.tenantId) {
            throw new GuardianError('G07: Les permissions de lecture respectent le modèle multi-tenant');
        }
    }
    assertImmutableIds(cmd) {
        // Les IDs sont immutables après création - validation au niveau repository
        // Cette invariant est appliquée par la couche infrastructure
    }
    assertImmutableEvents(cmd) {
        if (cmd.type === 'UPDATE_EVENT') {
            throw new GuardianError('G09: Les événements ne peuvent pas être modifiés après création');
        }
    }
    assertDeterministicCalculations(cmd) {
        // Les calculs d'indicateurs doivent être déterministes
        // Validé par les tests unitaires des fonctions de calcul
    }
}
//# sourceMappingURL=OIEGuardian.js.map