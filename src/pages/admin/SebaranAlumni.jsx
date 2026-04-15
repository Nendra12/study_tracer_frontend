import React, { useMemo, useState } from 'react';
import { Search, Filter, Building2, School } from 'lucide-react';
import { useSebaranAlumni } from '../../hooks/useSebaranAlumni';

// Import Komponen Kecil yang Baru Dibuat
import StatSebaran from '../../components/admin/sebaran/StatSebaran';
import TopSebaran from '../../components/admin/sebaran/TopSebaran';
import FilterSebaran from '../../components/admin/sebaran/FilterSebaran';
import MapSebaran from '../../components/admin/sebaran/MapSebaran';

export default function SebaranAlumni() {
  const {
    markers, bounds, stats, filterOptions, selectedLocation,
    totalMarkers, totalAlumni, loadingMarkers, loadingDetail, loadingFilters,
    applyFilters, resetFilters, handleMarkerClick, searchLocation, searchResults, setSearchResults,
  } = useSebaranAlumni();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    tipe_karir: '', angkatan: '', perusahaan_id: '', universitas_id: '',
    provinsi_id: '', jurusan_id: '', kota_id: '', bidang_usaha_id: '',
  });

  const handleFilterChange = (key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }));

  const handleApplyFilters = () => { applyFilters(activeFilters); setShowFilters(false); };

  const handleResetFilters = () => {
    setActiveFilters({ tipe_karir: '', angkatan: '', perusahaan_id: '', universitas_id: '', provinsi_id: '', jurusan_id: '', kota_id: '', bidang_usaha_id: '' });
    setSearchQuery(''); setSearchResults([]); resetFilters(); setShowFilters(false);
  };

  const handleSearch = (e) => {
    const q = e.target.value; setSearchQuery(q); searchLocation(q);
  };

  const handleSearchSelect = (result) => {
    const filterKey = result.type === 'perusahaan' ? 'perusahaan_id' : 'universitas_id';
    const updated = { ...activeFilters, [filterKey]: result.id };
    setActiveFilters(updated); applyFilters(updated); setSearchQuery(''); setSearchResults([]);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter((v) => v !== '' && v !== null).length;
  }, [activeFilters]);

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm relative z-[60]">
        <div className="relative w-full flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Cari nama perusahaan atau universitas..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          {searchResults.length > 0 && (
            <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-[100] max-h-60 overflow-y-auto py-2">
              {searchResults.map((result) => (
                <button key={`${result.type}-${result.id}`} onClick={() => handleSearchSelect(result)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                  <div className={`p-2 rounded-lg ${result.type === 'perusahaan' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                    {result.type === 'perusahaan' ? <Building2 size={16} /> : <School size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary truncate">{result.name}</p>
                    {result.kota && <p className="text-xs text-gray-400 truncate">{result.kota}</p>}
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

      {/* 4 STAT CARDS COMPONENT */}
      <StatSebaran stats={stats} />

      {/* PETA LEAFLET COMPONENT */}
      <MapSebaran markers={markers} bounds={bounds} loadingMarkers={loadingMarkers} loadingDetail={loadingDetail} selectedLocation={selectedLocation} handleMarkerClick={handleMarkerClick} totalMarkers={totalMarkers} totalAlumni={totalAlumni} />

      {/* TOP 5 COMPONENT */}
      <TopSebaran stats={stats} />
      
    </div>
  );
}