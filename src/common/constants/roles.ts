export const RoleName = {
  ADMIN: 'admin',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];
