// src/components/CreateHouseModal.tsx
import { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { api } from "../api/client";

interface CreateHouseModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback after house is created
}

export default function CreateHouseModal({
  open,
  onClose,
  onCreated,
}: CreateHouseModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const submit = async () => {
    if (!name.trim()) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (logoFile) formData.append("logo", logoFile);

    await api.post("/houses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (onCreated) await onCreated();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: 420, borderLeft: "1px solid #e5e7eb", bgcolor: "#fff" },
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
            Create House
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* BODY */}
        <Box flex={1} overflow="auto" px={3} py={2}>
          <Stack spacing={2}>
            {/* Name */}
            <Box>
              <Typography fontWeight={600} fontSize={12} mb={0.5}>
                Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="House name"
              />
            </Box>

            {/* Description */}
            <Box>
              <Typography fontWeight={600} fontSize={12} mb={0.5}>
                Description
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </Box>

            {/* Logo Upload */}
            <Box>
              <Typography fontWeight={600} fontSize={12} mb={0.5}>
                Logo (optional)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
                sx={{ textTransform: "none" }}
              >
                Upload Logo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>

              {/* Preview */}
              {preview && (
                <Box
                  sx={{
                    mt: 1,
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <img
                    src={preview}
                    alt="Logo Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}
            </Box>
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
            Create
          </Button>
          <Button fullWidth onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
