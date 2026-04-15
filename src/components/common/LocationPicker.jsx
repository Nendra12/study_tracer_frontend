import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Check, MapPin, Navigation, Search, X } from 'lucide-react';

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
}) {
  const mapRef = useRef(null);
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });
  const [recenterTarget, setRecenterTarget] = useState({ lat: initialLat, lng: initialLng, zoom: 13 });
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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

  // PERBAIKAN: Fungsi Auto-zoom ini sekarang menarik data langsung dari OpenStreetMap API (Nominatim)
  // Ini menghindari error jika API backend lokal Anda gagal membaca format Kota
  useEffect(() => {
    if (!isOpen) {
      hasAutoZoomed.current = false;
      return;
    }

    setAddress('');
    setSearchQuery('');
    setSearchResults([]);

    if (selectedKota && !hasAutoZoomed.current) {
      hasAutoZoomed.current = true;
      const query = encodeURIComponent(`${selectedKota}, ${selectedProvinsi}, Indonesia`);

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
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
    } else if (!selectedKota) {
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
  }, [isOpen, selectedKota, selectedProvinsi, initialLat, initialLng]);

  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsReversing(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (err) {
      console.error('Reverse geocode failed', err);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsReversing(false);
    }
  }, []);

  const handleLocationSelect = useCallback((lat, lng) => {
    setPosition({ lat, lng });
    reverseGeocode(lat, lng);
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
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
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
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setRecenterTarget({ lat: latitude, lng: longitude, zoom: 16 });
        reverseGeocode(latitude, longitude);
      },
      (err) => { console.error('GPS error', err); },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    onConfirm({ latitude: position.lat, longitude: position.lng, address });
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

        {selectedKota && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <MapPin size={12} className="shrink-0" />
            <p>Peta sudah di-zoom ke <strong>{selectedKota}</strong>. Klik untuk pilih titik yang lebih akurat.</p>
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