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

import { api } from "../api/client";
import TeacherView from "./TeacherView";
import StudentView from "./StudentView";
import HouseDetails from "./HouseDetails";
import Profile from "./Profile";
import SummaryView from "../components/SummaryView";
import AddPointsDrawer from "../components/AddPointsModal";
import Layout from "../components/Layout";
import type { House, Log, User, DashboardProps, Role } from "../types";

export default function Dashboard({
  setAccessToken,
  setRefreshToken,
}: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
  }, []);

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
        let url = `/points?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
        if (houseId) url += `&houseId=${houseId}`;
        if (teacher) url += `&teacher=${encodeURIComponent(teacher)}`;
        if (minPoints !== undefined) url += `&minPoints=${minPoints}`;
        if (maxPoints !== undefined) url += `&maxPoints=${maxPoints}`;

        const res = await api.get<{
          data: Log[];
          total_pages: number;
          total: number;
        }>(url);
        setLogs(res.data.data);
        setTotalPages(res.data.total_pages);
        setTotalItems(res.data.total);
      } catch (err) {
        console.error(err);
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

  if (!role) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;
  }

  // ---------------- NAV BUTTONS ----------------
  const navButtons = [
    {
      label: "📊 Summary",
      active: location.pathname === "/dashboard",
      onClick: () => navigate("/dashboard"),
    },
    role === "teacher"
      ? {
          label: "📋 Points Log",
          active: location.pathname === "/dashboard/teacher",
          onClick: () => navigate("/dashboard/teacher"),
        }
      : {
          label: "🎓 My Points",
          active: location.pathname === "/dashboard/student",
          onClick: () => navigate("/dashboard/student"),
        },
  ];

  return (
    <Layout user={user} onLogout={handleLogout} navButtons={navButtons}>
      <Routes>
        <Route path="/" element={<SummaryView houses={houses} />} />
        <Route
          path="house/:id"
          element={
            <HouseDetails
              onAddPoints={() => setShowAddPoints(true)}
              role={role}
            />
          }
        />
        <Route
          path="teacher"
          element={
            role === "teacher" && (
              <TeacherView
                logs={logs}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                setPageSize={setPageSize}
                loadLogs={loadAllLogs}
                loading={loading}
                houses={houses}
                onAddPoints={() => setShowAddPoints(true)}
                role="teacher"
                user={user}
              />
            )
          }
        />
        <Route
          path="student"
          element={role === "student" && <StudentView houses={houses} />}
        />
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
          refreshLogs={() => loadAllLogs()}
          houses={houses}
        />
      )}
    </Layout>
  );
}
