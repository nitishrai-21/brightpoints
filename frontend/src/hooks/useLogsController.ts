//src/hooks/useLogsController.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { Log } from "../types";

type Filters = {
  search: string;
  teacher: string;
  house: string;
  minPoints: string;
  maxPoints: string;
};

export function useLogsController(initialHouseId?: number) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    teacher: "",
    house: "",
    minPoints: "",
    maxPoints: "",
  });

  const houseIdRef = useRef<number | undefined>(initialHouseId);
  const requestRef = useRef(0);

  const setHouseId = (id?: number) => {
    houseIdRef.current = id;
  };

  const buildUrl = () => {
    let url = `/points?page=${page}&limit=${pageSize}`;

    const houseId = houseIdRef.current;
    if (houseId) url += `&houseId=${houseId}`;

    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.teacher)
      url += `&teacher=${encodeURIComponent(filters.teacher)}`;
    if (filters.minPoints) url += `&minPoints=${filters.minPoints}`;
    if (filters.maxPoints) url += `&maxPoints=${filters.maxPoints}`;

    return url;
  };

  const loadLogs = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);

    try {
      const res = await api.get(buildUrl());

      if (requestId !== requestRef.current) return;

      setLogs(res.data.data);
      setTotalPages(res.data.total_pages);
      setTotalItems(res.data.total);

      // FIX: prevent empty page issue
      if (page > res.data.total_pages) {
        setPage(1);
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const reload = useCallback(() => {
    loadLogs();
  }, [loadLogs]);

  return {
    logs,
    loading,

    page,
    setPage,

    pageSize,
    setPageSize,

    totalPages,
    totalItems,

    filters,
    setFilters,

    setHouseId,
    reload,
  };
}
