import { ImmobilisationFact } from '../../guardian/types';

export interface ImmobilisationWriteRepository {
  save(event: {
    type: string;
    payload: ImmobilisationFact;
    occurredAt: string;
  }): Promise<void>;
}
