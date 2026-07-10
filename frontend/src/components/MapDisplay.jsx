import React, { useEffect, useRef } from 'react';

const MapDisplay = ({ lat, lng }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.L || !mapContainerRef.current || !lat || !lng) return;

    const L = window.L;

    // Initialize Map if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        boxZoom: false,
        doubleClickZoom: false,
        dragging: true,
      }).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      L.marker([lat, lng]).addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lng], 15);
    }
  }, [lat, lng]);

  if (!lat || !lng) {
    return <div className="text-xs text-govtext-muted italic">Coordinates unavailable for map display.</div>;
  }

  return (
    <div className="space-y-2">
      <span className="text-[10px] text-govtext-light font-bold uppercase tracking-wider block">Pinpoint Resolution Site</span>
      <div
        ref={mapContainerRef}
        className="w-full h-48 border border-govborder rounded-md shadow-sm z-10"
      ></div>
    </div>
  );
};

export default MapDisplay;
