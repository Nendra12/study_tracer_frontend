import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SmoothDropdown from '../SmoothDropdown';
import SmoothKota from '../SmoothKota';
import { adminApi } from '../../../api/admin'; 

export default function FilterSebaran({
  showFilters, setShowFilters, loadingFilters, filterOptions,
  activeFilters, handleFilterChange, handleApplyFilters, handleResetFilters
}) {
  const [kotaList, setKotaList] = useState([]);
  const [loadingKota, setLoadingKota] = useState(false);

  // Fetch & Filter Data Kota secara dinamis
  useEffect(() => {
    const fetchKota = async () => {
      setLoadingKota(true);
      try {
        const res = activeFilters.provinsi_id 
          ? await adminApi.getKota(activeFilters.provinsi_id) 
          : await adminApi.getKota();
          
        let cities = res.data?.data || res.data || [];

        // JARING PENGAMAN: Filter ulang manual jika backend me-return semua kota
        if (activeFilters.provinsi_id && cities.length > 50) {
          cities = cities.filter(k => 
            String(k.id_provinsi) === String(activeFilters.provinsi_id) || 
            String(k.provinsi?.id) === String(activeFilters.provinsi_id) ||
            String(k.provinsi_id) === String(activeFilters.provinsi_id)
          );
        }
        
        setKotaList(cities);
      } catch (error) {
        console.error("Gagal memuat daftar kota", error);
        setKotaList([]);
      } finally {
        setLoadingKota(false);
      }
    };
    
    if (showFilters) {
      fetchKota();
    }
  }, [showFilters, activeFilters.provinsi_id]);

  if (!showFilters) return null;

  const mapOptions = (arr, labelKey = 'nama') => ["Semua", ...(arr?.map(i => i[labelKey]) || [])];
  const getItemLabel = (item) => item?.nama || item?.nama_perusahaan || item?.label || '';
  
  const formatKotaOptions = () => {
    return [
      { value: 'Semua', label: 'Semua' },
      ...(kotaList.map(k => ({ value: String(k.id), label: k.nama })) || [])
    ];
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300 relative z-[50]">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <h3 className="font-bold text-primary text-lg">Saring Sebaran Peta</h3>
        <button onClick={() => setShowFilters(false)} className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {loadingFilters ? (
        <div className="flex items-center gap-3 text-sm text-primary font-bold">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
          Memuat pilihan filter...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-6 items-start">
          
          <div className="relative z-[80] focus-within:z-[100] w-full">
            <SmoothDropdown
              label="Tipe Karir"
              options={["Semua", ...(filterOptions?.tipe_karir?.map(i => i.label) || [])]}
              value={filterOptions?.tipe_karir?.find(i => i.key === activeFilters.tipe_karir)?.label || "Semua"}
              onSelect={(val) => {
                if (val === "Semua") handleFilterChange('tipe_karir', '');
                else {
                  const found = filterOptions?.tipe_karir?.find(i => i.label === val);
                  handleFilterChange('tipe_karir', found ? found.key : '');
                }
              }}
              isSearchable={false}
            />
          </div>

          <div className="relative z-[70] focus-within:z-[100] w-full">
            <SmoothDropdown
              label="Angkatan Lulus"
              options={["Semua", ...(filterOptions?.angkatan?.map(String) || [])]}
              value={activeFilters.angkatan ? String(activeFilters.angkatan) : "Semua"}
              onSelect={(val) => handleFilterChange('angkatan', val === "Semua" ? '' : val)}
              isSearchable={true}
            />
          </div>

          <div className="relative z-[60] focus-within:z-[100] w-full">
            <SmoothDropdown
              label="Provinsi"
              options={mapOptions(filterOptions?.provinsi)}
              value={filterOptions?.provinsi?.find(i => String(i.id) === String(activeFilters.provinsi_id))?.nama || "Semua"}
              onSelect={(val) => {
                if (val === "Semua") {
                  handleFilterChange('provinsi_id', '');
                  handleFilterChange('kota_id', ''); 
                } else {
                  const found = filterOptions?.provinsi?.find(i => i.nama === val);
                  handleFilterChange('provinsi_id', found ? String(found.id) : '');
                  handleFilterChange('kota_id', ''); 
                }
              }}
              isSearchable={true}
            />
          </div>

          {/* PERBAIKAN TUNTAS: Memaksa label jadi inline + button mt-3 & p-3 agar tinggi dan gapnya SAMA PERSIS dengan SmoothDropdown */}
          <div className="relative z-[50] focus-within:z-[100] w-full [&_label]:!mb-0 [&_label]:!inline [&_button]:!h-auto [&_button]:!mt-3 [&_button]:!p-3 [&_button]:!bg-white [&_button]:!border-2 [&_button]:!border-gray-100 [&_button]:!rounded-xl [&_button_span]:!text-sm [&_button_span]:!font-medium [&_button_span]:!text-primary/80 [&_button_svg]:scale-125 [&_button_svg]:!text-gray-400 [&_button:focus]:!ring-0 [&_button]:!shadow-none">
            <SmoothKota
              label="Kota / Kabupaten"
              isSearchable={true}
              options={formatKotaOptions()}
              value={activeFilters.kota_id ? String(activeFilters.kota_id) : "Semua"}
              onSelect={(val) => {
                if (val === "Semua" || val === "") handleFilterChange('kota_id', '');
                else handleFilterChange('kota_id', val);
              }}
            />
            {loadingKota && <span className="absolute right-10 top-[42px] text-[10px] text-primary italic bg-white px-1 pointer-events-none">memuat...</span>}
          </div>

          <div className="relative z-[40] focus-within:z-[100] w-full">
            <SmoothDropdown
              label="Perusahaan"
              options={[
                { value: 'Semua', label: 'Semua' },
                ...((filterOptions?.perusahaan || []).map((item) => ({
                  value: String(item.id),
                  label: getItemLabel(item),
                }))),
              ]}
              value={activeFilters.perusahaan_id ? String(activeFilters.perusahaan_id) : 'Semua'}
              onSelect={(val) => {
                if (val === "Semua") handleFilterChange('perusahaan_id', '');
                else handleFilterChange('perusahaan_id', String(val));
              }}
              isSearchable={true}
            />
          </div>

          <div className="relative z-[30] focus-within:z-[100] w-full">
            <SmoothDropdown
              label="Universitas"
              options={mapOptions(filterOptions?.universitas)}
              value={filterOptions?.universitas?.find(i => String(i.id) === String(activeFilters.universitas_id))?.nama || "Semua"}
              onSelect={(val) => {
                if (val === "Semua") handleFilterChange('universitas_id', '');
                else {
                  const found = filterOptions?.universitas?.find(i => i.nama === val);
                  handleFilterChange('universitas_id', found ? String(found.id) : '');
                }
              }}
              isSearchable={true}
            />
          </div>

          <div className="relative z-[20] focus-within:z-[100] w-full">
            <SmoothDropdown
              label="Jurusan SMK"
              options={mapOptions(filterOptions?.jurusan)}
              value={filterOptions?.jurusan?.find(i => String(i.id) === String(activeFilters.jurusan_id))?.nama || "Semua"}
              onSelect={(val) => {
                if (val === "Semua") handleFilterChange('jurusan_id', '');
                else {
                  const found = filterOptions?.jurusan?.find(i => i.nama === val);
                  handleFilterChange('jurusan_id', found ? String(found.id) : '');
                }
              }}
              isSearchable={true}
            />
          </div>

          <div className="relative z-[10] focus-within:z-[100] w-full">
            <SmoothDropdown
              label="Bidang Usaha"
              options={mapOptions(filterOptions?.bidang_usaha)}
              value={filterOptions?.bidang_usaha?.find(i => String(i.id) === String(activeFilters.bidang_usaha_id))?.nama || "Semua"}
              onSelect={(val) => {
                if (val === "Semua") handleFilterChange('bidang_usaha_id', '');
                else {
                  const found = filterOptions?.bidang_usaha?.find(i => i.nama === val);
                  handleFilterChange('bidang_usaha_id', found ? String(found.id) : '');
                }
              }}
              isSearchable={true}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-4 border-t border-gray-100 relative z-0">
        <button
          onClick={handleApplyFilters}
          className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all cursor-pointer shadow-md shadow-primary/20 w-full sm:w-auto"
        >
          Terapkan Filter
        </button>
        <button
          onClick={handleResetFilters}
          className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer w-full sm:w-auto"
        >
          Reset Pilihan
        </button>
      </div>
    </div>
  );
}