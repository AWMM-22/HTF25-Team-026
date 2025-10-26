import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, MapPin, Bell, TrendingUp, Eye, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { listIssues, type Issue, createIssue, updateIssue, getProfile } from "@/lib/db";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import MapPicker from "@/components/MapPicker";
import { uploadMedia } from "@/lib/storage";
import { notify } from "@/lib/notifications";
import { supabase } from "@/lib/supabaseClient";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "submit" | "track" | "analytics">("overview");
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();
  const [nearbyMarkers, setNearbyMarkers] = useState<Array<{ lat: number; lng: number; title?: string; description?: string }>>([]);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  // simple retry with backoff
  async function loadMyIssues(uid: string) {
    let attempt = 0;
    let lastErr: any = null;
    const delays = [250, 600, 1200];
    while (attempt < delays.length) {
      try {
        const all = await listIssues();
        return all.filter((i) => (i as any).created_by === uid);
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, delays[attempt]));
        attempt++;
      }
    }
    throw lastErr;
  }

  // --- NEW CONFIGURATION: External Mail Server URL ---
  // IMPORTANT: This URL points directly to your test-server.js file's endpoint.
  const EXTERNAL_MAIL_API = 'http://localhost:3001/api/send-test-email';

  // --- NEW FUNCTION: Direct Email API Call ---
  const sendNotificationEmail = async (issueTitle: string, userEmail: string) => {
    const subject = `[NagarNetra] Report Submitted: ${issueTitle}`;
    const htmlContent = `<h1>Thank You for Your Report!</h1>
                       <p>Your issue "${issueTitle}" has been successfully logged and is under review by the authorities. You will receive an email whenever its status changes.</p>
                       <p>-- NagarNetra Transparency System</p>`;

    try {
      // The frontend initiates the request to the backend server
      await fetch(EXTERNAL_MAIL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          title: subject,
          description: htmlContent, // Sending the content the backend expects
        }),
      });
      console.log(`Notification email queued successfully for ${userEmail} via server.`);
    } catch (e) {
      // Catches network errors (server not running, CORS issues)
      console.error("FAILED to connect to external mail server:", EXTERNAL_MAIL_API, e);
      toast.warning('Warning: Could not send email notification.');
    }
  };
  // --- END NEW FUNCTION ---

  useEffect(() => {
    (async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        setLoading(true);
        const mine = await loadMyIssues(user.id);
        setIssues(mine);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load your issues');
        setIssues([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  // Realtime subscribe to issues for this user
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('user-issues-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, async (_payload) => {
        try {
          const mine = await loadMyIssues(user.id);
          setIssues(mine);
        } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    if (!mapCenter && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, [mapCenter]);

  // Load nearby issues (public) and plot as markers around current center
  useEffect(() => {
    (async () => {
      try {
        const center = (issues.find(i=>i.lat && i.lng) as any)
          ? { lat: (issues.find(i=>i.lat&&i.lng) as any).lat as number, lng: (issues.find(i=>i.lat&&i.lng) as any).lng as number }
          : mapCenter;
        if (!center) return;
        const all = await listIssues();
        function distKm(a:{lat:number;lng:number}, b:{lat:number;lng:number}){
          const R=6371;
          const dLat=(b.lat-a.lat)*Math.PI/180; const dLng=(b.lng-a.lng)*Math.PI/180;
          const s1=Math.sin(dLat/2), s2=Math.sin(dLng/2);
          const A=s1*s1+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*s2*s2;
          return 2*R*Math.atan2(Math.sqrt(A), Math.sqrt(1-A));
        }
        const nearby = (all||[])
          .filter(i => i.lat && i.lng)
          .filter(i => distKm(center, { lat: i.lat as number, lng: i.lng as number }) <= 5) // within 5km
          .map(i => ({ lat: i.lat as number, lng: i.lng as number, title: i.title, description: i.description }));
        setNearbyMarkers(nearby);
      } catch {}
    })();
  }, [mapCenter, issues]);

  const completedCount = useMemo(() => {
    return issues.filter((i) => {
      const s = (i.status || '').toLowerCase();
      return s === 'resolved' || s === 'closed' || s === 'completed';
    }).length;
  }, [issues]);
  const inProgressCount = useMemo(() => {
    return issues.filter((i) => {
      const s = (i.status || 'open').toLowerCase();
      return !(s === 'resolved' || s === 'closed' || s === 'completed');
    }).length;
  }, [issues]);
  const successRate = useMemo(() => issues.length > 0 ? Math.round((completedCount / issues.length) * 100) : 0, [issues, completedCount]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleSubmit = async () => {
    try {
      if (!user) { toast.error('Please login to submit'); return; }
      if (!title) { toast.error('Title is required'); return; }
      setSubmitting(true);
      let lat: number | null = null, lng: number | null = null;
      if (location.includes(',')) {
        const [a, b] = location.split(',').map((s) => parseFloat(s.trim()));
        if (!Number.isNaN(a) && !Number.isNaN(b)) { lat = a; lng = b; }
      }
      let mediaUrls: string[] = [];
      if (imageFile) {
        mediaUrls = await uploadMedia([imageFile], user.id);
      }
      const created = await createIssue({
        title,
        description,
        category: 'others',
        status: 'open',
        ward: null,
        lat,
        lng,
        media: mediaUrls,
        created_by: user.id,
      } as any);

      // --- MODIFIED CODE: CALLING EXTERNAL MAIL SERVER DIRECTLY ---
      // This ensures the server.js file is triggered immediately after successful DB insert.
      // We do NOT await this call, so the UI remains responsive.
      if (user.email) {
          sendNotificationEmail(created.title, user.email);
      }

      toast.success('Issue submitted');
      setIssues((prev) => [created, ...prev]);
      try {
        const profile = await getProfile(user.id);
        await notify('issue_registered', {
          issueId: created.id,
          userId: user.id,
          toEmail: user.email,
          toPhone: (profile as any)?.phone,
          toWhatsapp: (profile as any)?.whatsapp,
          mediaUrl: (mediaUrls && mediaUrls.length > 0) ? mediaUrls[0] : undefined
        });
      } catch {
        await notify('issue_registered', { issueId: created.id, userId: user.id, toEmail: user.email, mediaUrl: (mediaUrls && mediaUrls.length > 0) ? mediaUrls[0] : undefined });
      }
      // reset form
      setTitle(""); setDescription(""); setLocation(""); setImage(undefined); setImageFile(null);
      setActiveTab('track');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  async function handleSatisfaction(issueId: string, satisfied: boolean) {
    try {
      const text = feedback[issueId] || '';
      const updated = await updateIssue(issueId, { user_satisfied: satisfied, user_feedback: text } as any);
      setIssues((prev) => prev.map((i) => (i.id === issueId ? (updated as any) : i)));
      await notify('user_feedback', { issueId, satisfied, feedback: text });
      toast.success(satisfied ? 'Thanks for confirming!' : 'Feedback submitted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit response');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* Using enhanced header below */}
      {/* Enhanced Header with Gradient */}
      <div className="relative backdrop-blur-xl bg-gradient-to-r from-primary/10 via-card/95 to-primary/10 border-b border-primary/30 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
        <div className="relative px-8 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-primary/50 ring-4 ring-primary/20 transition-transform hover:scale-105">
                  {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary/10 rounded-md text-primary font-medium">Citizen ID:</span>
                  {user?.email}
                </p>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-xl">🏠</span>
                    <span className="text-sm font-semibold text-foreground">{issues.length}</span>
                    <span className="text-xs text-muted-foreground">Reports</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/5 rounded-lg border border-green-500/10">
                    <span className="text-xl">✅</span>
                    <span className="text-sm font-semibold text-green-600">{completedCount}</span>
                    <span className="text-xs text-muted-foreground">Resolved</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                    <span className="text-xl">⭐</span>
                    <span className="text-sm font-semibold text-yellow-600">{successRate}%</span>
                    <span className="text-xs text-muted-foreground">Success</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border bg-background/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("submit")}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "submit" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              + Submit
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "track" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-4 h-4" />
              Track ({issues.length})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "analytics" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8 pt-28">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card border border-primary/20 rounded-xl p-6">
                <div className="text-sm text-muted-foreground mb-2">Total Reports</div>
                <div className="text-3xl font-bold text-foreground">{issues.length}</div>
                <div className="mt-2 h-1 bg-primary/30 rounded" style={{ width: "100%" }}></div>
                <div className="text-xs text-muted-foreground mt-2">📈 Active citizen</div>
              </div>
              <div className="group relative bg-gradient-to-br from-green-500/10 via-card to-card border border-green-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-muted-foreground">Resolved Issues</div>
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                      ✅
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">{completedCount}</div>
                  <div className="h-1.5 bg-gradient-to-r from-green-500/20 to-green-500 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: `${completedCount > 0 ? 100 : 30}%` }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    Successfully completed
                  </div>
                </div>
              </div>
              <div className="bg-card border border-primary/20 rounded-xl p-6">
                <div className="text-sm text-muted-foreground mb-2">In Progress</div>
                <div className="text-3xl font-bold text-foreground">{inProgressCount}</div>
                <div className="mt-2 h-1 bg-primary/40 rounded" style={{ width: `${inProgressCount > 0 ? 70 : 0}%` }}></div>
                <div className="text-xs text-muted-foreground mt-2">Being worked on</div>
              </div>
              <div className="bg-card border border-primary/20 rounded-xl p-6">
                <div className="text-sm text-muted-foreground mb-2">Avg. Response Time</div>
                <div className="text-3xl font-bold text-foreground">2.3 days</div>
                <div className="mt-2 h-1 bg-primary/30 rounded" style={{ width: "80%" }}></div>
                <div className="text-xs text-muted-foreground mt-2">Faster than average</div>
              </div>
            </div>

            {/* Recent Complaints Section */}
            <div className="bg-card border border-primary/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Your Recent Reports</h2>
                <Button onClick={() => setActiveTab("submit")}>
                  + New Complaint
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : issues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No complaints yet</h3>
                  <p className="text-muted-foreground mb-6">Start by reporting an issue in your area</p>
                  <Button onClick={() => setActiveTab("submit")}>
                    + Submit Your First Complaint
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.slice(0, 5).map((c) => (
                    <div key={c.id} className="bg-card/60 border border-primary/10 rounded-lg p-4 hover:bg-card transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{c.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                          {(c as any).ward && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                              <MapPin className="w-3 h-3" />
                              {(c as any).ward}
                            </p>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${((c.status||'').toLowerCase()==='resolved') ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                          {c.status || 'open'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mini Map */}
            <div className="bg-card border border-primary/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Your Ward Map</h2>
              {(issues.find(i => (i.lat && i.lng)) || mapCenter) ? (
                <div className="rounded-lg overflow-hidden border">
                  <MapPicker
                    center={(issues.find(i=>i.lat&&i.lng) as any) ? { lat: (issues.find(i=>i.lat&&i.lng) as any).lat, lng: (issues.find(i=>i.lat&&i.lng) as any).lng } : mapCenter}
                    onSelect={(lat, lng) => {
                      setMapCenter({ lat, lng });
                    }}
                    markers={nearbyMarkers}
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No geotagged reports yet. Use GPS in the Submit tab to set your location and see it here.</div>
              )}
            </div>

          </div>
        )}

        {activeTab === "submit" && (
          <div className="bg-card border border-primary/20 rounded-xl p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Submit New Complaint</h2>
            <div className="space-y-5">
              <div>
                <Label htmlFor="title">Complaint Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Pothole on Main Street" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in detail..." rows={4} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2 mt-1">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-2.5" />
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter location manually" className="flex-1" />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => {
                    if (!navigator.geolocation) return toast.error('Geolocation not supported');
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
                    }, () => toast.error('Unable to get location'));
                  }}>Use GPS</Button>
                </div>
                {mapCenter && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-1">Nearby map (click to fine-tune)</div>
                    <div className="rounded-lg overflow-hidden border">
                      <MapPicker center={mapCenter} onSelect={(lat, lng) => {
                        setMapCenter({ lat, lng });
                        setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                      }} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="image">Upload Image</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Button type="button" variant="outline" onClick={() => document.getElementById("fileInput")?.click()} className="gap-2">
                    <Camera className="w-4 h-4" />
                    Choose Image
                  </Button>
                  <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {image && <span className="text-sm text-muted-foreground">Image uploaded ✓</span>}
                </div>
                {image && (
                  <div className="mt-3">
                    <img src={image} alt="Preview" className="w-40 h-40 object-cover rounded border" />
                  </div>
                )}
              </div>

              <Button onClick={handleSubmit} className="w-full text-lg py-6" disabled={submitting}>
                Submit Complaint
              </Button>
            </div>
          </div>
        )}

        {activeTab === "track" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Track Complaints</h2>
            {issues.length === 0 ? (
              <div className="bg-card border border-primary/20 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-muted-foreground">No complaints to track yet.</p>
              </div>
            ) : (
              issues.map((c) => (
                <div key={c.id} className="bg-card border border-primary/20 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground">{c.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                      {c.ward && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                          <MapPin className="w-3 h-3" />
                          {c.ward}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Submitted: {new Date(c.created_at).toLocaleString()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${((c.status||'').toLowerCase()==='resolved') ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}>{c.status || 'open'}</div>
                  </div>
                  <div className="mt-4 flex gap-4">
                    {c.media && c.media.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-1 text-muted-foreground">Issue Image:</p>
                        <img src={c.media[0]} alt="Issue" className="w-32 h-32 object-cover rounded border" />
                      </div>
                    )}
                    {((c.status||'').toLowerCase()==='resolved' || (c.status||'').toLowerCase()==='closed') && c.completed_image && (
                      <div>
                        <p className="text-xs font-medium mb-1 text-muted-foreground">Completed Image:</p>
                        <img src={c.completed_image} alt="Completed" className="w-32 h-32 object-cover rounded border" />
                      </div>
                    )}
                  </div>

                  {((c.status||'').toLowerCase()==='resolved') && (!((c as any).user_satisfied)) && (
                    <div className="mt-4 border border-primary/10 rounded-lg p-4 bg-card/50">
                      <div className="text-sm text-foreground mb-2">Are you satisfied with the resolution?</div>
                      <Textarea
                        placeholder="Optional comments or compliments..."
                        value={feedback[c.id] || ''}
                        onChange={(e) => setFeedback((f) => ({ ...f, [c.id]: e.target.value }))}
                        rows={3}
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSatisfaction(c.id, true)}>I'm satisfied</Button>
                        <Button size="sm" variant="outline" onClick={() => handleSatisfaction(c.id, false)}>Not satisfied</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-card border border-primary/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Analytics</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card/60 border border-primary/10 rounded-lg p-6">
                <h3 className="font-semibold mb-2 text-foreground">Complaint Status Distribution</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>In Progress</span>
                    <span className="font-medium">{inProgressCount}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded">
                    <div className="h-2 bg-purple-400 rounded" style={{ width: `${issues.length > 0 ? (inProgressCount / issues.length) * 100 : 0}%` }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Completed</span>
                    <span className="font-medium">{completedCount}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded">
                    <div className="h-2 bg-green-400 rounded" style={{ width: `${issues.length > 0 ? (completedCount / issues.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-card/60 border border-primary/10 rounded-lg p-6">
                <h3 className="font-semibold mb-2 text-foreground">Success Metrics</h3>
                <div className="text-4xl font-bold text-foreground mb-2">{successRate}%</div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default UserDashboard;
