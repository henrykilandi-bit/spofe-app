// src/api/ImmobilisationApiWiring.ts
import { ImmobilisationReadController } from './ImmobilisationReadController';
import { ImmobilisationReadRepository } from '../read-models/ports/ImmobilisationReadRepository';

export function buildImmobilisationReadController(
  repo: ImmobilisationReadRepository
): ImmobilisationReadController {
  return new ImmobilisationReadController(repo);
}
