//src/pages/StudentView.tsx
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Avatar,
  Stack,
} from "@mui/material";
import type { House } from "../types";
import { type Role } from "../permissions";
import { getImageUrl } from "../api/client";

interface StudentViewProps {
  houses: House[];
  role?: Role;
}

export default function StudentView({ houses }: StudentViewProps) {
  const sorted = [...houses].sort((a, b) => b.total_points - a.total_points);
  const totalPoints = sorted.reduce(
    (sum, h) => sum + Math.max(0, h.total_points),
    0,
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        My Points
      </Typography>

      {sorted.map((house) => {
        const points = Math.max(0, house.total_points);
        const percentage = totalPoints > 0 ? (points / totalPoints) * 100 : 0;
        const logoSrc = getImageUrl(house.logo_url) || undefined;

        return (
          <Box key={house.id} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
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
                    "& .MuiLinearProgress-bar": { backgroundColor: "#6366f1" },
                  }}
                />
              </Box>

              <Typography sx={{ ml: 1, fontSize: 12, color: "text.secondary" }}>
                {percentage.toFixed(1)}%
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Paper>
  );
}
