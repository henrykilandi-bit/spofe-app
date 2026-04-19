import { ImmobilisationFact } from '../../guardian/types';

export interface PutImmobilisationInServiceCommand {
  context: {
    tenantId: string;
    actorId: string;
  };
  payload: ImmobilisationFact;
}
