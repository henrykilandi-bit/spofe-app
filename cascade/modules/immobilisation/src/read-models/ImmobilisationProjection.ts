import { ImmobilisationRM } from './types';

type Event =
  | {
      type: 'ImmobilisationRegistered';
      payload: ImmobilisationRM;
    }
  | {
      type: 'ImmobilisationPutInService';
      payload: ImmobilisationRM;
    }
  | {
      type: 'ImmobilisationDisposed';
      payload: ImmobilisationRM;
    };

export class ImmobilisationProjection {
  private readonly state = new Map<string, ImmobilisationRM>();

  apply(event: Event): void {
    const id = event.payload.immobilisationId;

    switch (event.type) {
      case 'ImmobilisationRegistered':
        this.state.set(id, {
          ...event.payload,
          status: 'REGISTERED',
        });
        break;

      case 'ImmobilisationPutInService':
        this.state.set(id, {
          ...this.state.get(id)!,
          inServiceDate: event.payload.inServiceDate,
          status: 'IN_SERVICE',
        });
        break;

      case 'ImmobilisationDisposed':
        this.state.set(id, {
          ...this.state.get(id)!,
          disposedDate: event.payload.disposedDate,
          status: 'DISPOSED',
        });
        break;
    }
  }

  snapshot(): ImmobilisationRM[] {
    return Array.from(this.state.values());
  }
}
