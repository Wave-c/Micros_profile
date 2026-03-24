export const Role = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  EXECUTOR: "EXECUTOR",
} as const;

export type RoleValue = (typeof Role)[keyof typeof Role];

export const ROLE_LABELS_RU: Record<RoleValue, string> = {
  [Role.ADMIN]: "Администратор",
  [Role.CUSTOMER]: "Заказчик",
  [Role.EXECUTOR]: "Исполнитель",
};

export const ALL_ROLES: readonly RoleValue[] = [
  Role.ADMIN,
  Role.CUSTOMER,
  Role.EXECUTOR,
];

export function parseStoredRoles(raw: readonly string[]): RoleValue[] {
  const allowed = new Set<string>(ALL_ROLES);
  const out: RoleValue[] = [];
  for (const r of raw) {
    const key = String(r).toUpperCase();
    if (allowed.has(key)) {
      out.push(key as RoleValue);
    }
  }
  return out;
}

export function roleSetsEqual(
  a: readonly RoleValue[],
  b: readonly RoleValue[],
): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].map(String).sort();
  const sb = [...b].map(String).sort();
  return sa.every((v, i) => v === sb[i]);
}
