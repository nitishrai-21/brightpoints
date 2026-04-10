import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./context/ToastContext";
import ToastSnackbar from "./components/ToastSnackbar";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
      <ToastSnackbar />
    </ToastProvider>
  </React.StrictMode>,
);
