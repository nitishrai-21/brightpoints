// src/components/SummaryView.tsx
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Avatar,
  Button,
  Fab,
} from "@mui/material";
import { getImageUrl } from "../api/client";
import CreateHouseModal from "./CreateHouseModal";
import { useNavigate } from "react-router-dom";
import type { House } from "../types";
import AddIcon from "@mui/icons-material/Add";
import { hasPermission, type Role } from "../permissions";

interface SummaryViewProps {
  houses: House[];
  role: Role;
  onHouseCreated?: () => void;
}

export default function SummaryView({
  houses,
  role,
  onHouseCreated,
}: SummaryViewProps) {
  const sorted = [...houses].sort((a, b) => b.total_points - a.total_points);
  const totalPoints = sorted.reduce(
    (sum, h) => sum + Math.max(0, h.total_points),
    0,
  );

  const navigate = useNavigate();
  const [showCreateHouse, setShowCreateHouse] = useState(false);

  const getMedalNumber = (i: number) => i + 1;
  const getMedalColor = (i: number) => {
    if (i === 0) return "#FFD700";
    if (i === 1) return "#C0C0C0";
    if (i === 2) return "#CD7F32";
    return "#6366f1";
  };

  return (
    <Box sx={{ position: "relative", pb: { xs: 12, sm: 0 } }}>
      {/* DESKTOP HEADER + BUTTON */}
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Total Points
        </Typography>
        {hasPermission(role, "ADD_CLASSES") && (
          <Button
            variant="contained"
            onClick={() => setShowCreateHouse(true)}
            sx={{ textTransform: "none" }}
          >
            + Add Class
          </Button>
        )}
      </Box>

      {/* MOBILE HEADER */}
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Total Points
        </Typography>
      </Box>

      {/* DESKTOP LAYOUT */}
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {sorted.map((house, i) => {
            const points = Math.max(0, house.total_points);
            const percentage =
              totalPoints > 0 ? (points / totalPoints) * 100 : 0;
            const logoSrc = getImageUrl(house.logo_url) || undefined;

            return (
              <Box key={house.id} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/dashboard/house/${house.id}`)}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: getMedalColor(i),
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    {getMedalNumber(i)}
                  </Box>

                  <Avatar
                    src={logoSrc}
                    sx={{ width: 48, height: 48, bgcolor: "#c7d2fe" }}
                  >
                    {house.name[0]}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography fontWeight={600}>{house.name}</Typography>
                      <Typography fontWeight={700}>{points} pts</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#e5e7eb",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            (house as any).class_color || "#6366f1",
                        },
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{ ml: 1, fontSize: 12, color: "text.secondary" }}
                  >
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Paper>
      </Box>

      {/* MOBILE LAYOUT */}
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          {sorted.map((house, i) => {
            const points = Math.max(0, house.total_points);
            const percentage =
              totalPoints > 0 ? (points / totalPoints) * 100 : 0;
            const logoSrc = getImageUrl(house.logo_url) || undefined;

            return (
              <Box key={house.id} sx={{ mb: 2 }}>
                {/* Medal + Avatar + Name on top */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                  onClick={() => navigate(`/dashboard/house/${house.id}`)}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: getMedalColor(i),
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    {getMedalNumber(i)}
                  </Box>
                  <Avatar
                    src={logoSrc}
                    sx={{ width: 40, height: 40, bgcolor: "#c7d2fe" }}
                  >
                    {house.name[0]}
                  </Avatar>
                  <Typography fontWeight={600}>{house.name}</Typography>
                </Box>

                {/* Progress + points below */}
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#e5e7eb",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: (house as any).class_color || "#6366f1",
                    },
                    mb: 0.5,
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography fontWeight={700}>{points} pts</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Paper>
      </Box>

      {/* MOBILE FAB ONLY */}
      {hasPermission(role, "ADD_CLASSES") && (
        <Fab
          variant="extended"
          color="primary"
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            display: { xs: "flex", sm: "none" },
            zIndex: 1000,
            textTransform: "none",
          }}
          onClick={() => setShowCreateHouse(true)}
        >
          <AddIcon sx={{ mr: 1 }} />
          Add Class
        </Fab>
      )}

      {/* CREATE HOUSE MODAL */}
      {showCreateHouse && (
        <CreateHouseModal
          open={showCreateHouse}
          onClose={() => setShowCreateHouse(false)}
          onCreated={() => {
            setShowCreateHouse(false);
            if (onHouseCreated) onHouseCreated();
          }}
        />
      )}
    </Box>
  );
}
