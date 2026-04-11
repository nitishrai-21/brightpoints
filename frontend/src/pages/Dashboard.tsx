// src/pages/Dashboard.tsx
import { useEffect, useState, useCallback } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { CircularProgress } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";

import { api } from "../api/client";
import LogsView from "./LogsView";
import StudentView from "./StudentView";
import UsersList from "./UsersList";
import HouseDetails from "./HouseDetails";
import Profile from "./Profile";
import SummaryView from "../components/SummaryView";
import AddPointsDrawer from "../components/AddPointsModal";
import Layout from "../components/Layout";
import { teachersOnly } from "../permissions";

import type {
  House,
  Log,
  User,
  DashboardProps,
  Role,
  NavButton,
} from "../types";

export default function Dashboard({
  setAccessToken,
  setRefreshToken,
}: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // ---------- REFRESH AFTER NAVIGATION ----------
  useEffect(() => {
    if (location.state?.refresh) {
      loadHouses();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const [reloadKey, setReloadKey] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User>({
    id: 0,
    name: "",
    email: "",
    role: "student",
    school_id: 0,
  });

  const [houses, setHouses] = useState<House[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    loadHouses();
    loadCurrentUser();
  }, [reloadKey]);

  const loadHouses = async () => {
    try {
      const res = await api.get<House[]>("/houses");
      setHouses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const res = await api.get<User>("/auth/me");
      const detectedRole = res.data.role.toLowerCase() as Role;
      setRole(detectedRole);
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllLogs = useCallback(
    async (
      houseId?: number,
      page = 1,
      limit = pageSize,
      search = "",
      teacher = "",
      minPoints?: number,
      maxPoints?: number,
    ) => {
      setLoading(true);

      try {
        let url = `/points?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search,
        )}`;

        if (houseId) url += `&houseId=${houseId}`;
        if (teacher) url += `&teacher=${encodeURIComponent(teacher)}`;
        if (minPoints !== undefined) url += `&minPoints=${minPoints}`;
        if (maxPoints !== undefined) url += `&maxPoints=${maxPoints}`;

        const res = await api.get(url);

        setLogs(res.data.data);
        setTotalPages(res.data.total_pages);
        setTotalItems(res.data.total);
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete api.defaults.headers.common["Authorization"];
    setAccessToken(null);
    setRefreshToken(null);
  };

  const refreshHouses = () => {
    setReloadKey((prev) => prev + 1);
  };

  // ---------------- NAV BUILDER ----------------
  const buildNavButtons = (): NavButton[] => {
    const nav: NavButton[] = [];

    nav.push({
      label: "Dashboard",
      icon: <DashboardIcon />,
      active: location.pathname === "/dashboard",
      onClick: () => navigate("/dashboard"),
    });

    nav.push({
      label: "Points Log",
      icon: <ListAltIcon />,
      active: location.pathname === "/dashboard/logs",
      onClick: () => navigate("/dashboard/logs"),
    });

    if (role && teachersOnly(role)) {
      nav.push({
        label: "Users",
        icon: <PeopleIcon />,
        active: location.pathname === "/dashboard/users",
        onClick: () => navigate("/dashboard/users"),
      });
    }

    return nav;
  };

  if (!role) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout} navButtons={buildNavButtons()}>
      <Routes>
        <Route
          path="/"
          element={
            <SummaryView
              houses={houses}
              role={role}
              onHouseCreated={refreshHouses}
            />
          }
        />

        <Route
          path="house/:id"
          element={
            <HouseDetails
              onAddPoints={() => setShowAddPoints(true)}
              role={role}
              onHouseUpdated={refreshHouses}
            />
          }
        />

        <Route
          path="logs"
          element={
            <LogsView
              logs={logs}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              setPageSize={setPageSize}
              loadLogs={loadAllLogs}
              loading={loading}
              houses={houses}
              onAddPoints={() => setShowAddPoints(true)}
              role={role}
              user={user}
            />
          }
        />

        <Route path="users" element={<UsersList />} />

        <Route
          path="profile"
          element={<Profile user={user} onUserUpdate={setUser} />}
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {role === "teacher" && (
        <AddPointsDrawer
          open={showAddPoints}
          onClose={() => setShowAddPoints(false)}
          onSuccess={() => setReloadKey((k) => k + 1)}
          houses={houses}
        />
      )}
    </Layout>
  );
}
