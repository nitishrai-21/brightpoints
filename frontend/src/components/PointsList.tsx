// src/components/PointsList.tsx
import { Box, Typography } from "@mui/material";

interface PointsListProps {
  logs: any[];
}

export default function PointsList({ logs }: PointsListProps) {
  // Helper: get background color for points
  const getPointsStyle = (points: number) => {
    if (points > 0) {
      return { bg: "#dcfce7", color: "#166534" }; // bright green
    } else if (points < 0) {
      return { bg: "#fee2e2", color: "#991b1b" }; // bright red
    }
    return { bg: "#f3f4f6", color: "#374151" }; // neutral gray
  };

  return (
    <Box>
      {logs.map((log) => {
        const pointsStyle = getPointsStyle(log.points);

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
              "&:hover": {
                backgroundColor: "#f9fafb",
              },
            }}
          >
            <Box>
              <Typography
                fontSize={10}
                color="#2563eb"
                fontWeight={600}
                mb={0.5}
              >
                {new Date(log.awarded_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>

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
                  }}
                >
                  {log.points > 0 ? "+" : ""}
                  {log.points}
                </Box>
                to {log.house_name}
              </Typography>

              <Typography fontSize={10} color="text.secondary">
                {log.teacher_name}
                {log.reason ? ` • ${log.reason}` : ""}
              </Typography>
            </Box>

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
