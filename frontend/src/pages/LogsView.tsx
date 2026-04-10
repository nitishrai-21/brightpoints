// src/pages/LogsView.tsx
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
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Fab,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

import PointsList from "../components/PointsList";
import SkeletonList from "../components/SkeletonList";
import type { LogsViewProps } from "../types";
import { canAddPoints } from "../permissions";
import { useToast } from "../context/ToastContext";
import ErrorPage from "../components/ErrorPage";

export default function LogsView({
  logs,
  totalPages,
  totalItems,
  pageSize,
  setPageSize,
  loadLogs,
  onAddPoints,
  houses,
  role,
}: LogsViewProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showToast } = useToast();

  // ---------------- Role check ----------------
  // if (role !== "teacher") {
  //   return (
  //     <ErrorPage
  //       code={403}
  //       message="Access denied. Only teachers can view this page."
  //     />
  //   );
  // }

  // ---------------- State ----------------
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
  const [loading, setLoading] = useState(false);

  // ---------------- Debounce filters ----------------
  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(t);
  }, [filters]);

  // ---------------- Fetch logs ----------------
  const fetchLogs = async () => {
    setLoading(true);

    try {
      await loadLogs(
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
      );

      console.log("success");
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        showToast("You are not allowed to view logs (403)", "error");
      } else {
        showToast("Failed to load logs", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, debouncedFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  // ---------------- Filter content ----------------
  const FiltersContent = (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      flexWrap={{ xs: "nowrap", sm: "wrap" }}
      alignItems="center"
    >
      <TextField
        fullWidth={isMobile}
        size="small"
        placeholder="Teacher name..."
        value={filters.teacher}
        onChange={(e) => handleFilterChange("teacher", e.target.value)}
      />

      <Select
        fullWidth={isMobile}
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
        fullWidth={isMobile}
        size="small"
        type="number"
        placeholder="Min points"
        value={filters.minPoints}
        onChange={(e) => handleFilterChange("minPoints", e.target.value)}
      />

      <TextField
        fullWidth={isMobile}
        size="small"
        type="number"
        placeholder="Max points"
        value={filters.maxPoints}
        onChange={(e) => handleFilterChange("maxPoints", e.target.value)}
      />

      <Button
        fullWidth={isMobile}
        variant="outlined"
        onClick={() => {
          const resetFilters = {
            search: "",
            teacher: "",
            house: "",
            minPoints: "",
            maxPoints: "",
          };
          setFilters(resetFilters);
          setDebouncedFilters(resetFilters); // Update immediately for fetch
          setPage(1);
        }}
      >
        Reset Filters
      </Button>
    </Stack>
  );

  // ---------------- Render ----------------
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

        {!isMobile && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => setFiltersVisible((prev) => !prev)}
            >
              {filtersVisible ? "Close Filters" : "Filters"}
            </Button>
            {canAddPoints(role) && (
              <Button variant="contained" onClick={onAddPoints}>
                + Add Points
              </Button>
            )}
          </Stack>
        )}
      </Stack>

      {/* DESKTOP FILTERS */}
      {!isMobile && (
        <Collapse in={filtersVisible}>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>{FiltersContent}</Paper>
        </Collapse>
      )}

      {/* MOBILE FILTER DRAWER */}
      <Drawer
        anchor="bottom"
        open={isMobile && filtersVisible}
        onClose={() => setFiltersVisible(false)}
        PaperProps={{
          sx: {
            maxHeight: "80vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 2,
          },
        }}
      >
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography fontWeight={600}>Filters</Typography>
          <IconButton onClick={() => setFiltersVisible(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {FiltersContent}
      </Drawer>

      {/* LIST */}
      <Paper sx={{ p: 1, borderRadius: 3 }}>
        {loading ? <SkeletonList /> : <PointsList logs={logs} />}

        {/* FOOTER */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mt={3}
        >
          {/* LEFT SIDE */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography>{totalItems} items</Typography>

            {/* PAGE SIZE */}
            <Select
              size="small"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              sx={{ minWidth: 90 }}
            >
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={25}>25 / page</MenuItem>
              <MenuItem value={50}>50 / page</MenuItem>
            </Select>
          </Stack>

          {/* PAGINATION */}
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            size={isMobile ? "small" : "medium"}
          />
        </Stack>
      </Paper>

      {/* MOBILE FABs */}
      {isMobile && (
        <>
          {canAddPoints(role) && (
            <Fab
              variant="extended"
              color="primary"
              sx={{
                position: "fixed",
                bottom: 80,
                right: 16,
                zIndex: 1000,
                textTransform: "none",
              }}
              onClick={onAddPoints}
            >
              <AddIcon sx={{ mr: 1 }} />
              Add Points
            </Fab>
          )}
          <Fab
            variant="extended"
            color="secondary"
            sx={{
              position: "fixed",
              bottom: 150,
              right: 16,
              zIndex: 1000,
              textTransform: "none",
            }}
            onClick={() => setFiltersVisible(true)}
          >
            <FilterListIcon sx={{ mr: 1 }} />
            Filters
          </Fab>
        </>
      )}
    </Box>
  );
}
