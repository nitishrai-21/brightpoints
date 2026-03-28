// src/pages/Login.tsx
import {
  Container,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import { api } from "../api/client";

export default function Login({
  onLogin,
}: {
  onLogin: (a: string, r: string) => void;
}) {
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState<number | "">("");

  useEffect(() => {
    api.get("/schools").then((res) => {
      setSchools(res.data);
      setSchoolId("");
    });
  }, []);

  const handleSSOLogin = () => {
    if (!schoolId) return alert("Select a school first");
    window.location.href = `http://localhost:8000/auth/sso/${schoolId}`;
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 10, bgcolor: "white", p: 4, borderRadius: 3 }}
    >
      <Typography variant="h4" mb={3}>
        BrightPoints Login
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>School</InputLabel>
        <Select
          value={schoolId}
          label="School"
          onChange={(e) => setSchoolId(e.target.value)}
        >
          <MenuItem value="" disabled>
            Select your school
          </MenuItem>
          {schools.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        fullWidth
        onClick={handleSSOLogin}
        disabled={!schoolId}
      >
        Login with your school
      </Button>
    </Container>
  );
}
