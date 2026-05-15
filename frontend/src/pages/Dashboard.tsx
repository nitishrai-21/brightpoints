// src/pages/Dashboard.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Box, Button, CircularProgress } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";

import { api } from "../api/client";
import LogsView from "./LogsView";
import UsersList from "./UsersList";
import HouseDetails from "./HouseDetails";
import Profile from "./Profile";
import SummaryView from "../components/SummaryView";
import AddPointsDrawer from "../components/AddPointsModal";
import Layout from "../components/Layout";
import { isValidRole, hasPermission, type Role } from "../permissions";

import type { House, Log, User, DashboardProps, NavButton } from "../types";

export default function Dashboard({
  setAccessToken,
  setRefreshToken,
  onLogout,
}: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const logsRequestRef = useRef(0);

  // ---------------- USER ----------------
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User>({
    id: 0,
    name: "",
    email: "",
    role: "student",
    school_id: 0,
  });

  // ---------------- DATA ----------------
  const [houses, setHouses] = useState<House[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [showAddPoints, setShowAddPoints] = useState(false);

  // ---------------- LOG STATE (FIX) ----------------
  const [logsPage, setLogsPage] = useState(1);
  const [logsFilters, setLogsFilters] = useState({
    search: "",
    teacher: "",
    house: "",
    minPoints: "",
    maxPoints: "",
  });

  // ---------------- INIT ----------------
  useEffect(() => {
    loadHouses();
    loadCurrentUser();
  }, []);

  const shuffleScores = () => {
    setHouses((prev) =>
      [...prev]
        .map((h) => ({
          ...h,
          total_points: h.total_points + Math.floor(Math.random() * 100),
        }))
        .sort((a, b) => b.total_points - a.total_points),
    );
  };

  const loadHouses = async () => {
    try {
      const res = await api.get("/houses");
      setHouses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");
      const detectedRole = res.data.role.toLowerCase();

      if (!isValidRole(detectedRole)) throw new Error("Invalid role");

      setRole(detectedRole);
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshLogs = useCallback(() => {
    setLogsPage(1);
    setLogsFilters((prev) => ({ ...prev }));
  }, []);

  // ---------------- LOGS LOADER (FIXED) ----------------
  const loadAllLogs = useCallback(async () => {
    const requestId = ++logsRequestRef.current;
    setLoading(true);

    try {
      let url = `/points?page=${logsPage}&limit=${pageSize}`;

      if (logsFilters.search)
        url += `&search=${encodeURIComponent(logsFilters.search)}`;

      if (logsFilters.teacher)
        url += `&teacher=${encodeURIComponent(logsFilters.teacher)}`;

      if (logsFilters.house) url += `&houseId=${logsFilters.house}`;

      if (logsFilters.minPoints) url += `&minPoints=${logsFilters.minPoints}`;

      if (logsFilters.maxPoints) url += `&maxPoints=${logsFilters.maxPoints}`;

      const res = await api.get(url);

      if (requestId !== logsRequestRef.current) return;

      const newTotalPages = res.data.total_pages;

      setLogs(res.data.data);
      setTotalPages(newTotalPages);
      setTotalItems(res.data.total);

      // ✅ SAFE PAGE GUARD
      setLogsPage((prev) => (prev > newTotalPages ? 1 : prev));
    } finally {
      if (requestId === logsRequestRef.current) {
        setLoading(false);
      }
    }
  }, [logsPage, pageSize, logsFilters]);

  useEffect(() => {
    loadAllLogs();
  }, [logsPage, pageSize, logsFilters]);

  // ---------------- NAV ----------------
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

    if (role && hasPermission(role, "MANAGE_USERS")) {
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
    <Layout user={user} onLogout={onLogout} navButtons={buildNavButtons()}>
      <Routes>
        <Route
          path="/"
          element={
            <SummaryView
              houses={houses}
              role={role}
              onHouseCreated={loadHouses}
            />
          }
        />
        <Route
          path="/public"
          element={
            <Box>
              {/* ✅ TEST CONTROL (ONLY PUBLIC VIEW) */}
              <Button
                variant="contained"
                onClick={shuffleScores}
                sx={{
                  position: "fixed",
                  top: 80,
                  right: 16,
                  zIndex: 2000,
                }}
              >
                Shuffle Public Scores
              </Button>

              <SummaryView
                houses={houses}
                role={role}
                onRefresh={loadHouses}
                isPublic={true}
              />
            </Box>
          }
        />
        <Route
          path="house/:id"
          element={
            <HouseDetails
              role={role}
              onAddPoints={() => setShowAddPoints(true)}
              onHouseUpdated={loadHouses}
              onLogsUpdated={() => {
                setLogsPage(1);
                setLogsFilters((prev) => ({ ...prev }));
              }}
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
              role={role}
              onAddPoints={() => setShowAddPoints(true)}
              page={logsPage}
              setPage={setLogsPage}
              filters={logsFilters}
              setFilters={setLogsFilters}
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

      {hasPermission(role, "ADD_POINTS") && (
        <AddPointsDrawer
          open={showAddPoints}
          onClose={() => setShowAddPoints(false)}
          houses={houses}
          onSuccess={() => {
            refreshLogs();
            loadHouses();
          }}
        />
      )}
    </Layout>
  );
}
