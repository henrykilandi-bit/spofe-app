/**
 * SPOFE HTTP API — Create Aggregate Route
 *
 * Purpose: Accept HTTP request → Execute Command → Return result
 *
 * CRITICAL PROPERTIES:
 * ✅ Does NOT validate business logic
 * ✅ Does NOT catch Guardian decisions
 * ✅ Does NOT access DB directly
 * ✅ Does NOT mutate state outside Command
 * ✅ Does NOT contain any branching logic
 *
 * Pipeline is SIMPLE:
 * 1. HTTP POST /aggregates
 * 2. Fastify validates DTO (shape only)
 * 3. Route passes to Command
 * 4. Command calls TransactionManager
 * 5. TM calls Guardian
 * 6. If Guardian rejects: exception rises
 * 7. ErrorHandler maps to HTTP status
 * 8. Response sent
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateAggregateDto } from '../dto/CreateAggregate.dto';
import { CreateAggregateCommand } from '../../application/commands/CreateAggregateCommand';

/**
 * POST /aggregates
 *
 * Request body (validated by Fastify using DTO):
 * {
 *   "aggregateId": "550e8400-e29b-41d4-a716-446655440000",
 *   "initialData": { "name": "Test", "value": 42 },
 *   "actorRole": "SYSTEM"
 * }
 *
 * Success response (201):
 * {
 *   "status": "CREATED",
 *   "aggregateId": "550e8400-e29b-41d4-a716-446655440000",
 *   "timestamp": "2026-01-30T10:30:00Z"
 * }
 *
 * Guardian rejection (409):
 * {
 *   "status": "DECISION_REJECTED",
 *   "message": "Guardian v4 rejected this decision",
 *   "reason": "Process 'CREATE_AGGREGATE' not found in registry"
 * }
 *
 * DTO invalid (400):
 * {
 *   "status": "VALIDATION_ERROR",
 *   "message": "Request body structure is invalid",
 *   "errors": [...]
 * }
 */
export async function createAggregateRoute(
  app: FastifyInstance,
  createAggregateCommand: CreateAggregateCommand
) {
  app.post<{ Body: CreateAggregateDto }>(
    '/aggregates',
    {
      // Fastify will validate request.body against CreateAggregateDto
      // If validation fails: 400 automatically
      schema: {
        description: 'Create a new aggregate',
        body: CreateAggregateDto,
        response: {
          201: {
            description: 'Aggregate created successfully',
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['CREATED'] },
              aggregateId: { type: 'string', format: 'uuid' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
          400: {
            description: 'Invalid request structure',
          },
          409: {
            description: 'Guardian rejected the decision',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateAggregateDto }>, reply: FastifyReply) => {
      // At this point:
      // ✅ request.body is guaranteed valid (Fastify already validated)
      // ✅ No business logic validation here
      // ✅ No DB access

      const input = request.body;

      try {
        // Execute command
        // The command is responsible for:
        // - Calling TransactionManager
        // - Which calls Guardian
        // - If Guardian rejects: exception is thrown
        // - We let it bubble up to errorHandler
        await createAggregateCommand.execute({
          aggregateId: input.aggregateId,
          initialData: input.initialData,
          actorRole: input.actorRole,
          processName: input.processName || 'CREATE_AGGREGATE',
        });

        // Command succeeded = Guardian accepted + DB committed atomically
        return reply.code(201).send({
          status: 'CREATED',
          aggregateId: input.aggregateId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        // CRITICAL: We do NOT catch Guardian exceptions here
        // We let them propagate to registerErrorHandler()
        // which maps them to 409 Conflict
        throw err;
      }
    }
  );
}

/**
 * GET /aggregates/:aggregateId
 *
 * Retrieve an aggregate (read-only, no Command needed)
 *
 * Note: This is a QUERY, not a DECISION
 * Queries:
 * - Don't require Guardian validation
 * - Don't mutate state
 * - Can be cached
 * - Can fail safely (just return 404)
 */
export async function getAggregateRoute(app: FastifyInstance, queryService: any) {
  app.get<{ Params: { aggregateId: string } }>(
    '/aggregates/:aggregateId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            aggregateId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request, reply) => {
      const { aggregateId } = request.params;

      try {
        // Query (not a Command)
        const aggregate = await queryService.getAggregate(aggregateId);

        if (!aggregate) {
          return reply.code(404).send({
            status: 'NOT_FOUND',
            message: `Aggregate ${aggregateId} not found`,
          });
        }

        return reply.code(200).send({
          status: 'OK',
          data: aggregate,
        });
      } catch (err) {
        throw err;
      }
    }
  );
}

/**
 * UPDATE /aggregates/:aggregateId
 *
 * Similar to CREATE, but for updating
 */
export async function updateAggregateRoute(
  app: FastifyInstance,
  updateAggregateCommand: any // Your UpdateAggregateCommand
) {
  app.put<{ Params: { aggregateId: string }; Body: any }>(
    '/aggregates/:aggregateId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            aggregateId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            updatedData: { type: 'object' },
            actorRole: { type: 'string', enum: ['SYSTEM', 'ADMIN', 'USER'] },
          },
          required: ['updatedData', 'actorRole'],
        },
      },
    },
    async (request, reply) => {
      const { aggregateId } = request.params;
      const { updatedData, actorRole } = request.body;

      try {
        await updateAggregateCommand.execute({
          aggregateId,
          updatedData,
          actorRole,
          processName: 'UPDATE_AGGREGATE',
        });

        return reply.code(200).send({
          status: 'UPDATED',
          aggregateId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        throw err; // Let errorHandler deal with it
      }
    }
  );
}
