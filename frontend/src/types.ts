// src/types.ts

// -------------------- ROLE --------------------
export type Role = "teacher" | "student";

// -------------------- HOUSE --------------------
export interface House {
  id: number;
  name: string;
  description?: string;
  motto?: string;
  class_color: string;
  total_points: number;
  logo_url?: string | null;
}

// -------------------- LOG --------------------
export interface Log {
  id: number;
  points: number;
  reason: string;
  class_group?: string;
  awarded_at: string;
}

// -------------------- USER --------------------
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role | string; // keep string for unknown roles
  school_id: number;
}

// -------------------- TEACHER VIEW PROPS --------------------
export interface TeacherViewProps {
  logs: Log[];
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  loadLogs: (
    houseId?: number,
    page?: number,
    limit?: number,
    search?: string,
    teacher?: string,
    minPoints?: number,
    maxPoints?: number,
  ) => Promise<void>;
  loading: boolean;
  onAddPoints: () => void;
  houses: House[];
  role?: Role;
  user?: User;
}

// -------------------- DASHBOARD PROPS --------------------
export interface DashboardProps {
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
}

// -------------------- HOUSE DETAILS PROPS --------------------
export interface HouseDetailsProps {
  onAddPoints: () => void;
  role?: Role;
}

// -------------------- SUMMARY VIEW PROPS --------------------
export interface SummaryViewProps {
  houses: House[];
  onHouseCreated?: () => void;
}

// -------------------- ADD POINTS DRAWER PROPS --------------------
export interface AddPointsDrawerProps {
  open: boolean;
  onClose: () => void;
  refreshLogs: () => void;
  houses: House[];
}
