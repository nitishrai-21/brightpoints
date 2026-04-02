// src/components/CreateHouseModal.tsx
import { useState, useEffect } from "react";
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
import { api, getImageUrl } from "../api/client";
import type { House } from "../types";

interface CreateHouseModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback after house is created/updated
  house?: House | null; // for edit
}

export default function CreateHouseModal({
  open,
  onClose,
  onCreated,
  house,
}: CreateHouseModalProps) {
  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");
  const [description, setDescription] = useState("");
  const [classColor, setClassColor] = useState("#6366f1");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // field-level errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ---------------- Prefill (Edit Mode) ----------------
  useEffect(() => {
    if (house && open) {
      setName(house.name || "");
      setMotto(house.motto || "");
      setDescription(house.description || "");
      setClassColor(house.class_color || "#6366f1");
      setPreview(getImageUrl(house.logo_url));
      setLogoFile(null); // reset file input
      setErrors({});
    } else if (!house && open) {
      // Reset for create mode
      setName("");
      setMotto("");
      setDescription("");
      setClassColor("#6366f1");
      setLogoFile(null);
      setPreview(null);
      setErrors({});
    }
  }, [house, open]);

  // ---------------- File Upload ----------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  // ---------------- Submit ----------------
  const submit = async () => {
    setErrors({}); // reset errors

    if (!name.trim()) {
      setErrors({ name: "Class name is required" });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("motto", motto);
    formData.append("color", classColor);
    if (logoFile) formData.append("logo", logoFile);

    try {
      if (house) {
        await api.put(`/houses/${house.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/houses", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (onCreated) await onCreated();
      onClose();
    } catch (err: any) {
      // handle backend validation errors
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        // If detail is string, show as general error
        if (typeof detail === "string") {
          setErrors({ general: detail });
        } else if (Array.isArray(detail)) {
          // FastAPI returns array of errors for Pydantic validation
          const fieldErrors: { [key: string]: string } = {};
          detail.forEach((d: any) => {
            const field = d.loc?.[1] || "general";
            fieldErrors[field] = d.msg;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: "Validation error occurred" });
        }
      } else {
        setErrors({ general: "Failed to save class. Please try again." });
      }
    }
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
            {house ? "Edit Class" : "Add Class"}
          </Typography>

          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* BODY */}
        <Box flex={1} overflow="auto" px={3} py={2}>
          <Stack spacing={2}>
            {/* general error */}
            {errors.general && (
              <Typography color="error" fontSize={12}>
                {errors.general}
              </Typography>
            )}

            {/* Class Name */}
            <Box>
              <Typography fontWeight={600} fontSize={12} mb={0.5}>
                Class name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Class name"
                error={!!errors.name}
                helperText={errors.name}
              />
            </Box>

            {/* Class Motto */}
            <Box>
              <Typography fontWeight={600} fontSize={12} mb={0.5}>
                Class motto
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="Class motto"
                error={!!errors.motto}
                helperText={errors.motto}
              />
            </Box>

            {/* Class Color */}
            <Box>
              <Typography fontWeight={600} fontSize={12} mb={0.5}>
                Class color
              </Typography>
              <input
                type="color"
                value={classColor}
                onChange={(e) => setClassColor(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              />
            </Box>

            {/* Description */}
            <Box>
              <Typography fontWeight={600} fontSize={12} mb={0.5}>
                Class description
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Class description"
                error={!!errors.description}
                helperText={errors.description}
              />
            </Box>

            {/* Logo Upload */}
            <Box>
              <Typography fontWeight={600} fontSize={12} mb={0.5}>
                Class logo
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
              {errors.logo && (
                <Typography color="error" fontSize={12} mt={0.5}>
                  {errors.logo}
                </Typography>
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
            {house ? "Update" : "Create"}
          </Button>

          <Button fullWidth onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
