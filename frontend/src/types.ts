// src/types.ts
import type { ReactNode } from "react";
import type { Role } from "./permissions";

// -------------------- NAV BUTTON --------------------
export interface NavButton {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  hidden?: boolean;
  badge?: number;
}

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
  role: Role;
  school_id: number;
  house_name?: string;
  is_active?: boolean;
}

// -------------------- TEACHER VIEW PROPS --------------------
export interface LogsViewProps {
  logs: any[];
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

  onAddPoints: () => void;
  houses: any[];
  role: Role;

  // NEW (safe additions)
  page: number;
  setPage: (page: number) => void;
  filters: any;
  setFilters: (f: any) => void;
}

// -------------------- DASHBOARD PROPS --------------------
export interface DashboardProps {
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  onLogout: () => void;
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
