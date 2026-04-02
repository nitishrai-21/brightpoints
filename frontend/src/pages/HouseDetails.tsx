// src/pages/HouseDetails.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api, getImageUrl } from "../api/client";
import CreateHouseModal from "../components/CreateHouseModal";
import TeacherView from "./TeacherView";
import type { House, Log, Role } from "../types";
import ErrorPage from "../components/ErrorPage";

interface HouseDetailsProps {
  onAddPoints: () => void;
  role?: Role;
}

export default function HouseDetails({ onAddPoints, role }: HouseDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [house, setHouse] = useState<House | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{
    code?: number;
    message?: string;
  } | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // modal state
  const [editModalOpen, setEditModalOpen] = useState(false);

  // ---------------- Load house ----------------
  useEffect(() => {
    if (!id) return;
    loadHouse();
  }, [id]);

  const loadHouse = async () => {
    if (!id) return;

    try {
      const res = await api.get(`/houses/${id}`);
      setHouse(res.data); // API returns a House
      setError(null); // clear previous errors if any
    } catch (err: any) {
      console.error("Failed to load house", err);

      // Customize error based on response
      if (err.response?.status === 404) {
        setError({ code: 404, message: "House not found" });
      } else {
        setError({
          code: 500,
          message: "Failed to load house. Please try again later.",
        });
      }
    }
  };

  // ---------------- Logs loader ----------------
  const loadLogs = useCallback(
    async (
      houseId?: number,
      page = 1,
      limit = pageSize,
      search = "",
      teacher = "",
      minPoints?: number,
      maxPoints?: number,
    ) => {
      if (!id) return;

      setLoading(true);
      try {
        let url = `/points?page=${page}&limit=${limit}&houseId=${id}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (teacher) url += `&teacher=${encodeURIComponent(teacher)}`;
        if (minPoints !== undefined) url += `&minPoints=${minPoints}`;
        if (maxPoints !== undefined) url += `&maxPoints=${maxPoints}`;

        const res = await api.get(url);

        setLogs(res.data.data as Log[]);
        setTotalPages(res.data.total_pages);
        setTotalItems(res.data.total);
      } catch (err) {
        console.error("Failed to load logs", err);
      } finally {
        setLoading(false);
      }
    },
    [id, pageSize],
  );

  // ---------------- Delete house ----------------
  const handleDelete = async () => {
    if (!house) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the class "${house.name}"? This action cannot be undone.`,
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/houses/${house.id}`);
      alert("Class deleted successfully.");
      navigate("/dashboard", { state: { refresh: true } });
    } catch (err) {
      console.error("Failed to delete house", err);
      alert("Failed to delete house. Try again.");
    }
  };

  if (error) {
    return (
      <ErrorPage
        code={error.code}
        message={error.message}
        redirectTo="/dashboard"
        // redirectLabel="Go back to houses"
      />
    );
  }

  if (!house) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;
  }

  const houseImageUrl = getImageUrl(house.logo_url) || undefined;

  return (
    <Box>
      {/* HOUSE HEADER */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          position: "relative",
          backgroundColor: house.class_color
            ? alpha(house.class_color, 0.5)
            : "#f5f5f5",
        }}
      >
        {role === "teacher" && (
          <>
            {/* Edit Button */}
            <Tooltip title="Edit class">
              <IconButton
                onClick={() => setEditModalOpen(true)}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 60,
                  backgroundColor: "white",
                  boxShadow: 2,
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>

            {/* Delete Button */}
            <Tooltip title="Delete class">
              <IconButton
                onClick={handleDelete}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "white",
                  boxShadow: 2,
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={houseImageUrl} sx={{ width: 150, height: 150 }}>
            {house.name?.[0]}
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={700}>
              {house.name}
            </Typography>

            <Typography fontWeight={400}>
              {house.description || "No description"}
            </Typography>
            <Typography color="text.secondary">{house.motto}</Typography>

            <Typography fontWeight={600} mt={1}>
              {house.total_points} points
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* TEACHER VIEW */}
      <TeacherView
        logs={logs}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        setPageSize={setPageSize}
        loadLogs={loadLogs}
        loading={loading}
        houses={[house]} // for dropdown in filters
        onAddPoints={onAddPoints}
        role={role}
      />

      {/* EDIT HOUSE MODAL */}
      {house && (
        <CreateHouseModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onCreated={loadHouse} // refresh after edit
          house={house} // prefill values
        />
      )}
    </Box>
  );
}
