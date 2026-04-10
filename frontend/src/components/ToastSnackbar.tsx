import { Snackbar, Alert } from "@mui/material";
import { useToast } from "../context/ToastContext";

export default function ToastSnackbar() {
  const { toast, hideToast } = useToast();

  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={3000}
      onClose={hideToast}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={toast.severity} onClose={hideToast} variant="filled">
        {toast.message}
      </Alert>
    </Snackbar>
  );
}
