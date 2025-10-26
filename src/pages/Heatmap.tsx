import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import { Card, CardContent } from '@/components/ui/card';
import { listIssues, type Issue } from '@/lib/db';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

export default function Heatmap() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | undefined>();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const circleLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);

  function useLeaflet() {
    const [L, setL] = useState<any>((window as any).L || null);
    useEffect(() => {
      if ((window as any).L) return;
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setL((window as any).L);
      document.head.appendChild(css);
      document.body.appendChild(script);
    }, []);
    return L;
  }
  const L = useLeaflet();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listIssues();
        setIssues(data);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load issues');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Realtime subscribe to issues table
  useEffect(() => {
    const channel = supabase
      .channel('heatmap-issues-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, async (_payload) => {
        try {
          const data = await listIssues();
          setIssues(data);
        } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!center && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, [center]);

  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;
    const initial = center ?? { lat: 19.076, lng: 72.8777 };
    const map = L.map(mapRef.current).setView([initial.lat, initial.lng], 12);
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    circleLayerRef.current = L.layerGroup().addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    // Ensure proper sizing if this page opened after transitions
    setTimeout(() => { try { map.invalidateSize(); } catch {} }, 50);
  }, [L, center]);

  useEffect(() => {
    if (!L || !mapInstanceRef.current || !circleLayerRef.current || !markerLayerRef.current) return;
    const circleLayer = circleLayerRef.current;
    const markerLayer = markerLayerRef.current;
    circleLayer.clearLayers();
    markerLayer.clearLayers();
    const colorFor = (status?: string) => {
      const s = (status || '').toLowerCase();
      if (s === 'resolved' || s === 'closed') return 'green';
      if (s.includes('progress')) return 'yellow';
      return 'red';
    };
    const points = (issues || []).filter(i => i.lat && i.lng);
    points.forEach((i) => {
      const intensity = (i as any).votes_count ? Math.min(20 + (i as any).votes_count * 5, 60) : 20;
      const radius = 100 + intensity * 20; // meters
      const latlng: [number, number] = [i.lat as number, i.lng as number];
      const circle = L.circle(latlng, {
        radius,
        color: colorFor(i.status),
        weight: 1,
        fillColor: colorFor(i.status),
        fillOpacity: 0.25,
      });
      circle.bindPopup(`<b>${i.title}</b><br/>${i.description ?? ''}`);
      circle.addTo(circleLayer);
      // Add a pointer marker on top
      const marker = L.marker(latlng);
      marker.bindPopup(`<b>${i.title}</b><br/>${i.description ?? ''}`);
      marker.addTo(markerLayer);
    });
    // Fit bounds to markers if available
    try {
      if (points.length > 0) {
        const bounds = L.latLngBounds(points.map(p => [p.lat as number, p.lng as number] as [number, number]));
        mapInstanceRef.current.fitBounds(bounds.pad(0.15));
      }
    } catch {}
  }, [L, issues]);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="pt-28 max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6">Issue Heatmap</h1>
        <Card className="border-primary/20">
          <CardContent className="p-4 md:p-6">
            <div className="h-[520px] rounded-lg border border-primary/20 overflow-hidden">
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
            {loading && <div className="text-sm text-muted-foreground mt-2">Loading…</div>}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
