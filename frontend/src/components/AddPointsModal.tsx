// src/components/AddPointsModal.tsx
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { api } from "../api/client";

export default function AddPointsModal({
  open,
  onClose,
  houses,
  houseId,
  onSuccess,
}: any) {
  const [points, setPoints] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [selectedHouse, setSelectedHouse] = useState(houseId);
  const [date, setDate] = useState("");
  const [isEvent, setIsEvent] = useState(false);

  const submit = async () => {
    await api.post("/points", {
      house_id: selectedHouse,
      points: Number(points),
      reason,
      date_awarded: date || null,
      awarded_at_event: isEvent,
    });

    onSuccess?.();

    // Reset form fields
    setPoints("");
    setReason("");
    setSelectedHouse(houseId || ""); // optional fallback
    setDate("");
    setIsEvent(false);

    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          borderLeft: "1px solid #e5e7eb",
          bgcolor: "#fff",
        },
      }}
    >
      <Box display="flex" flexDirection="column" height="100%">
        {/* HEADER */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography fontWeight={600} fontSize={16}>
            Award Points
          </Typography>

          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* BODY */}
        <Box flex={1} overflow="auto" px={3} py={2}>
          {/* SECTION */}
          {/* <Typography fontWeight={600} fontSize={10} mb={1}>
            Awarded by
          </Typography>

          <Typography fontSize={10} color="#6b7280" mb={2}>
            Teacher: Sanne van Luik
          </Typography> */}

          <Stack spacing={2}>
            {/* CLASS */}
            <Box>
              <Typography fontWeight={600} fontSize={10} mb={0.5}>
                Select class
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
              >
                {houses.map((h: any) => (
                  <MenuItem key={h.id} value={h.id}>
                    {h.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* DATE */}
            <Box>
              <Typography fontWeight={600} fontSize={10} mb={0.5}>
                Date
              </Typography>

              <TextField
                type="date"
                fullWidth
                size="small"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* POINTS */}
            <Box>
              <Typography fontWeight={600} fontSize={10} mb={0.5}>
                Points
              </Typography>

              <TextField
                fullWidth
                size="small"
                type="number"
                value={points}
                onChange={(e) =>
                  setPoints(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </Box>

            {/* REASON */}
            <Box>
              <Typography fontWeight={600} fontSize={10} mb={0.5}>
                Reason
              </Typography>

              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Box>

            {/* TOGGLE */}
            {/* <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
            >
              <Typography fontWeight={600} fontSize={10}>
                Awarded at event
              </Typography>

              <Switch
                checked={isEvent}
                onChange={(e) => setIsEvent(e.target.checked)}
                size="small"
              />
            </Box> */}
          </Stack>
        </Box>

        {/* FOOTER */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: 2,
          }}
        >
          <Button variant="contained" fullWidth onClick={submit}>
            Submit
          </Button>

          <Button fullWidth onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
