/**
 * SPOFE HTTP Error Handler — Centralized Exception Mapping
 *
 * Purpose: Translate all exceptions (especially Guardian rejections) to HTTP responses
 *
 * Design Principle:
 * ✅ Guardian is sovereign (never suppressed)
 * ✅ No try/catch logic in routes (centralized here)
 * ✅ Mapping is stable and contractual
 * ✅ No business logic in HTTP layer
 * ✅ All errors logged and audited
 *
 * Flow:
 * Route → throws exception
 *   ↓
 * Error handler catches
 *   ↓
 * Check: Is this GuardianError?
 *   ↓ YES
 * Map violation code to HTTP (guardianHttpMap)
 *   ↓ NO
 * Handle other error types
 *   ↓
 * Send HTTP response
 *   ↓
 * Log for audit trail
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GuardianError, isGuardianError } from '../../application/transaction/GuardianError';
import {
  getGuardianHttpMapping,
  GuardianHttpMapping,
} from './mapping/guardianHttpMap';

/**
 * Standardized error response body
 */
export interface HttpErrorResponse {
  error: string; // Machine-readable code
  message: string; // Human-readable message
  violation?: string; // Guardian violation code (if Guardian error)
  requestId?: string; // For tracing
  timestamp: string; // ISO 8601
}

/**
 * Register centralized error handler with Fastify
 *
 * MUST be called before route registration
 * (Fastify processes errors in reverse registration order)
 *
 * @param app - Fastify instance
 */
export function registerHttpErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
    const timestamp = new Date().toISOString();
    const requestId = request.id || request.headers['x-request-id'];

    // ============================================
    // 1. GUARDIAN ERRORS (Sovereign Rejections)
    // ============================================
    if (isGuardianError(error)) {
      // Get mapping for this violation code
      const mapping = getGuardianHttpMapping(error.violationCode);

      // Guardian said NO → We respond with Guardian's mapping
      // NO suppression, NO retry, NO "fixing" the decision
      app.log.warn(
        {
          requestId,
          violationCode: error.violationCode,
          message: error.message,
        },
        'Guardian rejection'
      );

      return reply.status(mapping.status).send({
        error: mapping.code,
        message: mapping.message,
        violation: error.violationCode,
        requestId,
        timestamp,
      } as HttpErrorResponse);
    }

    // ============================================
    // 2. DTO/VALIDATION ERRORS
    // ============================================
    if (error.name === 'ValidationError' || 'statusCode' in error && error.statusCode === 400) {
      app.log.warn(
        {
          requestId,
          error: error.message,
        },
        'Validation error'
      );

      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: error.message || 'Request validation failed',
        requestId,
        timestamp,
      } as HttpErrorResponse);
    }

    // ============================================
    // 3. RESOURCE NOT FOUND
    // ============================================
    if ('statusCode' in error && error.statusCode === 404) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: error.message || 'Resource not found',
        requestId,
        timestamp,
      } as HttpErrorResponse);
    }

    // ============================================
    // 4. DATABASE CONSTRAINT VIOLATIONS
    // ============================================
    if (
      error.message?.includes('constraint') ||
      error.message?.includes('UNIQUE') ||
      error.message?.includes('FOREIGN KEY')
    ) {
      app.log.error(
        {
          requestId,
          error: error.message,
        },
        'Database constraint violation'
      );

      return reply.status(409).send({
        error: 'CONFLICT',
        message: 'Database constraint violated (likely duplicate or missing reference)',
        requestId,
        timestamp,
      } as HttpErrorResponse);
    }

    // ============================================
    // 5. UNEXPECTED/UNHANDLED ERRORS
    // ============================================
    app.log.error(
      {
        requestId,
        error: error.message,
        stack: error.stack,
      },
      'Unhandled error in request'
    );

    // Never expose internal details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const errorMessage = isDevelopment
      ? error.message
      : 'An unexpected error occurred. Please contact support.';

    return reply.status(500).send({
      error: 'INTERNAL_ERROR',
      message: errorMessage,
      requestId,
      timestamp,
    } as HttpErrorResponse);
  });
}

/**
 * Helper: Create a GuardianError with standard format
 * (useful in TransactionManager)
 *
 * @param violationCode - G4-01, G4-03, etc.
 * @param details - Additional context
 * @returns GuardianError ready to throw
 */
export function createGuardianErrorResponse(
  violationCode: string,
  details: string
): GuardianError {
  const mapping = getGuardianHttpMapping(violationCode);
  return new GuardianError(violationCode, `${mapping.message}: ${details}`);
}
