import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LoginSuccess from "./pages/LoginSuccess";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { api } from "./api/client";
import ErrorPage from "./components/ErrorPage";

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token"),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refresh_token"),
  );

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  useEffect(() => {
    const interval = setInterval(
      async () => {
        if (!refreshToken) return logout();

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

  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [accessToken]);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              accessToken ? (
                <Navigate to="/dashboard" />
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
          <Route
            path="/dashboard/*"
            element={
              accessToken ? (
                <Dashboard
                  setAccessToken={setAccessToken}
                  setRefreshToken={setRefreshToken}
                />
              ) : (
                <Navigate to="/" />
              )
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
