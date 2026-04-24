//src/components/SummaryView.tsx
import { useState, useEffect, useRef, useLayoutEffect } from "react";
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
  onRefresh?: () => void;
  isPublic?: boolean;
}

export default function SummaryView({
  houses,
  role,
  onHouseCreated,
  onRefresh,
  isPublic = false,
}: SummaryViewProps) {
  const sorted = [...houses].sort((a, b) => b.total_points - a.total_points);

  const totalPoints = sorted.reduce(
    (sum, h) => sum + Math.max(0, h.total_points),
    0,
  );

  const navigate = useNavigate();
  const [showCreateHouse, setShowCreateHouse] = useState(false);

  useEffect(() => {
    if (!isPublic) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, 10000);

    return () => clearInterval(interval);
  }, [isPublic, onRefresh]);

  const positions = useRef(new Map<number, DOMRect>());

  const setItemRef = (id: number) => (el: HTMLDivElement | null) => {
    if (el) positions.current.set(id, el.getBoundingClientRect());
  };

  useLayoutEffect(() => {
    if (!isPublic) return;

    requestAnimationFrame(() => {
      const newPositions = new Map<number, DOMRect>();

      sorted.forEach((house) => {
        const el = document.getElementById(`house-${house.id}`);
        if (el) newPositions.set(house.id, el.getBoundingClientRect());
      });

      newPositions.forEach((newBox, id) => {
        const oldBox = positions.current.get(id);
        const el = document.getElementById(`house-${id}`);

        if (!oldBox || !el) return;

        const deltaY = oldBox.top - newBox.top;

        if (deltaY !== 0) {
          el.style.willChange = "transform";

          el.animate(
            [
              { transform: `translate3d(0, ${deltaY}px, 0)` },
              { transform: "translate3d(0, 0, 0)" },
            ],
            {
              duration: 700,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
            },
          );
        }
      });

      positions.current = newPositions;
    });
  }, [houses, isPublic]);

  const getMedalNumber = (i: number) => i + 1;

  const getMedalColor = (i: number) => {
    if (i === 0) return "#FFD700";
    if (i === 1) return "#C0C0C0";
    if (i === 2) return "#CD7F32";
    return "#6366f1";
  };

  return (
    <Box sx={{ position: "relative", pb: isPublic ? 0 : { xs: 12, sm: 0 } }}>
      {/* HEADER */}
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

        {!isPublic && hasPermission(role, "ADD_CLASSES") && (
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

      {/* LEADERBOARD */}
      <Box>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {sorted.map((house, i) => {
            const points = Math.max(0, house.total_points);
            const percentage =
              totalPoints > 0 ? (points / totalPoints) * 100 : 0;

            const logoSrc = getImageUrl(house.logo_url) || undefined;

            return (
              <Box
                key={house.id}
                id={`house-${house.id}`}
                ref={setItemRef(house.id)}
                sx={{
                  mb: 3,
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                    cursor: !isPublic ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (!isPublic) {
                      navigate(`/dashboard/house/${house.id}`);
                    }
                  }}
                >
                  {/* MEDAL */}
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
                    }}
                  >
                    {getMedalNumber(i)}
                  </Box>

                  {/* AVATAR */}
                  <Avatar
                    src={logoSrc}
                    sx={{
                      width: { xs: 40, sm: 48 }, // optional polish
                      height: { xs: 40, sm: 48 },
                    }}
                  >
                    {house.name[0]}
                  </Avatar>

                  {/* NAME + BAR */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap", //
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
                        mt: 0.5,
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            (house as any).class_color || "#6366f1",
                          transition: "width 0.6s ease",
                        },
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      ml: { xs: 0, sm: 1 },
                      width: { xs: "100%", sm: "auto" },
                      textAlign: { xs: "right", sm: "left" },
                      fontSize: 12,
                      color: "text.secondary",
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Paper>
      </Box>

      {/* FAB */}
      {!isPublic && hasPermission(role, "ADD_CLASSES") && (
        <Fab
          variant="extended"
          color="primary"
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            display: { xs: "flex", sm: "none" },
            zIndex: 1000,
          }}
          onClick={() => setShowCreateHouse(true)}
        >
          <AddIcon sx={{ mr: 1 }} />
          Add Class
        </Fab>
      )}

      {/* MODAL */}
      {showCreateHouse && (
        <CreateHouseModal
          open={showCreateHouse}
          onClose={() => setShowCreateHouse(false)}
          onCreated={() => {
            setShowCreateHouse(false);
            onHouseCreated?.();
          }}
        />
      )}
    </Box>
  );
}
