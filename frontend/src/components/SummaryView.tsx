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

interface House {
  id: number;
  name: string;
  total_points: number;
  logo_url: string | null;
  description?: string;
}

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

  const getMedalNumber = (i: number) => i + 1;
  const getMedalColor = (i: number) => {
    if (i === 0) return "#FFD700";
    if (i === 1) return "#C0C0C0";
    if (i === 2) return "#CD7F32";
    return "#6366f1";
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);
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
        {/* Add House Button */}
        <Button variant="contained" onClick={() => setShowCreateHouse(true)}>
          ➕ Add House
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {sorted.map((house, i) => {
          const points = Math.max(0, house.total_points);
          const percentage = totalPoints > 0 ? (points / totalPoints) * 100 : 0;
          const logoSrc = house.logo_url
            ? house.logo_url.startsWith("http")
              ? house.logo_url
              : `${backendBase}${house.logo_url}`
            : `/images/default-house.png`;
          const isExpanded = expandedId === house.id;

          return (
            <Box key={house.id} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",
                }}
                onClick={() => setExpandedId(isExpanded ? null : house.id)}
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
                        backgroundColor: "#6366f1",
                      },
                    }}
                  />
                </Box>

                <Typography
                  sx={{ ml: 1, fontSize: 12, color: "text.secondary" }}
                >
                  {percentage.toFixed(1)}%
                </Typography>

                <IconButton size="small">
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 1, ml: 10 }}>
                  <Typography variant="body2" color="text.secondary">
                    {house.description || "No description available."}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Paper>

      {/* Create House Drawer */}
      {showCreateHouse && (
        <CreateHouseModal
          open={showCreateHouse} // ✅ added open prop
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
