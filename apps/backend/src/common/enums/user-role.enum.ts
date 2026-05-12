export const USER_ROLE = {
  DRIVER: 'DRIVER',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
