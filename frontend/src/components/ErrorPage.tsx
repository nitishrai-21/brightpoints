// src/components/ErrorPage.tsx
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ErrorPageProps {
  code?: number;
  message?: string;
  redirectTo?: string;
  redirectLabel?: string;
}

export default function ErrorPage({
  code = 404,
  message = "Page not found",
  redirectTo = "/dashboard",
  redirectLabel = "Go back to dashboard",
}: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        textAlign: "center",
        mt: 15,
        px: 2,
      }}
    >
      <Typography variant="h1" fontWeight={700}>
        {code}
      </Typography>
      <Typography variant="h5" fontWeight={500} mt={2} mb={4}>
        {message}
      </Typography>
      <Button variant="contained" onClick={() => navigate(redirectTo)}>
        {redirectLabel}
      </Button>
    </Box>
  );
}
