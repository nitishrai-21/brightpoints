// src/pages/UsersList.tsx
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { User } from "../types";
import { type Role } from "../permissions";

export default function UsersList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    role: "",
  });

  // ---------------- CONFIRMATION STATE ----------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    id: number;
    updates: Partial<User>;
  } | null>(null);

  // ---------------- LOAD USERS ----------------
  const loadUsers = async () => {
    const res = await api.get(
      `/auth/users?page=${page}&limit=${pageSize}&search=${filters.search}&role=${filters.role}`,
    );

    setUsers(res.data.users);
    setTotalPages(res.data.total_pages);
  };

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, filters]);

  // ---------------- UPDATE FLOW ----------------
  const requestUpdate = (id: number, updates: Partial<User>) => {
    setPendingUpdate({ id, updates });
    setConfirmOpen(true);
  };

  const confirmUpdate = async () => {
    if (!pendingUpdate) return;

    const { id, updates } = pendingUpdate;

    // optimistic UI
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    );

    try {
      await api.put(`/auth/users/${id}`, updates);
    } catch (err) {
      console.error(err);
      loadUsers(); // rollback
    }

    setConfirmOpen(false);
    setPendingUpdate(null);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Users
      </Typography>

      {/* FILTERS */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            size="small"
            fullWidth={isMobile}
            placeholder="Search..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
              }))
            }
          />

          <Select
            size="small"
            fullWidth={isMobile}
            value={filters.role}
            displayEmpty
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                role: e.target.value as string,
              }))
            }
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="student">Student</MenuItem>
          </Select>
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 3 }}>
        {/* DESKTOP TABLE */}
        {!isMobile && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Email</b>
                  </TableCell>
                  <TableCell>
                    <b>Class</b>
                  </TableCell>
                  <TableCell>
                    <b>Role</b>
                  </TableCell>
                  <TableCell>
                    <b>Active</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u?.house_name}</TableCell>
                    {/* ROLE EDIT */}
                    <TableCell>
                      <Select
                        size="small"
                        value={u.role}
                        onChange={(e) =>
                          requestUpdate(u.id, {
                            role: e.target.value as Role,
                          })
                        }
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="teacher">Teacher</MenuItem>
                        <MenuItem value="student">Student</MenuItem>
                      </Select>
                    </TableCell>

                    {/* ACTIVE TOGGLE */}
                    <TableCell>
                      <Switch
                        checked={u.is_active ?? true}
                        onChange={(e) =>
                          requestUpdate(u.id, {
                            is_active: e.target.checked,
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* MOBILE CARDS */}
        {isMobile && (
          <Stack spacing={1} p={1}>
            {users.map((u) => (
              <Card key={u.id} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography fontWeight={600}>{u.name}</Typography>
                    <Typography variant="body2">{u.email}</Typography>
                    <Typography>{u?.house_name}</Typography>
                    <Select
                      size="small"
                      value={u.role}
                      onChange={(e) =>
                        requestUpdate(u.id, {
                          role: e.target.value as Role,
                        })
                      }
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="teacher">Teacher</MenuItem>
                      <MenuItem value="student">Student</MenuItem>
                    </Select>

                    <Stack direction="row" alignItems="center">
                      <Typography variant="body2">Active</Typography>
                      <Switch
                        checked={u.is_active ?? true}
                        onChange={(e) =>
                          requestUpdate(u.id, {
                            is_active: e.target.checked,
                          })
                        }
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* FOOTER */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          p={2}
        >
          <Select
            size="small"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <MenuItem value={10}>10 / page</MenuItem>
            <MenuItem value={25}>25 / page</MenuItem>
            <MenuItem value={50}>50 / page</MenuItem>
          </Select>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            size={isMobile ? "small" : "medium"}
          />
        </Stack>
      </Paper>

      {/* ---------------- CONFIRM DIALOG ---------------- */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Update</DialogTitle>

        <DialogContent>
          Are you sure you want to apply this change?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmUpdate}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
