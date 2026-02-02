/**
 * SPOFE HTTP API — Error Handler Middleware
 *
 * Purpose: Map exceptions to HTTP status codes
 *          WITHOUT catching Guardian decisions
 *
 * Pipeline:
 * 1. Guardian throws (validated by Fastify) → 409 (Conflict)
 * 2. DTO invalid → 400 (Bad Request)
 * 3. Process not found → 404 (Not Found)
 * 4. Internal error → 500 (Internal Server Error)
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Custom error types matching SPOFE domains
 */
export class ProcessNotFoundError extends Error {
  constructor(processName: string) {
    super(`Process not found: ${processName}`);
    this.name = 'ProcessNotFoundError';
  }
}

export class GuardianRejectionError extends Error {
  constructor(reason: string) {
    super(`Guardian rejected decision: ${reason}`);
    this.name = 'GuardianRejectionError';
  }
}

export class StructuralValidationError extends Error {
  constructor(message: string) {
    super(`Structural validation failed: ${message}`);
    this.name = 'StructuralValidationError';
  }
}

/**
 * Error handler for Fastify
 *
 * CRITICAL: Does NOT suppress Guardian rejections
 *           Simply maps them to HTTP status codes
 */
export async function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(async (err: any, request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id;
    const timestamp = new Date().toISOString();

    // Log all errors
    console.error(`[${timestamp}] [${requestId}] Error:`, {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      validation: err.validation,
    });

    // 1. DTO/Structural validation error (from Fastify)
    if (err.statusCode === 400 || err.validation) {
      return reply.code(400).send({
        status: 'VALIDATION_ERROR',
        message: 'Request body structure is invalid',
        errors: err.validation || [],
        timestamp,
        requestId,
      });
    }

    // 2. Guardian rejection (mapped from thrown exception)
    // GuardianV4Adapter throws when Guardian refuses
    if (err.name === 'GuardianRejectionError' || err.statusCode === 409) {
      return reply.code(409).send({
        status: 'DECISION_REJECTED',
        message: 'Guardian v4 rejected this decision (unauthorized/invalid process)',
        reason: err.message,
        timestamp,
        requestId,
      });
    }

    // 3. Process not found
    if (err.name === 'ProcessNotFoundError' || err.statusCode === 404) {
      return reply.code(404).send({
        status: 'NOT_FOUND',
        message: 'Process or resource not found',
        timestamp,
        requestId,
      });
    }

    // 4. Database error during transaction
    if (err.name === 'DatabaseError' || err.code?.startsWith?.('23')) {
      // PostgreSQL constraint violation (23xxx)
      return reply.code(409).send({
        status: 'CONSTRAINT_VIOLATION',
        message: 'Database constraint violated',
        detail: err.detail,
        timestamp,
        requestId,
      });
    }

    // 5. All other errors → 500 Internal Server Error
    console.error(`[${timestamp}] Unhandled error:`, err);
    return reply.code(500).send({
      status: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp,
      requestId,
      // In production, don't expose stack trace
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
      }),
    });
  });
}

/**
 * Helper: Throw Guardian rejection
 *
 * Usage in routes when Guardian refuses:
 *
 *   try {
 *     await command.execute(input);
 *   } catch (err) {
 *     if (err instanceof GuardianRejectedError) {
 *       throw new GuardianRejectionError(err.message);
 *     }
 *     throw err; // Re-throw other errors
 *   }
 */
export function createGuardianRejectionError(reason: string): GuardianRejectionError {
  const err = new GuardianRejectionError(reason);
  (err as any).statusCode = 409;
  return err;
}

export function createProcessNotFoundError(processName: string): ProcessNotFoundError {
  const err = new ProcessNotFoundError(processName);
  (err as any).statusCode = 404;
  return err;
}
