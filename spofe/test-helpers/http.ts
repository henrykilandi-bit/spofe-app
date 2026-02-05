import request from 'supertest';
import type { INestApplication } from '@nestjs/common';

/**
 * Client HTTP typé pour tests E2E
 */
export function httpClient(app: INestApplication) {
  return request(app.getHttpServer());
}