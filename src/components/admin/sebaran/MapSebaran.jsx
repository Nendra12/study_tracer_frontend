import React, { useEffect, useCallback, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { STORAGE_BASE_URL } from '../../../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const svgBriefcase = '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>';
const svgGraduation = '<path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.34a2 2 0 0 0-1.66 0l-8.57 2.744a2 2 0 0 0-.019 3.838l8.57 2.744a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>';
const svgStore = '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>';

const createIcon = (color, svgPath) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.15); cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const markerIcons = {
  bekerja: createIcon('#3b82f6', svgBriefcase),
  kuliah: createIcon('#10b981', svgGraduation),
  wirausaha: createIcon('#f59e0b', svgStore),
};

function MapBoundsUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      const leafletBounds = L.latLngBounds([bounds.south, bounds.west], [bounds.north, bounds.east]);
      map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bounds, map]);
  return null;
}

export default function MapSebaran({ markers, bounds, loadingMarkers, loadingDetail, selectedLocation, handleMarkerClick, totalMarkers, totalAlumni }) {
  const defaultCenter = [-2.5, 118.0];
  const defaultZoom = 5;

  // Track gambar yang gagal dimuat agar tidak infinite loop
  const [failedImages, setFailedImages] = useState(new Set());

  // Fallback avatar sebagai inline SVG data URI (tidak perlu file eksternal)
  const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='20' fill='%23e5e7eb'/%3E%3Cpath d='M20 22c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6zm0 3c-4 0-12 2-12 6v2h24v-2c0-4-8-6-12-6z' fill='%239ca3af'/%3E%3C/svg%3E";

  // Helper function untuk mendapatkan URL foto lengkap
  const getPhotoUrl = useCallback((photo) => {
    if (!photo) return null;
    
    // Jika sudah full URL (http/https), gunakan langsung
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    
    // Jika path relatif, tambahkan STORAGE_BASE_URL (bukan API_BASE_URL)
    const cleanPath = photo.replace(/^\/?storage\//, '').replace(/^\//, '');
    return `${STORAGE_BASE_URL}/${cleanPath}`;
  }, []);

  // Mendapatkan src final (cek apakah sudah pernah gagal)
  const getImageSrc = useCallback((photo) => {
    const url = getPhotoUrl(photo);
    if (!url || failedImages.has(url)) return FALLBACK_AVATAR;
    return url;
  }, [getPhotoUrl, failedImages]);

  // Handler saat gambar gagal dimuat
  const handleImageError = useCallback((e) => {
    const failedSrc = e.currentTarget.src;
    // Jangan proses jika sudah fallback
    if (failedSrc === FALLBACK_AVATAR) return;
    setFailedImages(prev => {
      const next = new Set(prev);
      next.add(failedSrc);
      return next;
    });
  }, []);

  // Custom CSS untuk popup
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-popup-pane {
        z-index: 700 !important;
      }
      .leaflet-popup {
        z-index: 700 !important;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 16px !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
      }
      .leaflet-popup-tip {
        box-shadow: 0 3px 14px rgba(0,0,0,0.1) !important;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Debug: log selectedLocation structure untuk troubleshooting
  useEffect(() => {
    if (selectedLocation) {
      console.log('🗺️ selectedLocation:', JSON.stringify(selectedLocation, null, 2));
      console.log('🔑 entity:', selectedLocation.entity);
      console.log('🔑 entity_id (root):', selectedLocation.entity_id);
      console.log('👥 alumni:', selectedLocation.alumni);
      console.log('📊 alumni count:', selectedLocation.alumni?.length);
    }
  }, [selectedLocation]);

  // Helper: cek apakah selectedLocation cocok dengan marker
  const isSelectedMarker = useCallback((marker) => {
    if (!selectedLocation) return false;
    // Coba cocokkan via entity.id
    const entityId = selectedLocation.entity?.id ?? selectedLocation.entity_id ?? selectedLocation.id;
    return entityId != null && String(entityId) === String(marker.entity_id);
  }, [selectedLocation]);


  return (
    <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm relative z-0">
      <div className="absolute bottom-6 right-5 z-[400] bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-gray-100 hidden sm:flex flex-col gap-2.5 pointer-events-none">
        <span className="flex items-center gap-2.5 text-[11px] font-extrabold text-gray-700">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm border-2 border-white" /> Bekerja
        </span>
        <span className="flex items-center gap-2.5 text-[11px] font-extrabold text-gray-700">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm border-2 border-white" /> Kuliah
        </span>
        <span className="flex items-center gap-2.5 text-[11px] font-extrabold text-gray-700">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm border-2 border-white" /> Wirausaha
        </span>
        <div className="h-px bg-gray-200 my-1"></div>
        <span className="text-[10px] font-black text-gray-400 text-center tracking-wide">
          {totalMarkers} Lokasi • {totalAlumni} Alumni
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden relative" style={{ height: '600px' }}>
        {loadingMarkers && (
          <div className="absolute inset-0 bg-white/70 z-[500] flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
            <p className="text-primary font-bold text-sm animate-pulse">Memuat Peta...</p>
          </div>
        )}

        <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <MapBoundsUpdater bounds={bounds} />
          {markers.map((marker) => (
            <Marker 
              key={marker.id} 
              position={[marker.latitude, marker.longitude]} 
              icon={markerIcons[marker.type] || markerIcons.bekerja} 
              eventHandlers={{ click: () => handleMarkerClick(marker) }}
              zIndexOffset={isSelectedMarker(marker) ? 1000 : 0}
            >
              <Popup 
                maxWidth={350} 
                minWidth={280} 
                className="custom-popup"
                autoPan={true}
                autoPanPadding={[50, 50]}
                closeButton={true}
              >
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${marker.type === 'bekerja' ? 'bg-blue-500' : marker.type === 'kuliah' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                      {marker.type === 'bekerja' ? 'Perusahaan' : marker.type === 'kuliah' ? 'Universitas' : 'Wirausaha'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-800 text-base leading-tight mb-1 pr-4">{marker.entity_name}</h3>
                  {marker.kota && (
                    <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5 mt-2">
                      <MapPin size={12} className="text-gray-400" /> {marker.kota}{marker.provinsi ? `, ${marker.provinsi}` : ''}
                    </p>
                  )}
                  <p className="text-[11px] font-bold text-primary mt-3 bg-primary/5 px-2.5 py-1.5 rounded-lg inline-block border border-primary/10">
                    {marker.alumni_count} Alumni Terdata
                  </p>
                  {marker.alumni_preview?.length > 0 && (
                    <div className="mt-3.5 flex -space-x-2.5 pl-1 pb-1">
                      {marker.alumni_preview.slice(0, 5).map((alumni, idx) => (
                        <img 
                          key={alumni.id || idx} 
                          src={getImageSrc(alumni.foto_thumbnail || alumni.foto)} 
                          alt={alumni.nama || 'Alumni'} 
                          className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm relative hover:z-10 transition-transform hover:scale-110" 
                          loading="eager"
                          onError={handleImageError} 
                        />
                      ))}
                      {marker.alumni_count > 5 && (
                        <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm relative">+{marker.alumni_count - 5}</div>
                      )}
                    </div>
                  )}
                  {isSelectedMarker(marker) ? (
                    <div className="mt-4 border-t border-gray-100 pt-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                      {loadingDetail ? (
                        <p className="text-xs font-medium text-gray-400 text-center py-4 animate-pulse">Memuat data detail...</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedLocation.alumni?.map((alumni, idx) => (
                            <div key={alumni.id_alumni || alumni.id || idx} className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                              <img 
                                src={getImageSrc(alumni.foto_thumbnail || alumni.foto)} 
                                alt={alumni.nama || 'Alumni'} 
                                className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 shrink-0" 
                                loading="eager"
                                onError={handleImageError} 
                              />
                              <div className="min-w-0 flex-1 pt-0.5">
                                <p className="text-xs font-bold text-gray-800 truncate">{alumni.nama}</p>
                                <p className="text-[10px] text-gray-500 font-medium mt-0.5">{alumni.jurusan} {alumni.tahun_masuk ? `• ${alumni.tahun_masuk}` : ''}</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {alumni.detail?.posisi && <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md inline-block">{alumni.detail.posisi}</span>}
                                  {alumni.detail?.jurusan_kuliah && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md inline-block">{alumni.detail.jurusan_kuliah} ({alumni.detail.jenjang})</span>}
                                  {alumni.detail?.nama_usaha && <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md inline-block truncate max-w-full">{alumni.detail.nama_usaha} - {alumni.detail.bidang_usaha}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-center"><span className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-4 py-2 rounded-xl inline-block cursor-pointer">Lihat Detail Alumni</span></div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}