import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
  },
  palette: {
    background: {
      default: "#f5f6fa",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 500,
        },
        contained: {
          backgroundColor: "#2563eb",
          "&:hover": {
            backgroundColor: "#1d4ed8",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
          },
        },
      },
    },
  },
});
