export const canAddPoints = (role?: string) => role === "teacher";
export const canAddClasses = (role?: string) => role === "teacher";
export const teachersOnly = (role?: string) => role === "teacher";
