import { useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Briefcase,
  Building2,
  Filter,
  GraduationCap,
  MapPin,
  School,
  Search,
  Store,
  Users,
  X,
} from 'lucide-react';
import { useSebaranAlumni } from '../../hooks/useSebaranAlumni';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createIcon = (color, emoji) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
    ">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const markerIcons = {
  bekerja: createIcon('#3b82f6', '💼'),
  kuliah: createIcon('#10b981', '🎓'),
  wirausaha: createIcon('#f59e0b', '🏪'),
};

function MapBoundsUpdater({ bounds }) {
  const map = useMap();

  if (bounds) {
    const leafletBounds = L.latLngBounds(
      [bounds.south, bounds.west],
      [bounds.north, bounds.east],
    );
    map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 15 });
  }

  return null;
}

function StatCard({ icon: Icon, label, value, color, percentage }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        {percentage !== undefined && <p className="text-xs text-gray-400">{percentage}%</p>}
      </div>
    </div>
  );
}

export default function SebaranAlumni() {
  const {
    markers,
    bounds,
    stats,
    filterOptions,
    selectedLocation,
    totalMarkers,
    totalAlumni,
    loadingMarkers,
    loadingDetail,
    loadingFilters,
    applyFilters,
    resetFilters,
    handleMarkerClick,
    searchLocation,
    searchResults,
    setSearchResults,
  } = useSebaranAlumni();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    tipe_karir: '',
    angkatan: '',
    perusahaan_id: '',
    universitas_id: '',
    provinsi_id: '',
    jurusan_id: '',
    kota_id: '',
    bidang_usaha_id: '',
  });

  const defaultCenter = [-2.5, 118.0];
  const defaultZoom = 5;

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    applyFilters(activeFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const empty = {
      tipe_karir: '',
      angkatan: '',
      perusahaan_id: '',
      universitas_id: '',
      provinsi_id: '',
      jurusan_id: '',
      kota_id: '',
      bidang_usaha_id: '',
    };

    setActiveFilters(empty);
    setSearchQuery('');
    setSearchResults([]);
    resetFilters();
    setShowFilters(false);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    searchLocation(q);
  };

  const handleSearchSelect = (result) => {
    const filterKey = result.type === 'perusahaan' ? 'perusahaan_id' : 'universitas_id';
    const updated = { ...activeFilters, [filterKey]: result.id };

    setActiveFilters(updated);
    applyFilters(updated);
    setSearchQuery('');
    setSearchResults([]);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter((v) => v !== '' && v !== null).length;
  }, [activeFilters]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Cari perusahaan, universitas..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSearchSelect(result)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    {result.type === 'perusahaan' ? (
                      <Building2 size={14} className="text-blue-500" />
                    ) : (
                      <School size={14} className="text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{result.name}</p>
                      {result.kota && <p className="text-xs text-gray-400">{result.kota}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeFilterCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Alumni Terpetakan"
            value={stats.total_alumni_mapped || 0}
            color="bg-indigo-500"
          />
          <StatCard
            icon={Briefcase}
            label="Bekerja"
            value={stats.breakdown?.bekerja?.count || 0}
            color="bg-blue-500"
            percentage={stats.breakdown?.bekerja?.percentage}
          />
          <StatCard
            icon={GraduationCap}
            label="Kuliah"
            value={stats.breakdown?.kuliah?.count || 0}
            color="bg-green-500"
            percentage={stats.breakdown?.kuliah?.percentage}
          />
          <StatCard
            icon={Store}
            label="Wirausaha"
            value={stats.breakdown?.wirausaha?.count || 0}
            color="bg-amber-500"
            percentage={stats.breakdown?.wirausaha?.percentage}
          />
        </div>
      )}

      {showFilters && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Filter Sebaran</h3>
            <button onClick={() => setShowFilters(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {loadingFilters ? (
            <p className="text-sm text-gray-500">Memuat opsi filter...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tipe Karir</label>
                <select
                  value={activeFilters.tipe_karir}
                  onChange={(e) => handleFilterChange('tipe_karir', e.target.value)}
                  className="w-full border rounded-lg py-2 px-3 text-sm"
                >
                  <option value="">Semua</option>
                  {filterOptions?.tipe_karir?.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Angkatan</label>
                <select
                  value={activeFilters.angkatan}
                  onChange={(e) => handleFilterChange('angkatan', e.target.value)}
                  className="w-full border rounded-lg py-2 px-3 text-sm"
                >
                  <option value="">Semua</option>
                  {filterOptions?.angkatan?.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Provinsi</label>
                <select
                  value={activeFilters.provinsi_id}
                  onChange={(e) => handleFilterChange('provinsi_id', e.target.value)}
                  className="w-full border rounded-lg py-2 px-3 text-sm"
                >
                  <option value="">Semua</option>
                  {filterOptions?.provinsi?.map((item) => (
                    <option key={item.id} value={item.id}>{item.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Kota</label>
                <select
                  value={activeFilters.kota_id}
                  onChange={(e) => handleFilterChange('kota_id', e.target.value)}
                  className="w-full border rounded-lg py-2 px-3 text-sm"
                >
                  <option value="">Semua</option>
                  {filterOptions?.kota?.map((item) => (
                    <option key={item.id} value={item.id}>{item.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Perusahaan</label>
                <select
                  value={activeFilters.perusahaan_id}
                  onChange={(e) => handleFilterChange('perusahaan_id', e.target.value)}
                  className="w-full border rounded-lg py-2 px-3 text-sm"
                >
                  <option value="">Semua</option>
                  {filterOptions?.perusahaan?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama} {item.alumni_count ? `(${item.alumni_count} alumni)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Universitas</label>
                <select
                  value={activeFilters.universitas_id}
                  onChange={(e) => handleFilterChange('universitas_id', e.target.value)}
                  className="w-full border rounded-lg py-2 px-3 text-sm"
                >
                  <option value="">Semua</option>
                  {filterOptions?.universitas?.map((item) => (
                    <option key={item.id} value={item.id}>{item.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jurusan SMK</label>
                <select
                  value={activeFilters.jurusan_id}
                  onChange={(e) => handleFilterChange('jurusan_id', e.target.value)}
                  className="w-full border rounded-lg py-2 px-3 text-sm"
                >
                  <option value="">Semua</option>
                  {filterOptions?.jurusan?.map((item) => (
                    <option key={item.id} value={item.id}>{item.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bidang Usaha</label>
                <select
                  value={activeFilters.bidang_usaha_id}
                  onChange={(e) => handleFilterChange('bidang_usaha_id', e.target.value)}
                  className="w-full border rounded-lg py-2 px-3 text-sm"
                >
                  <option value="">Semua</option>
                  {filterOptions?.bidang_usaha?.map((item) => (
                    <option key={item.id} value={item.id}>{item.nama}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleApplyFilters}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Terapkan Filter
            </button>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative" style={{ height: '600px' }}>
        {loadingMarkers && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapBoundsUpdater bounds={bounds} />

          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={markerIcons[marker.type] || markerIcons.bekerja}
              eventHandlers={{ click: () => handleMarkerClick(marker) }}
            >
              <Popup maxWidth={350} minWidth={280}>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium text-white ${
                        marker.type === 'bekerja'
                          ? 'bg-blue-500'
                          : marker.type === 'kuliah'
                            ? 'bg-green-500'
                            : 'bg-amber-500'
                      }`}
                    >
                      {marker.type === 'bekerja' ? 'Perusahaan' : marker.type === 'kuliah' ? 'Universitas' : 'Wirausaha'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base">{marker.entity_name}</h3>

                  {marker.kota && (
                    <p className="text-xs text-gray-500">
                      {marker.kota}
                      {marker.provinsi ? `, ${marker.provinsi}` : ''}
                    </p>
                  )}

                  <p className="text-sm font-semibold text-blue-600 mt-1">{marker.alumni_count} Alumni</p>

                  {marker.alumni_preview?.length > 0 && (
                    <div className="mt-2 flex -space-x-2">
                      {marker.alumni_preview.slice(0, 5).map((alumni) => (
                        <img
                          key={alumni.id}
                          src={alumni.foto_thumbnail || alumni.foto || '/default-avatar.png'}
                          alt={alumni.nama}
                          title={alumni.nama}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.png';
                          }}
                        />
                      ))}

                      {marker.alumni_count > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{marker.alumni_count - 5}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedLocation && selectedLocation.entity?.id === marker.entity_id ? (
                    <div className="mt-3 border-t pt-2 max-h-48 overflow-y-auto">
                      {loadingDetail ? (
                        <p className="text-xs text-gray-400">Memuat...</p>
                      ) : (
                        selectedLocation.alumni?.map((alumni) => (
                          <div key={alumni.id_alumni || alumni.id} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                            <img
                              src={alumni.foto_thumbnail || alumni.foto || '/default-avatar.png'}
                              alt={alumni.nama}
                              className="w-9 h-9 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/default-avatar.png';
                              }}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{alumni.nama}</p>
                              <p className="text-xs text-gray-400">
                                {alumni.jurusan} {alumni.tahun_masuk ? `• ${alumni.tahun_masuk}` : ''}
                              </p>
                              {alumni.detail?.posisi && <p className="text-xs text-blue-500">{alumni.detail.posisi}</p>}
                              {alumni.detail?.jurusan_kuliah && (
                                <p className="text-xs text-green-500">
                                  {alumni.detail.jurusan_kuliah} ({alumni.detail.jenjang})
                                </p>
                              )}
                              {alumni.detail?.nama_usaha && (
                                <p className="text-xs text-amber-500">
                                  {alumni.detail.nama_usaha} - {alumni.detail.bidang_usaha}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-blue-500 mt-2">Klik marker untuk lihat detail alumni.</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500" /> Bekerja
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500" /> Kuliah
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Wirausaha
        </span>
        <span className="sm:ml-auto text-gray-400">
          {totalMarkers} lokasi - {totalAlumni} alumni
        </span>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" />
              Top 5 Perusahaan
            </h3>
            <div className="space-y-2">
              {stats.top_perusahaan?.map((item, idx) => (
                <div key={`${item.nama}-${idx}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{idx + 1}. {item.nama}</span>
                  <span className="text-sm font-semibold text-blue-600">{item.alumni_count} alumni</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <School size={16} className="text-green-500" />
              Top 5 Universitas
            </h3>
            <div className="space-y-2">
              {stats.top_universitas?.map((item, idx) => (
                <div key={`${item.nama}-${idx}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{idx + 1}. {item.nama}</span>
                  <span className="text-sm font-semibold text-green-600">{item.alumni_count} alumni</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}