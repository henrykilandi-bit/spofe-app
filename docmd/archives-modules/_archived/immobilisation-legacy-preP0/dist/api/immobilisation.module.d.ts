/**
 * Immobilisation Module - NestJS Module
 * Conformité: API_READ_ONLY.md v1.0.0
 *
 * Module NestJS pour l'enregistrement des controllers read-only.
 */
import { ImmobilisationReadModelRepository } from '../infrastructure/persistence';
export declare class ImmobilisationReadModule {
}
/**
 * Pour une utilisation avec Fastify directement (sans NestJS),
 * utilisez la fonction registerImmobilisationRoutes ci-dessous.
 *
 * @example
 * ```typescript
 * import Fastify from 'fastify';
 * import { registerImmobilisationRoutes } from './immobilisation.module';
 *
 * const fastify = Fastify();
 * await registerImmobilisationRoutes(fastify, repository);
 * await fastify.listen({ port: 3000 });
 * ```
 */
import type { FastifyInstance } from 'fastify';
export declare function registerImmobilisationRoutes(fastify: FastifyInstance, readModelRepo: ImmobilisationReadModelRepository): Promise<void>;
//# sourceMappingURL=immobilisation.module.d.ts.map