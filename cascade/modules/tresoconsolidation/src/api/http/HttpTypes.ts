/**
 * HttpTypes.ts
 * Types HTTP framework-agnostic
 *
 * @module tresoconsolidation
 * @layer api/http
 * @governance SPOFE P0
 *
 * Types neutres permettant l'intégration avec n'importe quel framework HTTP.
 */

export interface HttpRequest {
  tenantId: string;
  query?: Record<string, string | undefined>;
}

export interface HttpResponse<T = any> {
  status: number;
  body: T;
}
