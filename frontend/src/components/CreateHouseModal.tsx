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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { api, getImageUrl } from "../api/client";
import { useToast } from "../context/ToastContext";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast } = useToast();

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
      setLogoFile(null);
      setErrors({});
    } else if (!house && open) {
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

      showToast(
        house ? "Class updated successfully" : "Class created successfully",
        "success",
      );

      onClose();
    } catch (err: any) {
      showToast(
        house ? "Failed to update class" : "Failed to create class",
        "error",
      );
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          setErrors({ general: detail });
        } else if (Array.isArray(detail)) {
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
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
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
      <Box display="flex" flexDirection="column" height="100%">
        {/* DRAG HANDLE for mobile */}
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
            px: isMobile ? 2 : 3,
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
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: { xs: 2, sm: 3 },
            py: 2,
            pb: isMobile
              ? "calc(16px + env(safe-area-inset-bottom) + 80px)" // ensure last input not hidden
              : 2,
          }}
        >
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
            px: 2,
            pt: 2,
            pb: "calc(env(safe-area-inset-bottom) + 16px)",
            display: "flex",
            gap: 1.5,
            flexDirection: isMobile ? "column" : "row",
            position: "sticky",
            bottom: 0,
            bgcolor: "white",
          }}
        >
          <Button variant="contained" fullWidth size="large" onClick={submit}>
            {house ? "Update" : "Create"}
          </Button>
          <Button fullWidth size="large" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
