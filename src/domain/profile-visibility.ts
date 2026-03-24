import { Role, type RoleValue } from "./role";

export function hasRole(roles: readonly RoleValue[], r: RoleValue): boolean {
  return roles.includes(r);
}

export function hasAdminRole(roles: readonly RoleValue[]): boolean {
  return hasRole(roles, Role.ADMIN);
}

export function canViewOthersProfile(
  viewerRoles: readonly RoleValue[],
  targetRoles: readonly RoleValue[],
): boolean {
  if (hasAdminRole(viewerRoles)) {
    return true;
  }
  if (hasAdminRole(targetRoles)) {
    return false;
  }

  const vCust = hasRole(viewerRoles, Role.CUSTOMER);
  const vExec = hasRole(viewerRoles, Role.EXECUTOR);
  const tCust = hasRole(targetRoles, Role.CUSTOMER);
  const tExec = hasRole(targetRoles, Role.EXECUTOR);

  if (vCust && tExec) {
    return true;
  }
  if (vExec && tCust) {
    return true;
  }
  return false;
}
