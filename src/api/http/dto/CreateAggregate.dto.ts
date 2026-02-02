/**
 * SPOFE HTTP API — DTO Validation Layer
 *
 * Purpose: Validate STRUCTURE ONLY (shape of data)
 * NOT: Business logic validation
 *
 * Rule: DTOs are NOT Commands
 *       DTOs validate shape
 *       Commands validate intent + permissions
 */

import { Type, Static } from '@sinclair/typebox';

/**
 * CreateAggregateDto
 *
 * Validates:
 * ✅ aggregateId is valid UUID
 * ✅ initialData is an object
 * ✅ actorRole is one of allowed roles
 *
 * Does NOT validate:
 * ❌ Process exists
 * ❌ Role is authorized for this process
 * ❌ Business rules
 * ❌ Atomic consistency
 *
 * Why? Because that's Guardian's job.
 */
export const CreateAggregateDto = Type.Object(
  {
    aggregateId: Type.String({
      description: 'Unique identifier for the aggregate (UUID)',
      format: 'uuid',
    }),

    initialData: Type.Record(Type.String(), Type.Unknown(), {
      description: 'Initial state data (any JSON object)',
    }),

    actorRole: Type.Union([Type.Literal('SYSTEM'), Type.Literal('ADMIN'), Type.Literal('USER')], {
      description: 'Role of the actor executing this command',
    }),

    processName: Type.Optional(
      Type.String({
        description: 'Optional: name of process (defaults to CREATE_AGGREGATE)',
      })
    ),
  },
  {
    title: 'CreateAggregateDto',
    description: 'HTTP request body for creating an aggregate',
  }
);

/**
 * Extract TypeScript type from schema
 */
export type CreateAggregateDto = Static<typeof CreateAggregateDto>;

/**
 * UpdateAggregateDto
 */
export const UpdateAggregateDto = Type.Object(
  {
    aggregateId: Type.String({ format: 'uuid' }),
    updatedData: Type.Record(Type.String(), Type.Unknown()),
    actorRole: Type.Union([Type.Literal('SYSTEM'), Type.Literal('ADMIN'), Type.Literal('USER')]),
  },
  {
    title: 'UpdateAggregateDto',
  }
);

export type UpdateAggregateDto = Static<typeof UpdateAggregateDto>;

/**
 * QueryAggregateDto
 */
export const QueryAggregateDto = Type.Object(
  {
    aggregateId: Type.String({ format: 'uuid' }),
    actorRole: Type.Union([Type.Literal('SYSTEM'), Type.Literal('ADMIN'), Type.Literal('USER')]),
  },
  {
    title: 'QueryAggregateDto',
  }
);

export type QueryAggregateDto = Static<typeof QueryAggregateDto>;
