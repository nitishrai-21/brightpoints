// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LoginSuccess from "./pages/LoginSuccess";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { api } from "./api/client";
import ErrorPage from "./components/ErrorPage";
import RequireAuth from "./auth/RequireAuth";

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ---------------- FIX 2: safer logout (global-safe) ----------------
  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    delete api.defaults.headers.common["Authorization"];

    window.location.href = "/"; // ensures full reset
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedRefresh = localStorage.getItem("refresh_token");
      // no refresh token → show login page
      if (!storedRefresh) {
        setAuthLoading(false);
        return;
      }

      try {
        // immediately validate/refresh token
        const res = await api.post("/auth/refresh", {
          refresh_token: storedRefresh,
        });

        setAccessToken(res.data.access_token);
        setRefreshToken(res.data.refresh_token);

        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);

        api.defaults.headers.common["Authorization"] =
          `Bearer ${res.data.access_token}`;
      } catch (err) {
        // expired refresh token
        logout();
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  // ---------------- FIX 3: sync localStorage changes ----------------
  useEffect(() => {
    const syncAuth = () => {
      setAccessToken(localStorage.getItem("access_token"));
      setRefreshToken(localStorage.getItem("refresh_token"));
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // ---------------- FIX 4: refresh interval (no stale closure) ----------------
  useEffect(() => {
    if (!refreshToken) return;

    const interval = setInterval(
      async () => {
        try {
          const res = await api.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          setAccessToken(res.data.access_token);
          setRefreshToken(res.data.refresh_token);

          localStorage.setItem("access_token", res.data.access_token);
          localStorage.setItem("refresh_token", res.data.refresh_token);
        } catch (err) {
          logout();
        }
      },
      4 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [refreshToken]);

  // ---------------- FIX 5: keep axios header in sync ----------------
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [accessToken]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* ---------------- FIX 6: login redirect stays safe ---------------- */}
          <Route
            path="/"
            element={
              accessToken ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  onLogin={(a, r) => {
                    setAccessToken(a);
                    setRefreshToken(r);

                    localStorage.setItem("access_token", a);
                    localStorage.setItem("refresh_token", r);
                  }}
                />
              )
            }
          />

          <Route
            path="/login-success"
            element={
              <LoginSuccess setTokens={{ setAccessToken, setRefreshToken }} />
            }
          />

          {/* ---------------- FIX 7: route protection (IMPORTANT) ---------------- */}
          <Route
            path="/dashboard/*"
            element={
              <RequireAuth>
                <Dashboard
                  setAccessToken={setAccessToken}
                  setRefreshToken={setRefreshToken}
                  onLogout={logout}
                />
              </RequireAuth>
            }
          />

          <Route
            path="*"
            element={<ErrorPage code={404} message="Page not found" />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
