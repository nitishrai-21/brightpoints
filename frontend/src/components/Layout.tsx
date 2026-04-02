// src/components/Layout.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Container,
} from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";

interface LayoutProps {
  user: { name: string; email: string };
  onLogout: () => void;
  navButtons: {
    label: string;
    active: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
  onNavigate?: (view: "dashboard" | "teacher" | "student" | "profile") => void;
  children: ReactNode;
}

export default function Layout({
  user,
  onLogout,
  navButtons,
  onNavigate,
  children,
}: LayoutProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "white", borderBottom: "1px solid #e5e7eb", height: 64 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography fontWeight={600} color="black">
            BrightPoints
          </Typography>

          {/* NAVIGATION */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              bgcolor: "#f3f4f6",
              p: "6px",
              borderRadius: "12px",
            }}
          >
            {navButtons.map((btn, idx) => (
              <Button
                key={idx}
                startIcon={btn.icon} // icon on the left
                variant={btn.active ? "contained" : "text"}
                onClick={btn.onClick}
                sx={{
                  textTransform: "none",
                  mr: 1,
                  color: btn.active ? "#fff" : "#000", // text color
                  bgcolor: btn.active ? "primary.main" : "transparent", // background when active
                  "&:hover": {
                    bgcolor: btn.active ? "primary.dark" : "rgba(0,0,0,0.04)", // hover effect
                  },
                  "& .MuiButton-startIcon": {
                    color: btn.active ? "#fff" : "#000", // icon color matches text
                  },
                }}
              >
                {btn.label}
              </Button>
            ))}
          </Box>

          {/* AVATAR */}
          <Box>
            <Avatar
              sx={{ bgcolor: "#1976d2", cursor: "pointer" }}
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              {user.name ? user.name[0] : "U"}
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography fontWeight={600}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email.split("@")[0]}@***
                </Typography>
              </Box>

              <Divider />
              {/* ✅ Profile menu */}
              <MenuItem
                onClick={() => {
                  onNavigate?.("profile"); // Switch to profile view
                  setAnchorEl(null);
                }}
              >
                Profile
              </MenuItem>

              <MenuItem onClick={onLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* CONTENT */}
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2 }}>{children}</Box>
      </Container>
    </>
  );
}
