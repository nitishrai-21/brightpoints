// src/components/SummaryView.tsx
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Avatar,
  Collapse,
  IconButton,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CreateHouseModal from "./CreateHouseModal";
import { useNavigate } from "react-router-dom";
import type { House } from "../types";

interface SummaryViewProps {
  houses: House[];
  onHouseCreated?: () => void; // callback after house is created
}

export default function SummaryView({
  houses,
  onHouseCreated,
}: SummaryViewProps) {
  const sorted = [...houses].sort((a, b) => b.total_points - a.total_points);
  const totalPoints = sorted.reduce(
    (sum, h) => sum + Math.max(0, h.total_points),
    0,
  );

  const backendBase = "http://localhost:8000/static/icons/";
  const navigate = useNavigate();

  const getMedalNumber = (i: number) => i + 1;
  const getMedalColor = (i: number) => {
    if (i === 0) return "#FFD700";
    if (i === 1) return "#C0C0C0";
    if (i === 2) return "#CD7F32";
    return "#6366f1";
  };

  const [showCreateHouse, setShowCreateHouse] = useState(false);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Total Points
        </Typography>
        <Button variant="contained" onClick={() => setShowCreateHouse(true)}>
          + Add Class
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {sorted.map((house, i) => {
          const points = Math.max(0, house.total_points);
          const percentage = totalPoints > 0 ? (points / totalPoints) * 100 : 0;
          const logoSrc = (house as any).logo_url
            ? (house as any).logo_url.startsWith("http")
              ? (house as any).logo_url
              : `${backendBase}${(house as any).logo_url}`
            : `/images/default-house.png`;

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
