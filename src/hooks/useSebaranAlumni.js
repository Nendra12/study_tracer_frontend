import { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../api/admin';

export function useSebaranAlumni() {
  const [markers, setMarkers] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [totalMarkers, setTotalMarkers] = useState(0);
  const [totalAlumni, setTotalAlumni] = useState(0);

  const [loadingMarkers, setLoadingMarkers] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({});
  const searchTimeout = useRef(null);

  const fetchMarkers = useCallback(async (filterParams = {}) => {
    setLoadingMarkers(true);
    setError(null);

    try {
      const res = await adminApi.getSebaranMarkers(filterParams);
      const data = res.data?.data || res.data;

      setMarkers(data?.markers || []);
      setBounds(data?.bounds || null);
      setTotalMarkers(data?.total_markers || 0);
      setTotalAlumni(data?.total_alumni || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data marker');
      console.error('fetchMarkers error:', err);
    } finally {
      setLoadingMarkers(false);
    }
  }, []);

  const fetchLocationDetail = useCallback(async (type, entityId) => {
    setLoadingDetail(true);

    try {
      const res = await adminApi.getSebaranLocationDetail(type, entityId, filters);
      const data = res.data?.data || res.data;
      setSelectedLocation(data || null);
      return data;
    } catch (err) {
      console.error('fetchLocationDetail error:', err);
      return null;
    } finally {
      setLoadingDetail(false);
    }
  }, [filters]);

  const fetchFilterOptions = useCallback(async () => {
    setLoadingFilters(true);

    try {
      const res = await adminApi.getSebaranFilters();
      setFilterOptions(res.data?.data || res.data || null);
    } catch (err) {
      console.error('fetchFilterOptions error:', err);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  const fetchStats = useCallback(async (filterParams = {}) => {
    setLoadingStats(true);

    try {
      const res = await adminApi.getSebaranStats(filterParams);
      setStats(res.data?.data || res.data || null);
    } catch (err) {
      console.error('fetchStats error:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchHeatmap = useCallback(async (filterParams = {}) => {
    try {
      const res = await adminApi.getSebaranHeatmap(filterParams);
      setHeatmapData(res.data?.data || res.data || []);
    } catch (err) {
      console.error('fetchHeatmap error:', err);
    }
  }, []);

  const searchLocation = useCallback((query, type = null) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await adminApi.searchSebaranLocation(query, type);
        setSearchResults(res.data?.data || res.data || []);
      } catch (err) {
        console.error('searchLocation error:', err);
      }
    }, 300);
  }, []);

  const applyFilters = useCallback((newFilters) => {
    const cleanFilters = {};

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        cleanFilters[key] = value;
      }
    });

    setFilters(cleanFilters);
    setSelectedLocation(null);
    fetchMarkers(cleanFilters);
    fetchStats(cleanFilters);
    fetchHeatmap(cleanFilters);
  }, [fetchMarkers, fetchStats, fetchHeatmap]);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSelectedLocation(null);
    setSearchResults([]);
    fetchMarkers({});
    fetchStats({});
    fetchHeatmap({});
  }, [fetchMarkers, fetchStats, fetchHeatmap]);

  const handleMarkerClick = useCallback(async (marker) => {
    const typeMap = {
      bekerja: 'perusahaan',
      kuliah: 'universitas',
      wirausaha: 'wirausaha',
    };

    const apiType = typeMap[marker.type] || marker.type;
    return fetchLocationDetail(apiType, marker.entity_id);
  }, [fetchLocationDetail]);

  useEffect(() => {
    fetchFilterOptions();
    fetchMarkers({});
    fetchStats({});
    fetchHeatmap({});
  }, [fetchFilterOptions, fetchMarkers, fetchStats, fetchHeatmap]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return {
    markers,
    bounds,
    stats,
    filterOptions,
    selectedLocation,
    heatmapData,
    searchResults,
    totalMarkers,
    totalAlumni,
    filters,
    loadingMarkers,
    loadingDetail,
    loadingStats,
    loadingFilters,
    error,
    applyFilters,
    resetFilters,
    handleMarkerClick,
    searchLocation,
    fetchMarkers,
    fetchStats,
    setSelectedLocation,
    setSearchResults,
  };
}
