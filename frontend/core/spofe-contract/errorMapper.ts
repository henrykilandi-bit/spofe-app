/**
 * SPOFE Frontend Contract Enforcer - Error Mapper
 * 
 * Maps HTTP responses to typed FCE errors
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

import { FceError } from './errors';

/**
 * Map HTTP response to typed FCE error
 * 
 * This mapping is CONTRACTUAL and aligned with OpenAPI spec.
 * 
 * @param response - Failed HTTP response
 * @throws {FceError} - Typed error for frontend handling
 */
export async function mapHttpError(response: Response): Promise<never> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    // Payload is optional
  }

  // 🔐 AUTH ERROR - Infrastructure (401)
  if (response.status === 401) {
    throw new FceError(
      'AUTH_ERROR',
      401,
      'Authentication failed',
      payload
    );
  }

  // 🧠 GUARDIAN ERROR - Business decisions (403, 404, 409)
  if (
    response.status === 403 ||
    response.status === 404 ||
    response.status === 409
  ) {
    throw new FceError(
      'GUARDIAN_ERROR',
      response.status,
      'Guardian decision',
      payload
    );
  }

  // 🧱 SYSTEM ERROR - Infrastructure failures (500+)
  throw new FceError(
    'SYSTEM_ERROR',
    response.status,
    'System error',
    payload
  );
}

/**
 * ⚠️ MAPPING RULES (STRICT)
 * 
 * This function enforces the SPOFE Auth Contract:
 * 
 * 401 = AUTH_ERROR
 *   - Token invalid/expired/missing
 *   - NEVER a business decision
 *   - Frontend: Redirect to login
 * 
 * 403/404/409 = GUARDIAN_ERROR
 *   - Business rule violation
 *   - Invariant violation
 *   - Resource not found (business context)
 *   - Frontend: Display error to user
 * 
 * 500+ = SYSTEM_ERROR
 *   - Infrastructure failure
 *   - Frontend: Generic error page
 * 
 * This mapping is:
 * ✅ Aligned with OpenAPI spec
 * ✅ Enforced by CI checks
 * ✅ Tested in E2E
 * 
 * DO NOT change this mapping without updating:
 * - OpenAPI spec
 * - Backend error handling
 * - CI checks
 * - E2E tests
 */
