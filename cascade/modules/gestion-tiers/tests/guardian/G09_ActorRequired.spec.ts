import { describe, it, expect } from '@jest/globals';
import { G09_ActorRequired } from '../../src/domain/guardian/invariants/G09_ActorRequired';
import { baseContext } from './helpers';

describe('G09_ActorRequired', () => {
  const invariant = new G09_ActorRequired();

  it('PASS when actorId exists', () => {
    expect(() => invariant.validate(baseContext())).not.toThrow();
  });

  it('FAIL when actorId missing', () => {
    const ctx = baseContext({ actorId: undefined });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G09_ACTOR_REQUIRED' }));
  });

  it('PASS when actorId is provided', () => {
    const ctx = baseContext({ actorId: 'user-123' });

    expect(() => invariant.validate(ctx)).not.toThrow();
  });

  it('FAIL when actorId is empty string', () => {
    const ctx = baseContext({ actorId: '' });

    expect(() => invariant.validate(ctx)).toThrow(expect.objectContaining({ code: 'G09_ACTOR_REQUIRED' }));
  });
});
