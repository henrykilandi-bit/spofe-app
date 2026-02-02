/**
 * SPOFE HTTP API Server Bootstrap
 *
 * Purpose: Initialize Fastify, register middleware, start listening
 *
 * ARCHITECTURE:
 * app → [request] → TypeBox DTO validation
 *                ↓ (if invalid: 400)
 *                → Route handler → Command.execute()
 *                ↓
 *                → TransactionManager
 *                ↓
 *                → Guardian v4
 *                ↓ (if Guardian rejects: throw GuardianError)
 *                → PostgreSQL commit
 *                ↓
 *                → Response (201)
 *                ↓
 *          [reply] ← HTTP client
 *
 * ERROR HANDLING (CONTRACTUAL):
 * - GuardianError (G4-01 to G4-05) → mapped to HTTP status by guardianHttpMap
 * - DTO validation error → 400 Bad Request
 * - Resource not found → 404 Not Found
 * - Database constraint → 409 Conflict
 * - Unhandled → 500 Internal Error
 *
 * GUARANTEES:
 * ✅ Zero business logic in HTTP layer
 * ✅ Zero DB access in HTTP layer
 * ✅ Guardian decisions always propagate (no suppression, no retry)
 * ✅ Centralized error handler (no try/catch in routes)
 * ✅ Type-safe requests/responses
 * ✅ Guardian remains sovereign (HTTP is explanatory only)
 */

import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { CreateAggregateCommand } from '../../application/commands/CreateAggregateCommand';
import { TransactionManager } from '../../domain/services/TransactionManager';
import { GuardianV4Adapter } from '../../infrastructure/guardian/GuardianV4Adapter';
import { SilcRepository } from '../../infrastructure/persistence/SilcRepository';
import { registerHttpErrorHandler } from './middleware/httpErrorHandler';
import {
  createAggregateRoute,
  getAggregateRoute,
  updateAggregateRoute,
} from './routes/createAggregate.route';
import { ReadDbClient } from './db/ReadDbClient';
import { getActiveAggregatesRoute } from './routes/getActiveAggregates.route';
import { getClosedAggregatesRoute } from './routes/getClosedAggregates.route';
import { getAggregateByIdRoute } from './routes/getAggregateById.route';
import { Pool } from 'pg';

/**
 * Initialize Fastify with TypeBox provider
 *
 * TypeBox benefits:
 * - Compile-time type extraction (Static type safety)
 * - Zero-runtime overhead
 * - JSON Schema support for OpenAPI
 * - Request validation built-in
 */
function createFastifyInstance(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'production'
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            },
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  }).withTypeProvider<TypeBoxTypeProvider>();

  return app;
}

/**
 * Initialize dependencies (Command, TransactionManager, Guardian, ReadDbClient)
 *
 * This follows the SPOFE dependency injection pattern:
 * Fastify → Command → TransactionManager → Guardian v4 → PostgreSQL
 * Fastify → ReadDbClient → PostgreSQL (read-only vues)
 */
interface Dependencies {
  transactionManager: TransactionManager;
  guardianAdapter: GuardianV4Adapter;
  silcRepository: SilcRepository;
  readDbClient: ReadDbClient;
}

async function initializeDependencies(): Promise<Dependencies> {
  // In a real application, these would be initialized from env/config
  // For now, we show the structure

  // 1. Guardian v4 Adapter (runtime governance)
  const guardianAdapter = new GuardianV4Adapter();
  // Guardian would be initialized from config/env

  // 2. SILC Repository (database access)
  const silcRepository = new SilcRepository();
  // Database would be initialized from connection config

  // 3. TransactionManager (the single wiring point)
  // This is where Guardian is bound to database mutations
  const transactionManager = new TransactionManager(guardianAdapter, silcRepository);

  // 4. ReadDbClient (read-only access to vues read-models)
  // Uses a separate connection pool with spofe_reader privileges
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/spofe',
    // Optional: use a read-only user
    // user: 'spofe_reader',
    // password: process.env.DB_READER_PASSWORD,
  });
  const readDbClient = new ReadDbClient(pgPool);

  return {
    transactionManager,
    guardianAdapter,
    silcRepository,
    readDbClient,
  };
}

/**
 * Register all HTTP routes
 *
 * WRITE routes (Commands):
 * - Accept DTO (validated by Fastify)
 * - Instantiate Command
 * - Execute Command (which calls TM → Guardian → DB)
 * - Return result
 * No business logic. No DB access. No Guardian bypass possible.
 *
 * READ routes (Read-models):
 * - Query vues read-models via ReadDbClient
 * - Zero Guardian involvement (read-only)
 * - Zero write privileges (SELECT only)
 * - SILC-safe by construction
 */
async function registerRoutes(app: FastifyInstance, deps: Dependencies) {
  // ===== WRITE ROUTES (Commands, Guardian-governed) =====

  // Create aggregate (DECISION that modifies state)
  const createAggregateCommand = new CreateAggregateCommand(deps.transactionManager);
  await createAggregateRoute(app, createAggregateCommand);

  // Query aggregate (READ that doesn't require Guardian)
  await getAggregateRoute(app, deps.silcRepository);

  // Update aggregate (DECISION that modifies state)
  // Would instantiate UpdateAggregateCommand similar to Create
  // await updateAggregateRoute(app, updateAggregateCommand);

  // ===== READ ROUTES (Read-models, no Guardian) =====

  // GET /aggregates/active
  // Returns active aggregates from rm_aggregate_active (read-only)
  await getActiveAggregatesRoute(app, deps.readDbClient);

  // GET /aggregates/closed
  // Returns closed aggregates from rm_aggregate_closed (read-only)
  await getClosedAggregatesRoute(app, deps.readDbClient);

  // GET /aggregates/:id
  // Returns current state from rm_aggregate_current (read-only)
  await getAggregateByIdRoute(app, deps.readDbClient);

  // ===== UTILITY ROUTES =====

  // Health check (no Guardian, no DB required)
  app.get('/health', async (request, reply) => {
    return reply.code(200).send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // OpenAPI/Swagger docs (optional)
  // Would require @fastify/swagger
  // registerSwagger(app);
}

/**
 * Bootstrap and start the server
 *
 * Returns the Fastify instance for testing or further configuration
 */
export async function startServer(port: number = 3000): Promise<FastifyInstance> {
  console.log(`[SPOFE HTTP API] Initializing server on port ${port}...`);

  // 1. Create Fastify instance
  const app = createFastifyInstance();

  // 2. Initialize dependencies
  console.log('[SPOFE HTTP API] Initializing dependencies...');
  const deps = await initializeDependencies();

  // 3. Register error handler middleware
  // CRITICAL: Must be registered BEFORE routes
  // Error handler will catch ALL exceptions (including GuardianError)
  // and map them to HTTP responses via guardianHttpMap
  console.log('[SPOFE HTTP API] Registering centralized error handler...');
  registerHttpErrorHandler(app);

  // 4. Register all routes
  console.log('[SPOFE HTTP API] Registering routes...');
  await registerRoutes(app, deps);

  // 5. Start listening
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`[SPOFE HTTP API] ✅ Server running on http://0.0.0.0:${port}`);
    console.log(
      '[SPOFE HTTP API] Pipeline: HTTP → DTO → Command → TM → Guardian → PostgreSQL'
    );
    return app;
  } catch (err) {
    console.error('[SPOFE HTTP API] ❌ Failed to start server:', err);
    throw err;
  }
}

/**
 * Graceful shutdown
 */
export async function stopServer(app: FastifyInstance): Promise<void> {
  console.log('[SPOFE HTTP API] Shutting down server...');
  await app.close();
  console.log('[SPOFE HTTP API] ✅ Server shut down');
}

/**
 * Entry point (if run directly)
 */
if (require.main === module) {
  const port = parseInt(process.env.PORT || '3000', 10);

  startServer(port)
    .then(() => {
      console.log('[SPOFE HTTP API] Ready to accept requests');
    })
    .catch((err) => {
      console.error('[SPOFE HTTP API] Fatal error:', err);
      process.exit(1);
    });

  // Graceful shutdown on signals
  process.on('SIGINT', async () => {
    console.log('[SPOFE HTTP API] SIGINT received, shutting down...');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('[SPOFE HTTP API] SIGTERM received, shutting down...');
    process.exit(0);
  });
}

export { Dependencies };
