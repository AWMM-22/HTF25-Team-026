import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import LoadingButton from '@/components/LoadingButton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadMedia } from '@/lib/storage';
import { createIssue } from '@/lib/db';
import { useAuth } from '@/lib/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MapPicker from '@/components/MapPicker';
import { Badge } from '@/components/ui/badge';

export default function Report() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [suggested, setSuggested] = useState<string | undefined>();
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [center, setCenter] = useState<{ lat: number; lng: number } | undefined>();

  async function handleUseGPS() {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      setCenter({ lat: latitude, lng: longitude });
    }, () => toast.error('Unable to get location'));
  }

  useEffect(() => {
    // Try to set a sensible default center once (e.g., on first mount)
    if (!center && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, [center]);

  // Lightweight AI-like suggestion based on keywords; user can accept/override
  useEffect(() => {
    const text = `${title} ${description}`.toLowerCase();
    if (!text.trim()) { setSuggested(undefined); return; }
    const rules: Array<{cat: string; keys: string[]}> = [
      { cat: 'road', keys: ['pothole','road','street','lane','asphalt','tar'] },
      { cat: 'water', keys: ['water','leak','sewage','drain','pipe'] },
      { cat: 'light', keys: ['light','bulb','streetlight','lamp','dark'] },
      { cat: 'garbage', keys: ['garbage','trash','waste','dump','clean'] },
    ];
    let best: string | undefined;
    for (const r of rules) {
      if (r.keys.some(k => text.includes(k))) { best = r.cat; break; }
    }
    setSuggested(best || 'others');
  }, [title, description]);

  async function handleSubmit() {
    if (!user) return toast.error('Please login to report');
    if (!title || !(category || suggested)) return toast.error('Title and category are required');
    try {
      setSubmitting(true);
      let lat: number | null = null, lng: number | null = null;
      if (location.includes(',')) {
        const [a, b] = location.split(',').map((s) => parseFloat(s.trim()));
        if (!Number.isNaN(a) && !Number.isNaN(b)) { lat = a; lng = b; }
      }
      const mediaUrls = files.length ? await uploadMedia(files, user.id) : [];
      await createIssue({
        title,
        description,
        category: (category || suggested)!,
        status: 'open',
        ward: null,
        lat,
        lng,
        media: mediaUrls,
        created_by: user.id,
      } as any);
      toast.success('Issue submitted');
      window.location.href = '/dashboard';
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="pt-28 max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4">Report Issue</h1>
        <Card className="border-primary/20">
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Title (short description)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div>
              <label className="text-sm">Detailed Description</label>
              <Textarea rows={5} placeholder="Describe the issue in detail" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">Road</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="garbage">Garbage</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
              {suggested && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Suggested:</span>
                  <Badge variant="outline">{suggested}</Badge>
                  <Button size="sm" variant="outline" onClick={() => setCategory(suggested)}>Use Suggestion</Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Location</label>
                <Input placeholder="Address or coordinates" value={location} onChange={(e) => setLocation(e.target.value)} />
                {center && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-1">Nearby map (click "Pick on Map" to select exact spot)</div>
                    <div className="rounded-lg overflow-hidden border">
                      <MapPicker center={center} onSelect={(lat, lng) => {
                        setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                        setCenter({ lat, lng });
                      }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-end gap-2">
                <Button type="button" className="w-full" onClick={handleUseGPS}>Use GPS</Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => setMapOpen(true)}>Pick on Map</Button>
              </div>
            </div>
            <div>
              <label className="text-sm">Media Upload</label>
              <Input type="file" accept="image/*,video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
              <div className="text-xs text-muted-foreground mt-1">Up to 3 images or 1 short video.</div>
            </div>
            <LoadingButton loading={submitting} className="w-full" onClick={handleSubmit}>Submit Report</LoadingButton>
          </CardContent>
        </Card>
        <Dialog open={mapOpen} onOpenChange={setMapOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select exact location</DialogTitle>
            </DialogHeader>
            <MapPicker
              center={center}
              onSelect={(lat, lng) => {
                setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                setCenter({ lat, lng });
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMapOpen(false)}>Close</Button>
              <Button onClick={() => setMapOpen(false)}>Use This Location</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <SiteFooter />
    </div>
  );
}
