import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import LoadingButton from '@/components/LoadingButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { listIssues, type Issue, upvoteIssue } from '@/lib/db';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

export default function Issues() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | undefined>();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Lightweight Leaflet loader via CDN (no extra npm dep)
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
      .channel('issues-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, async (_payload) => {
        try {
          const data = await listIssues();
          setIssues(data);
        } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Try to center on current user location (works before login as well)
  useEffect(() => {
    if (!center && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, [center]);

  // Initialize map
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;
    const initial = center ?? { lat: 19.0760, lng: 72.8777 }; // Default Mumbai
    const map = L.map(mapRef.current).setView([initial.lat, initial.lng], 12);
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
  }, [L, center]);

  // Update view on center change
  useEffect(() => {
    if (!L || !mapInstanceRef.current || !center) return;
    mapInstanceRef.current.setView([center.lat, center.lng], 12);
  }, [L, center]);

  // Plot markers for issues with lat/lng
  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;
    // clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    issues.filter((i) => i.lat && i.lng).forEach((i) => {
      const m = L.marker([i.lat as number, i.lng as number]).addTo(mapInstanceRef.current);
      m.bindPopup(`<b>${i.title}</b><br/>${i.description ?? ''}`);
      markersRef.current.push(m);
    });
  }, [L, issues]);

  async function handleUpvote(issueId: string) {
    if (!user) { toast.error('Please login to upvote'); return; }
    try {
      await upvoteIssue(issueId, user.id);
      toast.success('Upvoted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upvote');
    }
  }
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="pt-28 max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6">Explore Issues</h1>
        <Card className="border-primary/20">
          <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className="md:col-span-1 space-y-4">
            <div>
              <label className="text-sm">Search</label>
              <Input placeholder="Title or location" />
            </div>
            <div>
              <label className="text-sm">Ward</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="All wards" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">Ward 1</SelectItem>
                  <SelectItem value="2">Ward 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Category</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="road">Road</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="garbage">Garbage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Status</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Sort by</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Date" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="votes">Votes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </aside>

          {/* Map + Grid */}
          <section className="md:col-span-3 space-y-6">
            <div className="h-64 rounded-lg border border-primary/20 overflow-hidden">
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loading && (
                <div className="col-span-full text-center text-sm text-muted-foreground">Loading...</div>
              )}
              {!loading && issues.map((it) => (
                <Card key={it.id} className="overflow-hidden border-primary/20">
                  <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${(it.media?.[0]) || 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop'} )` }} />
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <a className="font-semibold hover:underline" href={`/issues/${it.id}`}>{it.title}</a>
                      <Badge variant="secondary">{it.category}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{it.ward ?? 'Ward N/A'}</div>
                    <div className="flex items-center gap-2 text-xs mt-2">
                      <Badge variant="outline">{it.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <LoadingButton size="sm" variant="outline" onClick={() => handleUpvote(it.id)}>Upvote</LoadingButton>
                      <LoadingButton size="sm">Follow</LoadingButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
