// src/pages/LoginSuccess.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";

interface Props {
  setTokens: {
    setAccessToken: (token: string) => void;
    setRefreshToken: (token: string) => void;
  };
}

export default function LoginSuccess({ setTokens }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      setTokens.setAccessToken(access_token);
      setTokens.setRefreshToken(refresh_token);

      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [location, navigate, setTokens]);

  return <div>Logging in...</div>;
}
