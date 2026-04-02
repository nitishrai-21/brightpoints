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
import type { TeacherViewProps } from "../types";
import ErrorPage from "../components/ErrorPage";

export default function TeacherView({
  logs,
  totalPages,
  totalItems,
  pageSize,
  setPageSize,
  loadLogs,
  onAddPoints,
  houses,
  role,
  user,
}: TeacherViewProps) {
  // ---------------- Role check ----------------
  if (role !== "teacher") {
    return (
      <ErrorPage
        code={403}
        message="Access denied. Only teachers can view this page."
      />
    );
  }

  // ---------------- Local state ----------------
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
  const [localLoading, setLocalLoading] = useState(false); // local loading state

  const activeRequest = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  // ---------------- Debounce filters ----------------
  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(t);
  }, [filters]);

  // ---------------- Fetch logs ----------------
  const fetchLogs = async (
    houseId?: number,
    pageNumber = 1,
    limit = pageSize,
    search = "",
    teacherName = "",
    minPoints?: number,
    maxPoints?: number,
  ) => {
    setLocalLoading(true);
    try {
      await loadLogs(
        houseId,
        pageNumber,
        limit,
        search,
        teacherName,
        minPoints,
        maxPoints,
      );
    } finally {
      setLocalLoading(false);
    }
  };

  // ---------------- Load logs on filter/page change ----------------
  useEffect(() => {
    // skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const key = `${debouncedFilters.house || "all"}-${page}-${pageSize}-${debouncedFilters.search}-${debouncedFilters.teacher}-${debouncedFilters.minPoints}-${debouncedFilters.maxPoints}`;
    if (activeRequest.current === key) return;
    activeRequest.current = key;

    fetchLogs(
      debouncedFilters.house ? Number(debouncedFilters.house) : undefined,
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
  ]); // note: removed loadLogs and loading from deps

  // ---------------- Handle filter input changes ----------------
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // ---------------- Render ----------------
  return (
    <Box>
      {/* Header and Add Button */}
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
          <Button
            variant="outlined"
            onClick={() => setFiltersVisible((prev) => !prev)}
          >
            {filtersVisible ? "Close Filters" : "Filters"}
          </Button>
          <Button variant="contained" onClick={onAddPoints}>
            + Add
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Collapse in={filtersVisible}>
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexWrap="wrap"
            alignItems="center"
          >
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

      {/* Logs List */}
      <Paper sx={{ p: 1, borderRadius: 3 }}>
        {localLoading ? <SkeletonList /> : <PointsList logs={logs} />}
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
