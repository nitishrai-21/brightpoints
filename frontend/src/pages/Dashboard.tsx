//src/pages/Dashboard.tsx
import { useEffect, useState, useCallback } from "react";
import {
  CircularProgress,
  Paper,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { api } from "../api/client";
import TeacherView from "./TeacherView";
import StudentView from "./StudentView";
import Profile from "./Profile";
import SummaryView from "../components/SummaryView";
import AddPointsDrawer from "../components/AddPointsModal";
import Layout from "../components/Layout";

interface DashboardProps {
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
}

type ViewMode = "summary" | "teacher" | "student" | "profile";
type Role = "teacher" | "student";

export default function Dashboard({
  setAccessToken,
  setRefreshToken,
}: DashboardProps) {
  const [view, setView] = useState<ViewMode>("summary");
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState({
    id: 0,
    name: "",
    email: "",
    role: "",
    school_id: 0,
  });

  const [houses, setHouses] = useState<any[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<any>(null);

  const [logs, setLogs] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    loadHouses();
    loadCurrentUser();
  }, []);

  const loadHouses = async () => {
    const res = await api.get("/houses");
    setHouses(res.data);
  };

  const loadCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");
      const detectedRole = res.data.role?.toLowerCase();
      setRole(detectedRole);
      setUser(res.data);
      setDisplayName(res.data.name || "");
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllLogs = useCallback(
    async (
      houseId?: any,
      page = 1,
      limit = pageSize,
      search = "",
      teacher = "",
      minPoints?: number,
      maxPoints?: number,
    ) => {
      setLoading(true);
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
      setLoading(false);
    },
    [pageSize], // only recreate when pageSize changes
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete api.defaults.headers.common["Authorization"];
    setAccessToken(null);
    setRefreshToken(null);
  };

  const handleNavigate = (viewName: ViewMode) => setView(viewName);

  const handleSaveProfile = async () => {
    try {
      await api.put("/auth/me", { name: displayName });
      setSaved(true);
      setError("");
      setUser({ ...user, name: displayName });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save display name");
    }
  };

  if (!role) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;
  }

  // Navigation buttons
  const navButtons = [
    {
      label: "📊 Summary",
      active: view === "summary",
      onClick: () => setView("summary"),
    },
    role === "teacher"
      ? {
          label: "📋 Points Log",
          active: view === "teacher",
          onClick: () => setView("teacher"),
        }
      : {
          label: "🎓 My Points",
          active: view === "student",
          onClick: () => setView("student"),
        },
  ];

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      navButtons={navButtons}
      onNavigate={handleNavigate}
    >
      {view === "summary" && <SummaryView houses={houses} />}
      {view === "teacher" && role === "teacher" && (
        <TeacherView
          // selectedHouse={selectedHouse}
          logs={logs}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loadLogs={loadAllLogs}
          loading={loading}
          houses={houses}
          // setSelectedHouse={setSelectedHouse}
          onAddPoints={() => setShowAddPoints(true)}
        />
      )}
      {view === "student" && role === "student" && (
        <StudentView houses={houses} />
      )}
      {view === "profile" && (
        <Profile
          user={user}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
        />
      )}

      {role === "teacher" && (
        <AddPointsDrawer
          open={showAddPoints}
          onClose={() => setShowAddPoints(false)}
          houses={houses}
          houseId={selectedHouse?.id}
          onSuccess={() => loadAllLogs(selectedHouse?.id)}
        />
      )}
    </Layout>
  );
}
