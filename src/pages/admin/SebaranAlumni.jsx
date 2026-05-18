import React, { useMemo, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Search, Filter, UserCircle2 } from 'lucide-react';
import { useSebaranAlumni } from '../../hooks/useSebaranAlumni';

import StatSebaran from '../../components/admin/sebaran/StatSebaran';
import TopSebaran from '../../components/admin/sebaran/TopSebaran';
import FilterSebaran from '../../components/admin/sebaran/FilterSebaran';
import MapSebaran from '../../components/admin/sebaran/MapSebaran';

import SkeletonSebaran from '../../components/admin/skeleton/SkeletonSebaran';
import UpButton from '../../components/alumni/UpButton';

export default function SebaranAlumni() {
  const {
    markers, bounds, stats, filterOptions, selectedLocation,
    totalMarkers, totalAlumni, loadingMarkers, loadingDetail, loadingFilters,
    applyFilters, resetFilters, handleMarkerClick, searchLocation, searchResults, setSearchResults,
    searchAlumni, alumniSearchResults, setAlumniSearchResults,
  } = useSebaranAlumni();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alumniSearchQuery, setAlumniSearchQuery] = useState('');
  const [flyTo, setFlyTo] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    tipe_karir: '', angkatan: '', perusahaan_id: '', universitas_id: '',
    provinsi_id: '', jurusan_id: '', kota_id: '', bidang_usaha_id: '',
  });
  const alumniSearchRef = useRef(null);
  const defaultApplied = useRef(false);

  // Set default filter angkatan = tahun terbaru saat filterOptions pertama kali dimuat
  useEffect(() => {
    if (!defaultApplied.current && filterOptions?.angkatan?.length > 0) {
      defaultApplied.current = true;
      const latestYear = String(Math.max(...filterOptions.angkatan));
      const defaultFilters = { ...activeFilters, angkatan: latestYear };
      setActiveFilters(defaultFilters);
      applyFilters(defaultFilters);
    }
  }, [filterOptions]);

  const handleFilterChange = (keyOrObj, value) => {
    setActiveFilters((prev) => {
      const nextFilters = typeof keyOrObj === 'object' ? { ...prev, ...keyOrObj } : { ...prev, [keyOrObj]: value };

      // Map langsung update
      setTimeout(() => applyFilters(nextFilters), 0);

      return nextFilters;
    });
  };

  const handleApplyFilters = () => { applyFilters(activeFilters); setShowFilters(false); };

  const handleResetFilters = () => {
    setActiveFilters({ tipe_karir: '', angkatan: '', perusahaan_id: '', universitas_id: '', provinsi_id: '', jurusan_id: '', kota_id: '', bidang_usaha_id: '' });
    setSearchQuery(''); setSearchResults([]); resetFilters(); setShowFilters(false);
    setAlumniSearchQuery(''); setAlumniSearchResults([]);
    setFlyTo(null);
  };

  const handleSearch = (e) => {
    const q = e.target.value; setSearchQuery(q); searchLocation(q);
  };

  const handleAlumniSearch = (e) => {
    const q = e.target.value;
    setAlumniSearchQuery(q);
    searchAlumni(q);
    // Kalau query dihapus, reset filter alumni_id
    if (!q) {
      const updates = { ...activeFilters, alumni_id: '' };
      setActiveFilters(updates);
      applyFilters(updates);
    }
  };

  const handleAlumniSelect = (alumni) => {
    const namaAlumni = alumni.nama || alumni.name || `Alumni #${alumni.id}`;
    setAlumniSearchQuery(namaAlumni);
    setAlumniSearchResults([]);

    // Cari lokasi alumni langsung dari markers yang sudah dimuat (alumni_preview)
    const alumniId = alumni.id;
    const matchingMarkers = markers.filter((m) =>
      m.alumni_preview?.some((a) => 
        String(a.id) === String(alumniId) || String(a.id_alumni) === String(alumniId)
      )
    );

    if (matchingMarkers.length > 0) {
      // Fly langsung ke marker pertama yang mengandung alumni ini
      const target = matchingMarkers[0];
      setFlyTo({ lat: target.latitude, lng: target.longitude, zoom: 14, _t: Date.now() });
    } else {
      // Fallback: jika tidak ditemukan di preview, tetap apply filter dan tunggu backend
      const updates = { ...activeFilters, alumni_id: alumniId };
      setActiveFilters(updates);
      applyFilters(updates);
    }
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter((v) => v !== '' && v !== null).length;
  }, [activeFilters]);

  // Tutup dropdown alumni search saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (alumniSearchRef.current && !alumniSearchRef.current.contains(e.target)) {
        setAlumniSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // LOGIKA LOADING SKELETON
  // Tampilkan skeleton JIKA sedang memuat data pertama kali DAN markers masih kosong/belum ada
  const isInitialLoading = loadingMarkers && (!markers || markers.length === 0) && (!stats);

  // Alert jika hasil filter kosong
  useEffect(() => {
    if (!loadingMarkers && !isInitialLoading && activeFilterCount > 0 && totalMarkers === 0) {
      toast.error('Tidak ada data yang sesuai dengan filter', {
        id: 'empty-filter', 
        duration: 4000,
      });
    }
  }, [loadingMarkers, isInitialLoading, activeFilterCount, totalMarkers]);

  if (isInitialLoading) {
    return <SkeletonSebaran />;
  }

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <StatSebaran stats={stats} />

      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm relative z-[60]">
        {/* SEARCH NAMA ALUMNI */}
        <div className="relative w-full flex-1" ref={alumniSearchRef}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={alumniSearchQuery}
            onChange={handleAlumniSearch}
            placeholder="Cari nama alumni..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
          {alumniSearchQuery && (
            <button
              onClick={() => {
                setAlumniSearchQuery('');
                setAlumniSearchResults([]);
                setFlyTo(null);
                const updates = { ...activeFilters, alumni_id: '' };
                setActiveFilters(updates);
                applyFilters(updates);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none cursor-pointer"
            >
              ×
            </button>
          )}
          {alumniSearchResults.length > 0 && (
            <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-[100] max-h-60 overflow-y-auto py-2">
              {alumniSearchResults.map((alumni) => (
                <button
                  key={alumni.id}
                  onClick={() => handleAlumniSelect(alumni)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  {alumni.foto_url || alumni.foto ? (
                    <img
                      src={alumni.foto_url || alumni.foto}
                      alt={alumni.nama}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserCircle2 size={18} className="text-primary/60" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary truncate">{alumni.nama || alumni.name}</p>
                    {alumni.angkatan && (
                      <p className="text-xs text-gray-400">Angkatan {alumni.angkatan}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setShowFilters(!showFilters)} className={`w-full md:w-auto flex justify-center items-center shrink-0 gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeFilterCount > 0 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white border border-gray-200 text-primary hover:bg-gray-50'}`}>
          <Filter size={16} /> Filter Data
          {activeFilterCount > 0 && <span className="flex items-center justify-center min-w-5 h-5 px-1.5 bg-white text-primary text-[10px] rounded-full ml-1 shadow-sm">{activeFilterCount}</span>}
        </button>
      </div>

      {/* FILTER DROPDOWN COMPONENT */}
      <FilterSebaran showFilters={showFilters} setShowFilters={setShowFilters} loadingFilters={loadingFilters} filterOptions={filterOptions} activeFilters={activeFilters} handleFilterChange={handleFilterChange} handleApplyFilters={handleApplyFilters} handleResetFilters={handleResetFilters} />

      {/* PETA LEAFLET COMPONENT */}
      <MapSebaran markers={markers} bounds={bounds} loadingMarkers={loadingMarkers} loadingDetail={loadingDetail} selectedLocation={selectedLocation} handleMarkerClick={handleMarkerClick} totalMarkers={totalMarkers} totalAlumni={totalAlumni} flyTo={flyTo} />

      {/* TOP 5 COMPONENT */}
      <TopSebaran markers={markers} />
    </div>
  );
}