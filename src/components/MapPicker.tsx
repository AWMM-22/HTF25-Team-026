import React, { useEffect, useRef, useState } from "react";

// Lightweight Leaflet loader via CDN (no npm dep required)
function useLeaflet() {
  const [L, setL] = useState<any>(null);
  useEffect(() => {
    const existing = (window as any).L;
    if (existing) { setL(existing); return; }

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;

    let mounted = true;
    script.onload = () => { if (mounted) setL((window as any).L); };

    document.head.appendChild(css);
    document.body.appendChild(script);
    return () => { mounted = false; };
  }, []);
  return L;
}

type ExtraMarker = { lat: number; lng: number; title?: string; description?: string };

export default function MapPicker({ center, onSelect, markers }: { center?: { lat: number; lng: number }; onSelect: (lat: number, lng: number) => void; markers?: ExtraMarker[]; }) {
  const L = useLeaflet();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const extraMarkersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;
    const initCenter = center ?? { lat: 19.0760, lng: 72.8777 }; // Default: Mumbai
    const map = L.map(mapRef.current).setView([initCenter.lat, initCenter.lng], 14);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    markerRef.current = L.marker([initCenter.lat, initCenter.lng], { draggable: true }).addTo(map);

    function setPick(lat: number, lng: number) {
      markerRef.current.setLatLng([lat, lng]);
      onSelect(lat, lng);
    }

    map.on('click', (e: any) => setPick(e.latlng.lat, e.latlng.lng));
    markerRef.current.on('dragend', (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      setPick(lat, lng);
    });
  }, [L, center, onSelect]);

  useEffect(() => {
    if (!L || !mapInstanceRef.current || !markerRef.current || !center) return;
    mapInstanceRef.current.setView([center.lat, center.lng], 15);
    markerRef.current.setLatLng([center.lat, center.lng]);
  }, [L, center]);

  // Render extra markers
  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;
    // clear prior
    extraMarkersRef.current.forEach((m) => m.remove());
    extraMarkersRef.current = [];
    (markers || []).forEach((m) => {
      const mk = L.marker([m.lat, m.lng]).addTo(mapInstanceRef.current);
      if (m.title || m.description) {
        mk.bindPopup(`<b>${m.title ?? ''}</b><br/>${m.description ?? ''}`);
      }
      extraMarkersRef.current.push(mk);
    });
  }, [L, markers]);

  return <div ref={mapRef} style={{ width: '100%', height: 360, borderRadius: 12, overflow: 'hidden' }} />;
}
