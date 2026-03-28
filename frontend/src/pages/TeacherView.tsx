// src/pages/TeacherView.tsx
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Pagination,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PointsList from "../components/PointsList";
import SkeletonList from "../components/SkeletonList";

interface TeacherViewProps {
  selectedHouse: any;
  logs: any[];
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  loadLogs: (
    houseId?: any,
    page?: number,
    limit?: number,
    search?: string,
  ) => Promise<void>;
  loading: boolean;
  onAddPoints: () => void;
  houses: any[];
  setSelectedHouse: (house: any) => void;
}

export default function TeacherView({
  selectedHouse,
  logs,
  totalPages,
  totalItems,
  pageSize,
  setPageSize,
  loadLogs,
  loading,
  onAddPoints,
  houses,
  setSelectedHouse,
}: TeacherViewProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const activeRequest = useRef<string | null>(null);

  // debounce search input
  useEffect(() => {
    setPage(1);
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // load logs when selectedHouse, page, pageSize, or search changes
  useEffect(() => {
    const key = `${selectedHouse?.id || "all"}-${page}-${pageSize}-${debouncedSearch}`;
    if (activeRequest.current === key) return;
    activeRequest.current = key;

    loadLogs(selectedHouse?.id, page, pageSize, debouncedSearch).finally(() => {
      activeRequest.current = null;
    });
  }, [page, pageSize, selectedHouse, debouncedSearch]);

  return (
    <Box>
      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          Points Log
        </Typography>

        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" onClick={onAddPoints}>
            + Add
          </Button>
        </Stack>
      </Stack>

      {/* CARD */}
      <Paper sx={{ p: 1, borderRadius: 3 }}>
        {loading ? <SkeletonList /> : <PointsList logs={logs} />}

        {/* PAGINATION */}
        <Stack direction="row" justifyContent="space-between" mt={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>{totalItems} items</Typography>
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
          </Stack>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
          />
        </Stack>
      </Paper>
    </Box>
  );
}
