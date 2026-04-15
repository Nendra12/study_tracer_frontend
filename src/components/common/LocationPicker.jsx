import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Check, MapPin, Navigation, Search, X } from 'lucide-react';
import api from '../../api/axios';

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

/**
 * LocationPicker - Shopee-style map picker with optional city auto-zoom.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onConfirm: ({ latitude, longitude, address }) => void
 * - initialLat: number (default: -7.25)
 * - initialLng: number (default: 112.75)
 * - title: string
 * - selectedKota: string (optional) — kota name, if set map auto-zooms to city
 * - selectedProvinsi: string (optional) — provinsi name, used together with kota for zoom
 */
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

  // Auto-zoom to kota when modal opens and kota is selected
  useEffect(() => {
    if (!isOpen) {
      hasAutoZoomed.current = false;
      return;
    }

    // Reset state
    setAddress('');
    setSearchQuery('');
    setSearchResults([]);

    // If kota is provided, geocode the city and zoom there
    if (selectedKota && !hasAutoZoomed.current) {
      hasAutoZoomed.current = true;
      const query = [selectedKota, selectedProvinsi, 'Indonesia'].filter(Boolean).join(', ');

      api.get('/geocode/search', { params: { q: query, limit: 1 } })
        .then((res) => {
          if (res.data?.success && res.data.data?.length > 0) {
            const result = res.data.data[0];
            setPosition({ lat: result.latitude, lng: result.longitude });
            setRecenterTarget({ lat: result.latitude, lng: result.longitude, zoom: 13 });
            setAddress(result.display_name || '');
          } else {
            setPosition({ lat: initialLat, lng: initialLng });
            setRecenterTarget({ lat: initialLat, lng: initialLng, zoom: 13 });
          }
        })
        .catch(() => {
          setPosition({ lat: initialLat, lng: initialLng });
          setRecenterTarget({ lat: initialLat, lng: initialLng, zoom: 13 });
        });
    } else if (!selectedKota) {
      setPosition({ lat: initialLat, lng: initialLng });
      setRecenterTarget({ lat: initialLat, lng: initialLng, zoom: 13 });
    }

    // Force Leaflet to recalculate dimensions after modal mount/animation.
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
      const res = await api.get('/geocode/reverse', { params: { lat, lng } });
      if (res.data?.success) {
        setAddress(res.data?.data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
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
    // Don't auto-recenter on click, just move marker
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get('/geocode/search', { params: { q: value, limit: 5 } });
        if (res.data?.success) {
          setSearchResults(res.data?.data || []);
        }
      } catch (err) {
        console.error('Search geocode failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectResult = (result) => {
    setPosition({ lat: result.latitude, lng: result.longitude });
    setRecenterTarget({ lat: result.latitude, lng: result.longitude, zoom: 16 });
    setAddress(result.display_name || '');
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setRecenterTarget({ lat: latitude, lng: longitude, zoom: 16 });
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        console.error('GPS error', err);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    onConfirm({
      latitude: position.lat,
      longitude: position.lng,
      address,
    });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <MapPin size={20} className="text-red-500" />
            {title}
          </h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Info: auto-zoom ke kota */}
        {selectedKota && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <MapPin size={12} />
            Peta sudah di-zoom ke <strong>{selectedKota}</strong>. Klik untuk pilih titik yang lebih akurat.
          </div>
        )}

        <div className="relative px-5 pt-3">
          <div className="flex items-center rounded-xl border bg-gray-50 px-3 py-2">
            <Search size={18} className="mr-2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari alamat atau tempat..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
            {isSearching && <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute left-5 right-5 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border bg-white shadow-lg">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.latitude}-${result.longitude}-${index}`}
                  onClick={() => handleSelectResult(result)}
                  className="flex w-full items-start gap-2 border-b px-4 py-3 text-left text-sm hover:bg-blue-50 last:border-0"
                >
                  <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  <span className="line-clamp-2">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="m-5 overflow-hidden rounded-xl border" style={{ height: '350px' }}>
          <MapContainer
            center={[recenterTarget.lat, recenterTarget.lng]}
            zoom={recenterTarget.zoom}
            style={{ height: '100%', width: '100%' }}
            whenReady={(event) => {
              mapRef.current = event.target;
              event.target.invalidateSize();
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

        <div className="px-5 pb-3">
          <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-3">
            <MapPin size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="line-clamp-2 text-sm text-gray-600">
              {isReversing ? 'Mencari alamat...' : address || 'Klik peta untuk memilih lokasi'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 pb-5">
          <button
            onClick={handleUseMyLocation}
            className="flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm text-blue-600 transition hover:bg-blue-50"
          >
            <Navigation size={16} />
            Lokasi Saya
          </button>
          <div className="flex-1" />
          <button onClick={onClose} className="rounded-xl border px-5 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white transition hover:bg-blue-700"
          >
            <Check size={16} />
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}
