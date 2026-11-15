export const RoleName = {
  ADMIN: 'admin',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

// Permisos de gestión de acceso: si el rol admin los pierde o se desactivan,
// puede quedar el sistema sin forma de administrar usuarios/roles/permisos.
export const CRITICAL_PERMISSION_PREFIXES = [
  'roles.',
  'permissions.',
  'users.',
] as const;

export function isCriticalPermissionCode(code: string): boolean {
  return CRITICAL_PERMISSION_PREFIXES.some((prefix) =>
    code.startsWith(prefix),
  );
}

export function isAdminRoleName(name: string | null | undefined): boolean {
  return name?.trim().toLowerCase() === RoleName.ADMIN;
}
