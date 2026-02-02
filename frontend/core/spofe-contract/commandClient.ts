/**
 * SPOFE Frontend Contract Enforcer - Command Client
 * 
 * Sends commands to backend with auth integration
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

import { mapHttpError } from './errorMapper';
import { loadToken } from '../auth';

/**
 * Send a command to the backend
 * 
 * @param commandName - Name of the command (must be declared in manifest)
 * @param payload - Command payload
 * @returns Command response
 * @throws {FceError} - Typed error (AUTH_ERROR, GUARDIAN_ERROR, SYSTEM_ERROR)
 */
export async function sendCommand(
  commandName: string,
  payload: unknown
): Promise<unknown> {
  const token = loadToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Inject token if present (NO validation, NO parsing)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/commands/${commandName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

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
 * ❌ Make authorization decisions
 * ❌ Retry on 401 (frontend redirects to login)
 * 
 * Error handling:
 * - 401 → AUTH_ERROR → Redirect to login
 * - 403/409 → GUARDIAN_ERROR → Display to user
 * - 500+ → SYSTEM_ERROR → Generic error page
 * 
 * The backend (Guardian) decides if the command is allowed.
 * The frontend only transports and displays.
 */
