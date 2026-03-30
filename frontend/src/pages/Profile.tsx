// src/pages/Profile.tsx
import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  Divider,
} from "@mui/material";
import { api } from "../api/client";

interface ProfileProps {
  user: {
    name: string;
    email: string;
    role: string;
    school_id?: number;
  };
  onUserUpdate: (updatedUser: any) => void;
}

export default function Profile({ user, onUserUpdate }: ProfileProps) {
  const [displayName, setDisplayName] = useState(user.name || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/auth/me", { display_name: displayName });
      setSaved(true);
      setError("");
      onUserUpdate({ ...user, name: displayName });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save display name");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Profile
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Left Column - Logo / Image */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed #ccc",
              borderRadius: 2,
              minHeight: 300, // adjust to match card height
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Logo Here
            </Typography>
          </Box>

          {/* Right Column - Profile Info */}
          <Box sx={{ flex: 2, display: "flex", flexDirection: "column" }}>
            {/* Alerts */}
            {saved && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Profile updated!
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Form Fields */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                fullWidth
              />
              <TextField label="Email" value={user.email} disabled fullWidth />
              <TextField label="Role" value={user.role} disabled fullWidth />
            </Box>

            {/* Save Button */}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
