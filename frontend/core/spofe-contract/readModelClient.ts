/**
 * SPOFE Frontend Contract Enforcer - Read Model Client
 * 
 * Reads projections from backend with auth integration
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

import { mapHttpError } from './errorMapper';
import { loadToken } from '../auth';

/**
 * Read a projection from the backend
 * 
 * @param endpoint - Read model endpoint (must be declared in manifest)
 * @returns Read model data
 * @throws {FceError} - Typed error (AUTH_ERROR, GUARDIAN_ERROR, SYSTEM_ERROR)
 */
export async function readModel(endpoint: string): Promise<unknown> {
  const token = loadToken();

  const headers: Record<string, string> = {};

  // Inject token if present (NO validation, NO parsing)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, { headers });

  if (!response.ok) {
    await mapHttpError(response);
  }

  return response.json();
}

/**
 * ⚠️ IMPORTANT RULES
 * 
 * This client:
 * ✅ Injects auth token from core/auth
 * ✅ Maps errors to typed FceError
 * ✅ Transports identity, never validates
 * 
 * This client does NOT:
 * ❌ Parse the token
 * ❌ Validate the token
 * ❌ Check permissions
 * ❌ Filter data based on roles
 * ❌ Make authorization decisions
 * 
 * Error handling:
 * - 401 → AUTH_ERROR → Redirect to login
 * - 404 → GUARDIAN_ERROR → Resource not found (business)
 * - 500+ → SYSTEM_ERROR → Generic error page
 * 
 * The backend decides what data to return.
 * The frontend only transports and displays.
 */
