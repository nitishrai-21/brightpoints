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
  Collapse,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PointsList from "../components/PointsList";
import SkeletonList from "../components/SkeletonList";

interface TeacherViewProps {
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
    teacher?: string,
    minPoints?: number,
    maxPoints?: number,
  ) => Promise<void>;
  loading: boolean;
  onAddPoints: () => void;
  houses: any[];
}

export default function TeacherView({
  logs,
  totalPages,
  totalItems,
  pageSize,
  setPageSize,
  loadLogs,
  loading,
  onAddPoints,
  houses,
}: TeacherViewProps) {
  const [page, setPage] = useState(1);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    teacher: "",
    house: "",
    minPoints: "",
    maxPoints: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const activeRequest = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  // ---------------- Debounce filters (400ms) ----------------
  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(t);
  }, [filters]);

  // ---------------- Load logs when filters, page, or pageSize change ----------------
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // skip initial render
    }

    const key = `${debouncedFilters.house || "all"}-${page}-${pageSize}-${debouncedFilters.search}-${debouncedFilters.teacher}-${debouncedFilters.minPoints}-${debouncedFilters.maxPoints}`;
    if (activeRequest.current === key) return;
    activeRequest.current = key;

    loadLogs(
      debouncedFilters.house || undefined,
      page,
      pageSize,
      debouncedFilters.search,
      debouncedFilters.teacher,
      debouncedFilters.minPoints
        ? Number(debouncedFilters.minPoints)
        : undefined,
      debouncedFilters.maxPoints
        ? Number(debouncedFilters.maxPoints)
        : undefined,
    ).finally(() => {
      activeRequest.current = null;
    });
  }, [
    page,
    pageSize,
    debouncedFilters.house,
    debouncedFilters.search,
    debouncedFilters.teacher,
    debouncedFilters.minPoints,
    debouncedFilters.maxPoints,
    loadLogs,
  ]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // reset to first page on filter change
  };

  return (
    <Box>
      {/* ---------- HEADER: Title + Filter + Add Button ---------- */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          Points Log
        </Typography>

        <Stack direction="row" spacing={1}>
          {/* Toggle filters */}
          <Button
            variant="outlined"
            onClick={() => setFiltersVisible((prev) => !prev)}
          >
            {filtersVisible ? "Close Filters" : "Filters"}
          </Button>

          {/* Add points */}
          <Button variant="contained" onClick={onAddPoints}>
            + Add
          </Button>
        </Stack>
      </Stack>

      {/* ---------- FILTER PANEL ---------- */}
      <Collapse in={filtersVisible}>
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexWrap="wrap"
            alignItems="center"
          >
            {/* <TextField
              size="small"
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            /> */}
            <TextField
              size="small"
              placeholder="Teacher name..."
              value={filters.teacher}
              onChange={(e) => handleFilterChange("teacher", e.target.value)}
            />
            <Select
              size="small"
              value={filters.house}
              onChange={(e) => handleFilterChange("house", e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select House...
              </MenuItem>
              {houses.map((h) => (
                <MenuItem key={h.id} value={h.id}>
                  {h.name}
                </MenuItem>
              ))}
            </Select>
            <TextField
              size="small"
              type="number"
              placeholder="Min points"
              value={filters.minPoints}
              onChange={(e) => handleFilterChange("minPoints", e.target.value)}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Max points"
              value={filters.maxPoints}
              onChange={(e) => handleFilterChange("maxPoints", e.target.value)}
            />

            {/* ---------- RESET FILTERS BUTTON ---------- */}
            <Button
              variant="outlined"
              disabled={
                !filters.search &&
                !filters.teacher &&
                !filters.house &&
                !filters.minPoints &&
                !filters.maxPoints
              }
              onClick={() => {
                setFilters({
                  search: "",
                  teacher: "",
                  house: "",
                  minPoints: "",
                  maxPoints: "",
                });
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </Stack>
        </Paper>
      </Collapse>

      {/* ---------- LOGS LIST ---------- */}
      <Paper sx={{ p: 1, borderRadius: 3 }}>
        {loading ? <SkeletonList /> : <PointsList logs={logs} />}

        {/* ---------- PAGINATION ---------- */}
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
