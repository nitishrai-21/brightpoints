// src/pages/HouseDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import { alpha } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { api, getImageUrl } from "../api/client";
import CreateHouseModal from "../components/CreateHouseModal";
import LogsView from "./LogsView";
import ErrorPage from "../components/ErrorPage";

import type { House } from "../types";
import { hasPermission, type Role } from "../permissions";
import { useToast } from "../context/ToastContext";
import { useLogsController } from "../hooks/useLogsController";

interface HouseDetailsProps {
  onAddPoints: () => void;
  role?: Role;
  onHouseUpdated?: () => void;
  onLogsUpdated?: () => void;
}

export default function HouseDetails({
  onAddPoints,
  role,
  onHouseUpdated,
  onLogsUpdated,
}: HouseDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast } = useToast();

  const [house, setHouse] = useState<House | null>(null);
  const [error, setError] = useState<any>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);

  const {
    logs,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    filters,
    setFilters,
    setHouseId,
    reload,
  } = useLogsController();

  // ---------------- LOAD HOUSE ----------------
  const loadHouse = () => {
    if (!id) return;

    api
      .get(`/houses/${id}`)
      .then((res) => {
        setHouse(res.data);
        setError(null);
      })
      .catch((err) => {
        setError({
          code: err.response?.status,
          message: "Failed to load house",
        });
      });
  };

  useEffect(() => {
    loadHouse();
  }, [id]);

  // ---------------- SET HOUSE ID FOR LOGS ----------------
  useEffect(() => {
    if (id) setHouseId(Number(id));
  }, [id, setHouseId]);

  // ---------------- DELETE ----------------
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!house) return;

    setPendingDelete(true);

    try {
      await api.delete(`/houses/${house.id}`);

      showToast("Class deleted successfully", "success");

      onHouseUpdated?.();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to delete house", err);
      showToast("Failed to delete class", "error");
    } finally {
      setPendingDelete(false);
      setDeleteDialogOpen(false);
    }
  };

  if (error) return <ErrorPage {...error} redirectTo="/dashboard" />;

  if (!house) {
    return <CircularProgress sx={{ mt: 10, mx: "auto", display: "block" }} />;
  }

  const image = getImageUrl(house.logo_url);

  return (
    <Box>
      {/* ================= HOUSE HEADER ================= */}
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
        {/* ACTIONS */}
        {hasPermission(role, "ADD_CLASSES") && (
          <Box
            display="flex"
            flexDirection={isMobile ? "row" : "column"}
            position="absolute"
            top={isMobile ? 8 : 16}
            right={16}
            gap={1}
          >
            <Tooltip title="Edit class">
              <IconButton
                onClick={() => setEditModalOpen(true)}
                sx={{
                  width: isMobile ? 36 : 40,
                  height: isMobile ? 36 : 40,
                  backgroundColor: "white",
                  boxShadow: 2,
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <EditIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete class">
              <IconButton
                onClick={handleDeleteClick}
                sx={{
                  width: isMobile ? 36 : 40,
                  height: isMobile ? 36 : 40,
                  backgroundColor: "white",
                  boxShadow: 2,
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* HOUSE INFO */}
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          flexDirection={isMobile ? "column" : "row"}
        >
          <Avatar
            src={image ?? undefined}
            sx={{ width: 120, height: 120, mb: isMobile ? 2 : 0 }}
          >
            {house.name?.[0]}
          </Avatar>

          <Box textAlign={isMobile ? "center" : "left"}>
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

      {/* ================= LOGS ================= */}
      <LogsView
        logs={logs}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        setPageSize={setPageSize}
        loadLogs={reload}
        loading={loading}
        houses={[house]}
        role={role}
        onAddPoints={onAddPoints}
        page={page}
        setPage={setPage}
        filters={filters}
        setFilters={setFilters}
        onLogsChange={() => {
          setPage(1);
          reload();
          onLogsUpdated?.();
        }}
      />

      {/* ================= EDIT MODAL ================= */}
      <CreateHouseModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        house={house}
        onCreated={() => {
          setEditModalOpen(false);
          loadHouse();
          onHouseUpdated?.();
        }}
      />

      {/* ================= DELETE DIALOG ================= */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Class</DialogTitle>

        <DialogContent>
          Are you sure you want to delete <b>{house.name}</b>? This action
          cannot be undone.
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={pendingDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
