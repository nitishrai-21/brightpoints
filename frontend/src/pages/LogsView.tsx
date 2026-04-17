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
import { useState } from "react";

import PointsList from "../components/PointsList";
import SkeletonList from "../components/SkeletonList";
import { hasPermission } from "../permissions";

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
  page,
  setPage,
  filters,
  setFilters,
  loading,
}: any) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [filtersVisible, setFiltersVisible] = useState(false);

  // SAFE DEFAULT (prevents crash in HouseDetails)
  const safeFilters = filters ?? {
    search: "",
    teacher: "",
    house: "",
    minPoints: "",
    maxPoints: "",
  };

  const handleFilterChange = (key: string, value: string) => {
    if (!setFilters || !setPage) return;

    setFilters((prev: any) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const FiltersContent = (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <TextField
        fullWidth={isMobile}
        size="small"
        placeholder="Teacher name..."
        value={safeFilters.teacher}
        onChange={(e) => handleFilterChange("teacher", e.target.value)}
      />

      <Select
        fullWidth={isMobile}
        size="small"
        value={safeFilters.house}
        onChange={(e) => handleFilterChange("house", e.target.value)}
      >
        <MenuItem value="">Select House...</MenuItem>
        {houses.map((h: any) => (
          <MenuItem key={h.id} value={h.id}>
            {h.name}
          </MenuItem>
        ))}
      </Select>

      <TextField
        size="small"
        type="number"
        placeholder="Min points"
        value={safeFilters.minPoints}
        onChange={(e) => handleFilterChange("minPoints", e.target.value)}
      />

      <TextField
        size="small"
        type="number"
        placeholder="Max points"
        value={safeFilters.maxPoints}
        onChange={(e) => handleFilterChange("maxPoints", e.target.value)}
      />

      <Button
        variant="outlined"
        onClick={() => {
          const reset = {
            search: "",
            teacher: "",
            house: "",
            minPoints: "",
            maxPoints: "",
          };
          setFilters?.(reset);
          setPage?.(1);
        }}
      >
        Reset Filters
      </Button>
    </Stack>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Points Log
        </Typography>

        {!isMobile && (
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setFiltersVisible((p: any) => !p)}>
              Filters
            </Button>

            {hasPermission(role, "ADD_POINTS") && (
              <Button variant="contained" onClick={onAddPoints}>
                + Add Points
              </Button>
            )}
          </Stack>
        )}
      </Stack>

      {!isMobile && (
        <Collapse in={filtersVisible}>
          <Paper sx={{ p: 2, mb: 2 }}>{FiltersContent}</Paper>
        </Collapse>
      )}

      <Drawer
        anchor="bottom"
        open={isMobile && filtersVisible}
        onClose={() => setFiltersVisible(false)}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography>Filters</Typography>
          <IconButton onClick={() => setFiltersVisible(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        {FiltersContent}
      </Drawer>

      <Paper sx={{ p: 1 }}>
        {loading ? <SkeletonList /> : <PointsList logs={logs} />}

        <Stack direction="row" justifyContent="space-between" mt={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>{totalItems} items</Typography>

            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage?.(1); // ✅ FIX: safe call (prevents crash in HouseDetails)
              }}
              size="small"
              sx={{ minWidth: 90 }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Stack>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage?.(v)}
          />
        </Stack>
      </Paper>

      {isMobile && hasPermission(role, "ADD_POINTS") && (
        <Fab
          color="primary"
          onClick={onAddPoints}
          sx={{ position: "fixed", bottom: 80, right: 16 }}
        >
          <AddIcon />
        </Fab>
      )}

      {isMobile && (
        <Fab
          color="secondary"
          onClick={() => setFiltersVisible(true)}
          sx={{ position: "fixed", bottom: 150, right: 16 }}
        >
          <FilterListIcon />
        </Fab>
      )}
    </Box>
  );
}
