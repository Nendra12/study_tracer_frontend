import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Check, MapPin, Navigation, Search, X, AlertCircle } from 'lucide-react';

// Fix leaflet default icon issue on Vite builds.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function RecenterMap({ lat, lng, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      map.setView([lat, lng], zoom || 16, { animate: true });
    }
  }, [lat, lng, zoom, map]);

  return null;
}

export default function LocationPicker({
  isOpen,
  onClose,
  onConfirm,
  initialLat = -7.25,
  initialLng = 112.75,
  title = 'Pilih Lokasi',
  selectedKota = '',
  selectedProvinsi = '',
  initialAddress = '',
}) {
  const mapRef = useRef(null);
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });
  const [recenterTarget, setRecenterTarget] = useState({ lat: initialLat, lng: initialLng, zoom: 13 });
  const [address, setAddress] = useState('');
  const [detectedLocation, setDetectedLocation] = useState({ province: '', city: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [geocodeResults, setGeocodeResults] = useState([]);
  const [showGeocodeResults, setShowGeocodeResults] = useState(false);
  const [geocodeFailed, setGeocodeFailed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const searchTimeout = useRef(null);
  const hasAutoZoomed = useRef(false);

  // Kunci Scroll Layar Belakang
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Geocoding dengan validasi ketat
  useEffect(() => {
    if (!isOpen) {
      hasAutoZoomed.current = false;
      return;
    }

    setAddress('');
    setSearchQuery('');
    setSearchResults([]);
    setGeocodeResults([]);
    setShowGeocodeResults(false);
    setGeocodeFailed(false);

    // Prioritas 1: Jika ada initialAddress, geocode alamat tersebut
    if (initialAddress && initialAddress.trim() && !hasAutoZoomed.current) {
      hasAutoZoomed.current = true;
      
      const addressLower = initialAddress.toLowerCase();
      const hasKota = selectedKota && addressLower.includes(selectedKota.toLowerCase());
      const hasProv = selectedProvinsi && addressLower.includes(selectedProvinsi.toLowerCase());
      
      let finalQuery = initialAddress.trim();
      if (!hasKota && !hasProv && (selectedKota || selectedProvinsi)) {
        finalQuery = `${initialAddress.trim()}, ${selectedKota || ''}, ${selectedProvinsi || ''}, Indonesia`.replace(/,\s*,/g, ',').trim();
      } else if (!finalQuery.toLowerCase().includes('indonesia')) {
        finalQuery = `${finalQuery}, Indonesia`;
      }
      
      const addressQuery = encodeURIComponent(finalQuery);
      
      console.log('🔍 Geocoding query:', finalQuery);
      
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${addressQuery}&limit=10&countrycodes=id&addressdetails=1`)
        .then((res) => res.json())
        .then((data) => {
          console.log('📍 Geocoding results:', data);
          
          if (data && data.length > 0) {
            const kotaLower = (selectedKota || '').toLowerCase();
            const provLower = (selectedProvinsi || '').toLowerCase();
            
            // Filter hasil yang sesuai dengan kota/provinsi
            let validResults = data.filter(item => {
              const displayLower = (item.display_name || '').toLowerCase();
              const addressData = item.address || {};
              
              const matchKota = !selectedKota || 
                displayLower.includes(kotaLower) ||
                (addressData.city && addressData.city.toLowerCase().includes(kotaLower)) ||
                (addressData.county && addressData.county.toLowerCase().includes(kotaLower)) ||
                (addressData.municipality && addressData.municipality.toLowerCase().includes(kotaLower)) ||
                (addressData.state_district && addressData.state_district.toLowerCase().includes(kotaLower));
              
              const matchProv = !selectedProvinsi || 
                displayLower.includes(provLower) ||
                (addressData.state && addressData.state.toLowerCase().includes(provLower));
              
              return matchKota && matchProv;
            });
            
            // Filter out hasil yang terlalu general (hanya administrative/county/state)
            const specificResults = validResults.filter(item => {
              const generalTypes = ['administrative', 'county', 'state', 'region', 'province'];
              return !generalTypes.includes(item.type);
            });
            
            console.log('✅ Valid results:', validResults.length, '| Specific results:', specificResults.length);
            
            // Jika tidak ada hasil spesifik, fallback ke kota
            if (specificResults.length === 0) {
              console.log('⚠️ No specific results, falling back to city');
              setGeocodeFailed(true);
              
              if (selectedKota && selectedProvinsi) {
                const kotaQuery = encodeURIComponent(`${selectedKota}, ${selectedProvinsi}, Indonesia`);
                return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${kotaQuery}&limit=1&countrycodes=id`)
                  .then((res) => res.json())
                  .then((kotaData) => {
                    if (kotaData && kotaData.length > 0) {
                      setPosition({ lat: parseFloat(kotaData[0].lat), lng: parseFloat(kotaData[0].lon) });
                      setRecenterTarget({ lat: parseFloat(kotaData[0].lat), lng: parseFloat(kotaData[0].lon), zoom: 13 });
                      setAddress(initialAddress);
                    } else {
                      setPosition({ lat: initialLat, lng: initialLng });
                      setRecenterTarget({ lat: initialLat, lng: initialLng, zoom: 13 });
                      setAddress(initialAddress);
                    }
                  });
              }
              return;
            }
            
            // Sort hasil spesifik berdasarkan type dan importance
            specificResults.sort((a, b) => {
              const specificTypes = ['house', 'building', 'residential', 'road', 'amenity', 'shop', 'office'];
              const aIsSpecific = specificTypes.includes(a.type);
              const bIsSpecific = specificTypes.includes(b.type);
              
              if (aIsSpecific && !bIsSpecific) return -1;
              if (!aIsSpecific && bIsSpecific) return 1;
              
              return (parseFloat(b.importance) || 0) - (parseFloat(a.importance) || 0);
            });
            
            const bestMatch = specificResults[0];
            console.log('🎯 Best match:', bestMatch.type, '-', bestMatch.display_name);
            
            // Simpan hasil untuk ditampilkan sebagai pilihan
            if (specificResults.length > 1) {
              setGeocodeResults(specificResults.slice(0, 5));
              setShowGeocodeResults(true);
            }
            
            setPosition({ lat: parseFloat(bestMatch.lat), lng: parseFloat(bestMatch.lon) });
            setRecenterTarget({ lat: parseFloat(bestMatch.lat), lng: parseFloat(bestMatch.lon), zoom: 17 });
            setAddress(bestMatch.display_name || initialAddress);
            
          } else {
            console.log('❌ No results found, falling back to city');
            setGeocodeFailed(true);
            
            if (selectedKota && selectedProvinsi) {
              const kotaQuery = encodeURIComponent(`${selectedKota}, ${selectedProvinsi}, Indonesia`);
              return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${kotaQuery}&limit=1&countrycodes=id`)
                .then((res) => res.json())
                .then((kotaData) => {
                  if (kotaData && kotaData.length > 0) {
                    setPosition({ lat: parseFloat(kotaData[0].lat), lng: parseFloat(kotaData[0].lon) });
                    setRecenterTarget({ lat: parseFloat(kotaData[0].lat), lng: parseFloat(kotaData[0].lon), zoom: 13 });
                    setAddress(initialAddress);
                  } else {
                    setPosition({ lat: initialLat, lng: initialLng });
                    setRecenterTarget({ lat: initialLat, lng: initialLng, zoom: 13 });
                    setAddress(initialAddress);
                  }
                });
            }
          }
        })
        .catch((err) => {
          console.error('❌ Address geocoding failed:', err);
          setGeocodeFailed(true);
          setPosition({ lat: initialLat, lng: initialLng });
          setRecenterTarget({ lat: initialLat, lng: initialLng, zoom: 13 });
          setAddress(initialAddress);
        });
    }
    // Prioritas 2: Jika tidak ada initialAddress tapi ada selectedKota, zoom ke kota
    else if (selectedKota && !hasAutoZoomed.current) {
      hasAutoZoomed.current = true;
      const query = encodeURIComponent(`${selectedKota}, ${selectedProvinsi}, Indonesia`);

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=id`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            setPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            setRecenterTarget({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), zoom: 13 });
            setAddress(data[0].display_name || '');
          } else {
            setPosition({ lat: initialLat, lng: initialLng });
            setRecenterTarget({ lat: initialLat, lng: initialLng, zoom: 13 });
          }
        })
        .catch((err) => {
          console.error('Auto-zoom failed:', err);
          setPosition({ lat: initialLat, lng: initialLng });
          setRecenterTarget({ lat: initialLat, lng: initialLng, zoom: 13 });
        });
    } 
    // Prioritas 3: Default position
    else if (!selectedKota && !initialAddress) {
      setPosition({ lat: initialLat, lng: initialLng });
      setRecenterTarget({ lat: initialLat, lng: initialLng, zoom: 13 });
    }

    const timers = [150, 300, 500].map((delay) =>
      window.setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, delay)
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [isOpen, selectedKota, selectedProvinsi, initialAddress, initialLat, initialLng]);

  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsReversing(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        // Simpan data provinsi & kota dari hasil reverse geocode
        const addr = data.address || {};
        const province = addr.state || addr.province || '';
        const city =
          addr.city ||
          addr.town ||
          addr.county ||
          addr.municipality ||
          addr.state_district ||
          '';
        setDetectedLocation({ province, city });
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setDetectedLocation({ province: '', city: '' });
      }
    } catch (err) {
      console.error('Reverse geocode failed', err);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setDetectedLocation({ province: '', city: '' });
    } finally {
      setIsReversing(false);
    }
  }, []);

  const handleLocationSelect = useCallback((lat, lng) => {
    setPosition({ lat, lng });
    reverseGeocode(lat, lng);
    setGeocodeFailed(false); // Reset failed state ketika user pilih manual
  }, [reverseGeocode]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&countrycodes=id`);
        const data = await res.json();
        setSearchResults(data || []);
      } catch (err) {
        console.error('Search geocode failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectResult = (result) => {
    setPosition({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setRecenterTarget({ lat: parseFloat(result.lat), lng: parseFloat(result.lon), zoom: 16 });
    setAddress(result.display_name || '');
    setSearchResults([]);
    setSearchQuery('');
    setGeocodeFailed(false);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setRecenterTarget({ lat: latitude, lng: longitude, zoom: 16 });
        reverseGeocode(latitude, longitude);
        setGeocodeFailed(false);
      },
      (err) => { console.error('GPS error', err); },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    onConfirm({
      latitude: position.lat,
      longitude: position.lng,
      address,
      provinceRaw: detectedLocation.province,
      cityRaw: detectedLocation.city,
    });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" 
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4 bg-white z-10">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <MapPin size={20} className="text-red-500" />
            {title}
          </h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {geocodeFailed && initialAddress && (
          <div className="mx-5 mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Alamat tidak ditemukan secara otomatis</p>
              <p className="text-red-600">Peta di-zoom ke {selectedKota || 'lokasi umum'}. Silakan <strong>klik peta atau drag marker</strong> untuk menentukan lokasi yang tepat.</p>
            </div>
          </div>
        )}

        {!geocodeFailed && (selectedKota || initialAddress) && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <MapPin size={12} className="shrink-0" />
            <p>
              {initialAddress && initialAddress.trim() 
                ? `Peta sudah di-zoom ke alamat. Klik peta atau drag marker untuk menyesuaikan posisi.`
                : `Peta sudah di-zoom ke ${selectedKota}. Klik untuk pilih titik yang lebih akurat.`
              }
            </p>
          </div>
        )}

        {showGeocodeResults && geocodeResults.length > 1 && (
          <div className="mx-5 mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-800">
              <AlertCircle size={14} />
              <span>Ditemukan {geocodeResults.length} lokasi yang cocok. Pilih yang paling sesuai:</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {geocodeResults.map((result, index) => {
                const getBadge = (type) => {
                  const badges = {
                    'house': { text: 'Rumah', color: 'bg-green-100 text-green-700' },
                    'building': { text: 'Gedung', color: 'bg-blue-100 text-blue-700' },
                    'residential': { text: 'Perumahan', color: 'bg-purple-100 text-purple-700' },
                    'road': { text: 'Jalan', color: 'bg-orange-100 text-orange-700' },
                    'amenity': { text: 'Fasilitas', color: 'bg-cyan-100 text-cyan-700' },
                    'shop': { text: 'Toko', color: 'bg-pink-100 text-pink-700' },
                    'office': { text: 'Kantor', color: 'bg-indigo-100 text-indigo-700' },
                  };
                  return badges[type] || { text: type || 'Lokasi', color: 'bg-gray-100 text-gray-600' };
                };
                
                const badge = getBadge(result.type);
                
                return (
                  <button
                    key={`${result.lat}-${result.lon}-${index}`}
                    onClick={() => {
                      setPosition({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
                      setRecenterTarget({ lat: parseFloat(result.lat), lng: parseFloat(result.lon), zoom: 17 });
                      setAddress(result.display_name);
                      setShowGeocodeResults(false);
                      setGeocodeFailed(false);
                    }}
                    className="w-full text-left rounded-lg bg-white border border-amber-100 px-3 py-2 hover:bg-amber-100 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin size={12} className="mt-1 shrink-0 text-amber-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>
                            {badge.text}
                          </span>
                          {index === 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500 text-white">
                              Rekomendasi
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-700 font-medium line-clamp-2 block">
                          {result.display_name}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="relative px-5 pt-3">
          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <Search size={18} className="mr-2 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari alamat atau tempat..."
              className="flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none"
            />
            {isSearching && <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent shrink-0" />}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute left-5 right-5 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.lat}-${result.lon}-${index}`}
                  onClick={() => handleSelectResult(result)}
                  className="flex w-full items-start gap-2 border-b border-gray-50 px-4 py-3 text-left text-sm hover:bg-blue-50 last:border-0 transition-colors"
                >
                  <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  <span className="line-clamp-2 text-slate-700 font-medium">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="m-5 overflow-hidden rounded-xl border border-gray-200 relative z-0 shadow-inner" style={{ height: '350px' }}>
          <MapContainer
            center={[recenterTarget.lat, recenterTarget.lng]}
            zoom={recenterTarget.zoom}
            style={{ height: '100%', width: '100%' }}
            whenReady={(event) => {
              mapRef.current = event.target;
              setTimeout(() => event.target.invalidateSize(), 100);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[position.lat, position.lng]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  handleLocationSelect(lat, lng);
                },
              }}
            />
            <MapClickHandler onLocationSelect={handleLocationSelect} />
            <RecenterMap lat={recenterTarget.lat} lng={recenterTarget.lng} zoom={recenterTarget.zoom} />
          </MapContainer>
        </div>

        <div className="px-5 pb-3 relative z-10">
          <div className="flex items-start gap-2 rounded-xl bg-gray-50 border border-gray-100 p-3 shadow-sm">
            <MapPin size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="line-clamp-2 text-sm text-slate-700 font-medium">
              {isReversing ? 'Mencari alamat...' : address || 'Klik peta untuk memilih lokasi'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 px-5 pb-5 relative z-10">
          <button
            onClick={handleUseMyLocation}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-100 bg-white px-5 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50 cursor-pointer w-full sm:w-auto shadow-sm"
          >
            <Navigation size={16} strokeWidth={2.5} /> Lokasi Saya
          </button>
          
          <div className="flex-1 hidden sm:block" />
          
          <button onClick={onClose} className="rounded-xl border-2 border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-gray-50 cursor-pointer w-full sm:w-auto shadow-sm">
            Batal
          </button>
          
          <button
            onClick={handleConfirm}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 cursor-pointer shadow-md w-full sm:w-auto"
          >
            <Check size={16} strokeWidth={3} /> Konfirmasi
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
