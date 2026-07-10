import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const MapSelector = ({ lat, lng, onChange }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [localError, setLocalError] = useState('');

  // Default coordinate center (Prayagraj, Uttar Pradesh coordinates)
  const defaultLat = 25.4358;
  const defaultLng = 81.8463;

  // Bounding box for Prayagraj (Allahabad)
  const prayagrajBounds = {
    minLat: 25.30,
    maxLat: 25.60,
    minLng: 81.65,
    maxLng: 82.05,
  };

  const currentLat = lat || defaultLat;
  const currentLng = lng || defaultLng;

  const checkAndNotify = (latitude, longitude) => {
    const isWithin =
      latitude >= prayagrajBounds.minLat &&
      latitude <= prayagrajBounds.maxLat &&
      longitude >= prayagrajBounds.minLng &&
      longitude <= prayagrajBounds.maxLng;

    if (!isWithin) {
      setLocalError('Selected location is outside Prayagraj city limits. Please pinpoint a location inside the city.');
      onChange(null, null); // Invalidate coordinates in parent
    } else {
      setLocalError('');
      onChange(latitude, longitude);
    }
  };

  useEffect(() => {
    // Wait for Leaflet script to load from index.html CDN
    if (typeof window === 'undefined' || !window.L || !mapContainerRef.current) return;

    const L = window.L;

    // Initialize Map if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([currentLat, currentLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Initialize Marker
      markerRef.current = L.marker([currentLat, currentLng], { draggable: true }).addTo(mapRef.current);

      // Event listener for dragging the marker
      markerRef.current.on('dragend', () => {
        const position = markerRef.current.getLatLng();
        checkAndNotify(position.lat, position.lng);
      });

      // Event listener for clicking on map
      mapRef.current.on('click', (e) => {
        const position = e.latlng;
        markerRef.current.setLatLng(position);
        checkAndNotify(position.lat, position.lng);
      });
    } else {
      // Update marker position if coordinates change externally
      if (lat && lng) {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng], mapRef.current.getZoom());
      }
    }

    // Set initial coordinates
    if (!lat || !lng) {
      checkAndNotify(currentLat, currentLng);
    }
  }, [lat, lng]);

  const handleLocateMe = (e) => {
    e.preventDefault();
    if (navigator.geolocation && mapRef.current && markerRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          markerRef.current.setLatLng([userLat, userLng]);
          mapRef.current.setView([userLat, userLng], 15);
          checkAndNotify(userLat, userLng);
        },
        (error) => {
          alert('Failed to detect location. Please pin manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-govtext-light font-bold uppercase tracking-wider block">
          Interactive Map Pinpoint Selection
        </span>
        <button
          onClick={handleLocateMe}
          className="text-[10px] bg-primary hover:bg-primary-hover text-white font-bold px-2 py-1 rounded transition-colors"
        >
          Detect My Location
        </button>
      </div>

      {/* Map Element Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-60 border border-govborder rounded-md shadow-sm z-10"
        style={{ minHeight: '240px' }}
      ></div>

      {localError && (
        <div className="p-3 bg-danger-light/35 border border-danger-light text-danger rounded-md text-[11px] font-semibold flex items-center gap-1.5 animate-shake">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      <div className="flex gap-4 text-[10px] text-govtext-muted font-mono bg-slate-50 p-2 border border-govborder rounded-md">
        <div>Latitude: <span className="font-bold text-govtext-dark">{lat ? Number(lat).toFixed(6) : 'Invalid'}</span></div>
        <div>Longitude: <span className="font-bold text-govtext-dark">{lng ? Number(lng).toFixed(6) : 'Invalid'}</span></div>
      </div>
    </div>
  );
};

export default MapSelector;
