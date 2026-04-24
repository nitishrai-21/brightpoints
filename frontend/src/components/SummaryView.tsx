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

  // auto-refresh every 10s in public mode
  useEffect(() => {
    if (!isPublic) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, 10000);

    return () => clearInterval(interval);
  }, [isPublic, onRefresh]);

  const getMedalNumber = (i: number) => i + 1;

  const getMedalColor = (i: number) => {
    if (i === 0) return "#FFD700";
    if (i === 1) return "#C0C0C0";
    if (i === 2) return "#CD7F32";
    return "#6366f1";
  };

  // ================= FLIP ENGINE (MINIMAL + SAFE) =================
  const positions = useRef(new Map<number, DOMRect>());

  const setItemRef = (id: number) => (el: HTMLDivElement | null) => {
    if (el) {
      positions.current.set(id, el.getBoundingClientRect());
    }
  };

  useLayoutEffect(() => {
    if (!isPublic) return;

    const newPositions = new Map<number, DOMRect>();

    sorted.forEach((house) => {
      const el = document.getElementById(`house-${house.id}`);
      if (el) {
        newPositions.set(house.id, el.getBoundingClientRect());
      }
    });

    newPositions.forEach((newBox, id) => {
      const oldBox = positions.current.get(id);
      const el = document.getElementById(`house-${id}`);

      if (!oldBox || !el) return;

      const deltaY = oldBox.top - newBox.top;

      if (deltaY) {
        el.animate(
          [
            { transform: `translateY(${deltaY}px)` },
            { transform: "translateY(0px)" },
          ],
          {
            duration: 600,
            easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          },
        );
      }
    });

    positions.current = newPositions;
  }, [houses, isPublic]);

  return (
    <Box
      sx={{
        position: "relative",
        pb: isPublic ? 0 : { xs: 12, sm: 0 },
      }}
    >
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
        {isPublic ? (
          // ================= FLIP PUBLIC WIDGET VIEW =================
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {sorted.map((house, i) => {
              const points = Math.max(0, house.total_points);
              const percent =
                totalPoints > 0 ? (points / totalPoints) * 100 : 0;

              const isTop3 = i < 3;
              const isFirst = i === 0;

              return (
                <Box
                  key={house.id}
                  id={`house-${house.id}`}
                  ref={setItemRef(house.id)}
                >
                  <Paper
                    onClick={() => navigate(`/dashboard/house/${house.id}`)}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      transition: "box-shadow 0.3s ease",

                      boxShadow: isTop3 ? 5 : 1,

                      ...(isFirst && {
                        border: "2px solid #6366f1",
                      }),

                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 8,
                      },
                    }}
                  >
                    {/* background accent */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: (house as any).class_color || "#6366f1",
                        opacity: 0.08,
                      }}
                    />

                    {/* HEADER */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Avatar
                        src={getImageUrl(house.logo_url) || undefined}
                        sx={{ width: 44, height: 44 }}
                      >
                        {house.name[0]}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700}>
                          {house.name} {isFirst && "🔥"}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Rank #{i + 1}
                        </Typography>
                      </Box>
                    </Box>

                    {/* KPI */}
                    <Typography
                      sx={{
                        mt: 2,
                        fontSize: 28,
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {points.toLocaleString()}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      total points
                    </Typography>

                    {/* PROGRESS */}
                    <Box
                      sx={{
                        mt: 2,
                        height: 6,
                        borderRadius: 5,
                        background: "#e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percent}%`,
                          height: "100%",
                          background: (house as any).class_color || "#6366f1",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </Box>

                    {/* FOOTER */}
                    <Box
                      sx={{
                        mt: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "text.secondary",
                      }}
                    >
                      <span>{percent.toFixed(1)}% of total</span>
                      <span>click to open →</span>
                    </Box>
                  </Paper>
                </Box>
              );
            })}
          </Box>
        ) : (
          // ================= ORIGINAL (UNCHANGED) =================
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: isPublic ? "transparent" : undefined,
            }}
          >
            {sorted.map((house, i) => {
              const points = Math.max(0, house.total_points);
              const percentage =
                totalPoints > 0 ? (points / totalPoints) * 100 : 0;

              const logoSrc = getImageUrl(house.logo_url) || undefined;

              return (
                <Box key={house.id} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                    onClick={() => {
                      if (!isPublic) {
                        navigate(`/dashboard/house/${house.id}`);
                      }
                    }}
                  >
                    <Avatar src={logoSrc} sx={{ width: 48, height: 48 }}>
                      {house.name[0]}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
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
                          "& .MuiLinearProgress-bar": {
                            backgroundColor:
                              (house as any).class_color || "#6366f1",
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Paper>
        )}
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
            textTransform: "none",
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
