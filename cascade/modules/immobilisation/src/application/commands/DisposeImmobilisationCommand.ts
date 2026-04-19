import { ImmobilisationFact } from '../../guardian/types';

export interface DisposeImmobilisationCommand {
  context: {
    tenantId: string;
    actorId: string;
  };
  payload: ImmobilisationFact;
}
