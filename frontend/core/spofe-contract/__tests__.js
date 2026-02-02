/**
 * SPOFE Frontend Contract Enforcer (FCE)
 * 
 * Tests unitaires pour la librairie
 * 
 * Usage: npm test ou jest
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  sendCommand,
  readModel,
  ContractViolation,
  VIOLATIONS,
  loadContract,
  resetContract,
  ContractEnforcer
} from './index.js';

// Mock fetch global
global.fetch = vi.fn();

describe('Frontend Contract Enforcer (FCE)', () => {
  beforeEach(() => {
    resetContract();
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Contract Loading', () => {
    it('should load contract from backend', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            status: 'ACTIVE',
            commands: [{ name: 'CreateAggregate' }, { name: 'CloseAggregate' }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            status: 'ACTIVE',
            readModels: [{ path: '/aggregates' }, { path: '/aggregates/{id}' }]
          })
        });

      const contract = await loadContract();

      expect(contract.version).toBe('1.0.0');
      expect(contract.commands).toContain('CreateAggregate');
      expect(contract.readModels).toContain('/aggregates');
    });

    it('should cache contract after first load', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            commands: [{ name: 'CreateAggregate' }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            readModels: [{ path: '/aggregates' }]
          })
        });

      const contract1 = await loadContract();
      const contract2 = await loadContract();

      expect(contract1).toBe(contract2);
      expect(global.fetch).toHaveBeenCalledTimes(2); // Chargement initial seulement
    });
  });

  describe('Command Enforcement', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            status: 'ACTIVE',
            commands: [
              { name: 'CreateAggregate', endpoint: 'POST /commands/CreateAggregate' },
              { name: 'CloseAggregate', endpoint: 'POST /commands/CloseAggregate' }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            status: 'ACTIVE',
            readModels: [{ path: '/aggregates' }]
          })
        });

      localStorage.setItem('spofe_token', 'test-token');
      await loadContract();
    });

    it('should allow declared commands', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123', status: 'created' })
      });

      const result = await sendCommand('CreateAggregate', { name: 'Test' });

      expect(result).toEqual({ id: '123', status: 'created' });
    });

    it('should reject undeclared commands', async () => {
      await expect(
        sendCommand('HACK_SYSTEM', {})
      ).rejects.toThrow(ContractViolation);
    });

    it('should throw COMMAND_NOT_ALLOWED violation', async () => {
      try {
        await sendCommand('DeleteEverything', {});
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe(VIOLATIONS.COMMAND_NOT_ALLOWED);
        expect(error.message).toContain('DeleteEverything');
      }
    });

    it('should include contract details in violation', async () => {
      try {
        await sendCommand('UnknownCommand', {});
      } catch (error) {
        expect(error.details).toHaveProperty('contractVersion');
        expect(error.details).toHaveProperty('allowedCommands');
      }
    });

    it('should require authentication token', async () => {
      localStorage.clear();
      sessionStorage.clear();

      await expect(
        sendCommand('CreateAggregate', {})
      ).rejects.toThrow('authorization');
    });
  });

  describe('Read-model Enforcement', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            commands: [{ name: 'CreateAggregate' }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            readModels: [
              { path: '/aggregates' },
              { path: '/aggregates/{id}' },
              { path: '/aggregates/active' }
            ]
          })
        });

      localStorage.setItem('spofe_token', 'test-token');
      await loadContract();
    });

    it('should allow declared read-models', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] })
      });

      const result = await readModel('/aggregates');

      expect(result).toEqual({ items: [] });
    });

    it('should allow parameterized read-models', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123', name: 'Test' })
      });

      const result = await readModel('/aggregates/123');

      expect(result).toEqual({ id: '123', name: 'Test' });
    });

    it('should reject undeclared read-models', async () => {
      await expect(
        readModel('/db/users')
      ).rejects.toThrow(ContractViolation);
    });

    it('should throw READ_MODEL_NOT_ALLOWED violation', async () => {
      try {
        await readModel('/internal/debug');
      } catch (error) {
        expect(error.code).toBe(VIOLATIONS.READ_MODEL_NOT_ALLOWED);
      }
    });
  });

  describe('Contract Enforcer Class', () => {
    it('should be a singleton', () => {
      const e1 = ContractEnforcer.getInstance();
      const e2 = ContractEnforcer.getInstance();

      expect(e1).toBe(e2);
    });

    it('should report allowed commands', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            commands: [{ name: 'CreateAggregate' }, { name: 'CloseAggregate' }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            readModels: [{ path: '/aggregates' }]
          })
        });

      const enforcer = ContractEnforcer.getInstance();
      await enforcer.initialize();

      expect(enforcer.isCommandAllowed('CreateAggregate')).toBe(true);
      expect(enforcer.isCommandAllowed('HackSystem')).toBe(false);
    });

    it('should report contract version', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            commands: [{ name: 'CreateAggregate' }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            readModels: [{ path: '/aggregates' }]
          })
        });

      const enforcer = ContractEnforcer.getInstance();
      await enforcer.initialize();

      expect(enforcer.getVersion()).toBe('1.0.0');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            commands: [{ name: 'CreateAggregate' }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0.0',
            readModels: [{ path: '/aggregates' }]
          })
        });

      localStorage.setItem('spofe_token', 'test-token');
      await loadContract();
    });

    it('should propagate backend errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          code: 'CONFLICT',
          message: 'Aggregate already closed'
        })
      });

      await expect(
        sendCommand('CloseAggregate', { id: '123' })
      ).rejects.toThrow('Aggregate already closed');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new TypeError('Network error'));

      await expect(
        sendCommand('CreateAggregate', {})
      ).rejects.toThrow('Network error');
    });
  });
});
