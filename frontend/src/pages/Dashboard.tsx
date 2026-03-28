// src/pages/Dashboard.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Container,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import TeacherView from "./TeacherView";
import StudentView from "./StudentView";
import AddPointsDrawer from "../components/AddPointsModal";
import SummaryView from "../components/SummaryView";

interface DashboardProps {
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
}

type ViewMode = "summary" | "teacher" | "student";
type Role = "teacher" | "student";

export default function Dashboard({
  setAccessToken,
  setRefreshToken,
}: DashboardProps) {
  const navigate = useNavigate();

  const [view, setView] = useState<ViewMode>("summary");
  const [role, setRole] = useState<Role | null>(null);

  const [houses, setHouses] = useState<any[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<any>(null);

  const [logs, setLogs] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);

  // Avatar menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });

  const open = Boolean(anchorEl);

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
      if (detectedRole !== "teacher" && detectedRole !== "student") {
        console.error("Invalid role received:", res.data.role);
      }
      setRole(detectedRole);
      setUser({ name: res.data.name, email: res.data.email });
    } catch (err) {
      console.error("Failed to load user info:", err);
    }
  };

  // ---------------- LOAD LOGS ----------------
  useEffect(() => {
    if (view === "teacher" && role === "teacher") {
      loadAllLogs();
    }
  }, [view, role]);

  const loadAllLogs = async (
    houseId?: any,
    page = 1,
    limit = pageSize,
    search = "",
  ) => {
    setLoading(true);

    let url = `/points?page=${page}&limit=${limit}&search=${encodeURIComponent(
      search,
    )}`;
    if (houseId) url += `&houseId=${houseId}`;

    const res = await api.get(url);
    setLogs(res.data.data);
    setTotalPages(res.data.total_pages);
    setTotalItems(res.data.total);
    setLoading(false);
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete api.defaults.headers.common["Authorization"];
    setAccessToken(null);
    setRefreshToken(null);
    navigate("/");
  };

  // ---------------- LOADING STATE ----------------
  if (!role) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ---------------- UI ----------------
  return (
    <>
      {/* HEADER */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "white", borderBottom: "1px solid #e5e7eb", height: 64 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography fontWeight={600} color="black">
            BrightPoints
          </Typography>

          {/* NAVIGATION */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              bgcolor: "#f3f4f6",
              p: "6px",
              borderRadius: "12px",
            }}
          >
            <Button
              variant={view === "summary" ? "contained" : "text"}
              onClick={() => setView("summary")}
            >
              📊 Summary
            </Button>

            {role === "teacher" && (
              <Button
                variant={view === "teacher" ? "contained" : "text"}
                onClick={() => setView("teacher")}
              >
                📋 Points Log
              </Button>
            )}

            {role === "student" && (
              <Button
                variant={view === "student" ? "contained" : "text"}
                onClick={() => setView("student")}
              >
                🎓 My Points
              </Button>
            )}
          </Box>

          {/* AVATAR */}
          <Box>
            <Avatar
              sx={{ bgcolor: "#1976d2", cursor: "pointer" }}
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              {user.name
                ? `${user.name.split(" ")[0][0]}${
                    user.name.split(" ").slice(-1)[0][0]
                  }`
                : "U"}
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography fontWeight={600}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>

              <Divider />
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  setAnchorEl(null);
                }}
              >
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* CONTENT */}
      <Container maxWidth="lg" sx={{ mt: 1 }}>
        <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2 }}>
          {view === "summary" && (
            <>
              <SummaryView houses={houses} />
            </>
          )}

          {view === "teacher" && role === "teacher" && (
            <TeacherView
              selectedHouse={selectedHouse}
              logs={logs}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              setPageSize={setPageSize}
              loadLogs={loadAllLogs}
              loading={loading}
              houses={houses}
              setSelectedHouse={setSelectedHouse}
              onAddPoints={() => setShowAddPoints(true)}
            />
          )}

          {view === "student" && role === "student" && (
            <StudentView houses={houses} />
          )}
        </Box>
      </Container>

      {/* DRAWER */}
      {role === "teacher" && (
        <AddPointsDrawer
          open={showAddPoints}
          onClose={() => setShowAddPoints(false)}
          houses={houses}
          houseId={selectedHouse?.id}
          onSuccess={() => loadAllLogs(selectedHouse?.id)}
        />
      )}
    </>
  );
}
