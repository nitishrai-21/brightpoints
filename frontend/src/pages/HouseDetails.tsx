// src/pages/HouseDetails.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material";
import { api } from "../api/client";
import TeacherView from "./TeacherView";
import type { House, Log } from "../types";

interface HouseDetailsProps {
  onAddPoints: () => void;
  role?: "teacher" | "student";
}

export default function HouseDetails({ onAddPoints, role }: HouseDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const backendBase = "http://localhost:8000/static/icons/";

  const [house, setHouse] = useState<House | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // ---------------- Load house ----------------
  useEffect(() => {
    if (!id) return;
    loadHouse();
  }, [id]);

  const loadHouse = async () => {
    try {
      const res = await api.get(`/houses/${id}`);
      setHouse(res.data); // assumes API returns a House
    } catch (err) {
      console.error("Failed to load house", err);
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

  if (!house) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;
  }

  return (
    <Box>
      {/* HOUSE HEADER */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          backgroundColor: house.class_color
            ? alpha(house.class_color, 0.5)
            : "#f5f5f5",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={
              house.logo_url
                ? house.logo_url.startsWith("http")
                  ? house.logo_url
                  : `${backendBase}${house.logo_url}`
                : "/images/default-house.png"
            }
            sx={{ width: 150, height: 150 }}
          >
            {house.name?.[0]}
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={700}>
              {house.name}
            </Typography>

            <Typography color="text.secondary">
              {house.description || "No description"}
            </Typography>

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
    </Box>
  );
}
