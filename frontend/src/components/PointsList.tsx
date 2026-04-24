// src/components/PointsList.tsx
import { Box, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface PointsListProps {
  logs: any[];
}

export default function PointsList({ logs }: PointsListProps) {
  const getPointsStyle = (points: number) => {
    if (points > 0) return { bg: "#dcfce7", color: "#166534" };
    if (points < 0) return { bg: "#fee2e2", color: "#991b1b" };
    return { bg: "#f3f4f6", color: "#374151" };
  };

  // house color helper (simple + safe fallback)
  const getHouseColor = (houseName?: string) => {
    switch (houseName) {
      case "Gryffindor":
        return "#ef4444";
      case "Slytherin":
        return "#22c55e";
      case "Ravenclaw":
        return "#3b82f6";
      case "Hufflepuff":
        return "#eab308";
      default:
        return "#cbd5e1";
    }
  };

  return (
    <Box>
      {logs.map((log) => {
        const pointsStyle = getPointsStyle(log.points);
        const houseColor = getHouseColor(log.house_name);

        const isPositive = log.points >= 0;

        return (
          <Box
            key={log.id}
            sx={{
              mb: 0.2,
              p: 0.8,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              position: "relative",
              "&:hover": {
                backgroundColor: "#f9fafb",
              },
            }}
          >
            {/* LEFT HOUSE COLOR BAR */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: 4,
                backgroundColor: houseColor,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }}
            />

            <Box sx={{ pl: 1.5 }}>
              {/* DATE */}
              <Typography
                fontSize={10}
                color="#2563eb"
                fontWeight={600}
                mb={0.5}
              >
                <Box component="span" sx={{ color: "#2563eb" }}>
                  Event Date:{" "}
                </Box>
                {new Date(log.awarded_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>

              {/* MAIN LINE */}
              <Typography fontWeight={600} fontSize={12} mb={0.5}>
                <Box
                  component="span"
                  sx={{
                    mr: 1,
                    px: 1.2,
                    borderRadius: 2,
                    fontSize: 10,
                    fontWeight: 600,
                    color: pointsStyle.color,
                    backgroundColor: pointsStyle.bg,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {isPositive ? (
                    <TrendingUpIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 14 }} />
                  )}

                  {log.points > 0 ? "+" : ""}
                  {log.points}
                </Box>
                to {log.house_name}
              </Typography>

              {/* FOOTER */}
              <Typography fontSize={10} color="text.secondary">
                {log.teacher_name}
                {log.reason ? ` • ${log.reason}` : ""}
              </Typography>
              <Typography fontSize={9} color="text.secondary">
                Recorded on:{" "}
                {new Date(log.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
            </Box>

            {/* ACTION MENU */}
            <Typography
              color="#9ca3af"
              sx={{ fontSize: 16, cursor: "pointer" }}
            >
              ⋯
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
