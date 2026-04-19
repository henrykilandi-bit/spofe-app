import { ImmobilisationFact } from '../../guardian/types';

export interface RegisterImmobilisationCommand {
  context: {
    tenantId: string;
    actorId: string;
  };
  payload: ImmobilisationFact;
}
