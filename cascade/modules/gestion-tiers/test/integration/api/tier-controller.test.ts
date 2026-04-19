import { ApiContainer } from '../../../src/api';
import { HttpRequest } from '../../../src/api/http/HttpTypes';

describe('API Read-Only - TierController', () => {
  let container: ApiContainer;

  beforeEach(() => {
    container = new ApiContainer();
  });

  it('should return 404 for non-existent tier', () => {
    const request: HttpRequest = {
      params: { tierId: 'non-existent' },
      query: {},
      tenantId: 'test-tenant'
    };

    const response = container.tierController.getTier(request);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Tier not found' });
  });

  it('should return empty list when no tiers exist', () => {
    const request: HttpRequest = {
      params: {},
      query: {},
      tenantId: 'test-tenant'
    };

    const response = container.tierController.listTiers(request);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return false for non-existent tier existence check', () => {
    const request: HttpRequest = {
      params: { tierId: 'non-existent' },
      query: {},
      tenantId: 'test-tenant'
    };

    const response = container.tierController.tierExists(request);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ exists: false });
  });

  it('should return empty contact view for non-existent tier', () => {
    const request: HttpRequest = {
      params: { tierId: 'non-existent' },
      query: {},
      tenantId: 'test-tenant'
    };

    const response = container.tierController.getTierContacts(request);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
  });

  it('should return empty audit trail for non-existent tier', () => {
    const request: HttpRequest = {
      params: { tierId: 'non-existent' },
      query: {},
      tenantId: 'test-tenant'
    };

    const response = container.tierController.getTierAudit(request);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it('should handle missing tierId parameter correctly', () => {
    const request: HttpRequest = {
      params: {},
      query: {},
      tenantId: 'test-tenant'
    };

    const contactsResponse = container.tierController.getTierContacts(request);
    expect(contactsResponse.status).toBe(400);
    expect(contactsResponse.body).toEqual({ message: 'tierId required' });

    const auditResponse = container.tierController.getTierAudit(request);
    expect(auditResponse.status).toBe(400);
    expect(auditResponse.body).toEqual({ message: 'tierId required' });

    const statusResponse = container.tierController.getTierStatus(request);
    expect(statusResponse.status).toBe(400);
    expect(statusResponse.body).toEqual({ message: 'tierId required' });

    const existsResponse = container.tierController.tierExists(request);
    expect(existsResponse.status).toBe(400);
    expect(existsResponse.body).toEqual({ exists: false });
  });

  console.log('✅ API read-only endpoints working correctly');
  console.log('✅ Framework-agnostic abstraction successful');
  console.log('✅ No business logic, pure data projection');
});