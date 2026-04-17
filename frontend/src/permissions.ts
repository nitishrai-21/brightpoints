//src/permissions.ts;
// -------------------- ROLES --------------------
export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// -------------------- ROLE VALIDATION --------------------
export const isValidRole = (role: string): role is Role => {
  return Object.values(ROLES).includes(role as Role);
};

// -------------------- PERMISSIONS MAP --------------------
export const PERMISSIONS = {
  ADD_POINTS: [ROLES.TEACHER, ROLES.ADMIN],
  ADD_CLASSES: [ROLES.TEACHER, ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN],
  VIEW_LOGS: [ROLES.TEACHER, ROLES.ADMIN, ROLES.STUDENT],
} as const;

// -------------------- GENERIC CHECKER --------------------
export const hasPermission = (
  role: Role | undefined,
  permission: keyof typeof PERMISSIONS,
): boolean => {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
};
