import { RolesCatalog } from '../types/RolesCatalog';

export function invariantRolesCapabilities(
  catalog: RolesCatalog
): void {
  for (const role of catalog.roles) {
    if (!Array.isArray(role.capabilities)) {
      throw new TypeError(`Role ${role.roleCode} must declare capabilities as an array`);
    }
  }
}
