// src/components/AddPointsModal.tsx
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";

export default function AddPointsModal({
  open,
  onClose,
  houses,
  houseId,
  onSuccess,
}: any) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { showToast } = useToast();
  const [points, setPoints] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [selectedHouse, setSelectedHouse] = useState<number | "">(
    houseId ?? "",
  );
  const [date, setDate] = useState("");

  // Function to reset form
  const resetForm = () => {
    setPoints("");
    setReason("");
    setSelectedHouse(houseId ?? "");
    setDate("");
  };

  // Sync houseId if modal opens with a different value
  useEffect(() => {
    setSelectedHouse(houseId ?? "");
  }, [houseId]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const submit = async () => {
    if (!selectedHouse) {
      showToast("Please select a class", "warning");
      return;
    }

    try {
      await api.post("/points", {
        house_id: selectedHouse,
        points: Number(points),
        reason,
        date_awarded: date || null,
      });

      showToast("Points added successfully", "success");

      onSuccess?.();
      resetForm();
      onClose();
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        showToast("You are not allowed to add points", "error");
      } else if (status >= 500) {
        showToast("Server error. Please try again later", "error");
      } else {
        showToast("Failed to add points", "error");
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: isMobile
          ? {
              width: "100%",
              maxHeight: "90vh",
              minHeight: "50vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              display: "flex",
              flexDirection: "column",
            }
          : {
              width: 420,
              borderLeft: "1px solid #e5e7eb",
            },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* DRAG HANDLE (mobile UX) */}
        {isMobile && (
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: "#ccc",
              borderRadius: 2,
              mx: "auto",
              my: 1,
            }}
          />
        )}

        {/* HEADER */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography fontWeight={600}>Award Points</Typography>
          <IconButton onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* BODY */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: { xs: 2, sm: 3 },
            py: 2,
            // Add bottom padding so content doesn't go under the sticky footer
            pb: `calc(env(safe-area-inset-bottom) + 100px)`,
          }}
        >
          <Stack spacing={2.2}>
            {/* HOUSE */}
            <TextField
              select
              fullWidth
              size="small"
              label="Class"
              value={selectedHouse}
              onChange={(e) =>
                setSelectedHouse(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            >
              <MenuItem value="">Select class</MenuItem>
              {houses.map((h: any) => (
                <MenuItem key={h.id} value={h.id}>
                  {h.name}
                </MenuItem>
              ))}
            </TextField>

            {/* DATE */}
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {/* POINTS */}
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Points"
              value={points}
              onChange={(e) =>
                setPoints(e.target.value === "" ? "" : Number(e.target.value))
              }
            />

            {/* REASON */}
            <TextField
              fullWidth
              size="small"
              label="Reason"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Stack>
        </Box>

        {/* FOOTER */}
        <Box
          sx={{
            px: 2,
            pt: 2,
            pb: "calc(env(safe-area-inset-bottom) + 16px)",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: 1.5,
            flexDirection: isMobile ? "column" : "row",
            position: "sticky",
            bottom: 0,
            bgcolor: "white",
            zIndex: 10, // keep footer above content
          }}
        >
          <Button variant="contained" fullWidth size="large" onClick={submit}>
            Submit
          </Button>

          <Button fullWidth size="large" onClick={handleCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
