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
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

interface NavButton {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  path?: string; // added for route-aware mobile nav
}

interface LayoutProps {
  user: { name: string; email: string };
  onLogout: () => void;
  navButtons: NavButton[];
  children: ReactNode;
}

export default function Layout({
  user,
  onLogout,
  navButtons,
  children,
}: LayoutProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  // Determine active index for mobile BottomNavigation
  const activeIndex = navButtons.findIndex((btn) => {
    if (btn.path) {
      // exact match with current pathname
      return btn.path === location.pathname;
    }
    return btn.active;
  });

  return (
    <>
      {/* ================= APP BAR ================= */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1.5, sm: 2 },
          }}
        >
          {/* LOGO */}
          <Typography fontWeight={700} color="black">
            BrightPoints
          </Typography>

          {/* DESKTOP NAV */}
          {!isMobile && (
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
                  startIcon={btn.icon}
                  variant={btn.active ? "contained" : "text"}
                  onClick={btn.onClick}
                  sx={{
                    textTransform: "none",
                    color: btn.active ? "#fff" : "#000",
                    bgcolor: btn.active ? "primary.main" : "transparent",
                    "&:hover": {
                      bgcolor: btn.active ? "primary.dark" : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {btn.label}
                </Button>
              ))}
            </Box>
          )}

          {/* AVATAR */}
          <Avatar
            sx={{ bgcolor: "#1976d2", cursor: "pointer" }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {user.name ? user.name[0] : "U"}
          </Avatar>

          {/* MENU */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography fontWeight={600}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email.split("@")[0]}@***
              </Typography>
            </Box>

            <Divider />

            <MenuItem
              onClick={() => {
                window.location.href = "/dashboard/profile";
                setAnchorEl(null);
              }}
            >
              Profile
            </MenuItem>

            <MenuItem onClick={onLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ================= CONTENT ================= */}
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 2, md: 3 },
          mb: { xs: 8, md: 3 }, // space for bottom nav
          px: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            bgcolor: "white",
            p: { xs: 2, md: 3 },
            borderRadius: 2,
          }}
        >
          {children}
        </Box>
      </Container>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      {isMobile && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <BottomNavigation
            showLabels
            value={activeIndex >= 0 ? activeIndex : null}
          >
            {navButtons.map((btn, idx) => (
              <BottomNavigationAction
                key={idx}
                label={btn.label}
                icon={btn.icon}
                value={idx}
                onClick={btn.onClick}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </>
  );
}
