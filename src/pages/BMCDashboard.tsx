import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, MapPin, Bell, TrendingUp, FileText, BarChart3, Map, Download, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { listIssues, updateIssue, adminUpdateIssue, type Issue, getProfile } from "@/lib/db";
import { uploadMedia } from "@/lib/storage";
import { notify } from "@/lib/notifications";
import MapPicker from "@/components/MapPicker";
import DotGrid from "@/components/DotGrid";
import { supabase } from "@/lib/supabaseClient";

// Authentication handled via Supabase RPC: public.verify_bmc_admin

const BMCDashboard = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authId, setAuthId] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "cases" | "analytics" | "map" | "reports">("overview");
  const [completionFiles, setCompletionFiles] = useState<Record<string, File | undefined>>({});
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();
  // Reports filters
  const [reportFrom, setReportFrom] = useState<string>("");
  const [reportTo, setReportTo] = useState<string>("");
  const [reportStatus, setReportStatus] = useState<string>("all");
  const [reportWard, setReportWard] = useState<string>("");

  function download(filename: string, text: string, mimetype = 'text/csv;charset=utf-8') {
    const blob = new Blob([text], { type: mimetype });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  const filteredIssues = useMemo(() => {
    let arr = [...(issues || [])];
    if (reportFrom) {
      const from = new Date(reportFrom);
      arr = arr.filter(i => new Date(i.created_at) >= from);
    }
    if (reportTo) {
      const to = new Date(reportTo);
      // include the full day
      to.setHours(23,59,59,999);
      arr = arr.filter(i => new Date(i.created_at) <= to);
    }
    if (reportStatus && reportStatus !== 'all') {
      const s = reportStatus.toLowerCase();
      arr = arr.filter(i => (i.status || '').toLowerCase() === s);
    }
    if (reportWard.trim()) {
      const w = reportWard.trim().toLowerCase();
      arr = arr.filter(i => (i.ward || '').toLowerCase().includes(w));
    }
    return arr;
  }, [issues, reportFrom, reportTo, reportStatus, reportWard]);

  function toCSV(rows: any[]): string {
    if (!rows || rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const escape = (val: any) => {
      const s = (val === null || val === undefined) ? '' : String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const headerLine = headers.join(',');
    const lines = rows.map(r => headers.map(h => escape((r as any)[h])).join(','));
    return [headerLine, ...lines].join('\n');
  }

  const handleExportCSV = () => {
    const rows = (issues || []).map(i => ({
      id: i.id,
      title: i.title,
      description: i.description,
      category: i.category,
      status: i.status,
      ward: i.ward,
      lat: i.lat,
      lng: i.lng,
      created_by: (i as any).created_by,
      created_at: i.created_at,
      resolved_at: (i as any).resolved_at,
      closed_at: (i as any).closed_at,
    }));
    const csv = toCSV(rows);
    download(`issues_export_${new Date().toISOString().slice(0,10)}.csv`, csv);
  };

  const handleExportFilteredCSV = () => {
    const rows = (filteredIssues || []).map(i => ({
      id: i.id,
      title: i.title,
      description: i.description,
      category: i.category,
      status: i.status,
      ward: i.ward,
      lat: i.lat,
      lng: i.lng,
      created_by: (i as any).created_by,
      created_at: i.created_at,
      resolved_at: (i as any).resolved_at,
      closed_at: (i as any).closed_at,
    }));
    const csv = toCSV(rows);
    download(`issues_filtered_${new Date().toISOString().slice(0,10)}.csv`, csv);
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(filteredIssues, null, 2);
    download(`issues_filtered_${new Date().toISOString().slice(0,10)}.json`, json, 'application/json;charset=utf-8');
  };

  const handleExportMonthlySummary = () => {
    // Summarize by YYYY-MM and status
    const bucket: Record<string, Record<string, number>> = {};
    (issues || []).forEach(i => {
      const month = new Date(i.created_at).toISOString().slice(0,7);
      const status = (i.status || 'open').toLowerCase();
      bucket[month] = bucket[month] || {};
      bucket[month][status] = (bucket[month][status] || 0) + 1;
    });
    const months = Object.keys(bucket).sort();
    const statuses = Array.from(new Set(months.flatMap(m => Object.keys(bucket[m])))).sort();
    const rows = months.map(m => {
      const row: any = { month: m };
      statuses.forEach(s => { row[s] = bucket[m][s] || 0; });
      row.total = Object.values(bucket[m]).reduce((a: any,b: any)=>a+(b as number),0);
      return row;
    });
    const csv = toCSV(rows);
    download(`issues_monthly_summary_${new Date().toISOString().slice(0,10)}.csv`, csv);
  };

  const handleExportMonthlySummaryFiltered = () => {
    const bucket: Record<string, Record<string, number>> = {};
    (filteredIssues || []).forEach(i => {
      const month = new Date(i.created_at).toISOString().slice(0,7);
      const status = (i.status || 'open').toLowerCase();
      bucket[month] = bucket[month] || {};
      bucket[month][status] = (bucket[month][status] || 0) + 1;
    });
    const months = Object.keys(bucket).sort();
    const statuses = Array.from(new Set(months.flatMap(m => Object.keys(bucket[m])))).sort();
    const rows = months.map(m => {
      const row: any = { month: m };
      statuses.forEach(s => { row[s] = bucket[m][s] || 0; });
      row.total = Object.values(bucket[m]).reduce((a: any,b: any)=>a+(b as number),0);
      return row;
    });
    const csv = toCSV(rows);
    download(`issues_monthly_summary_filtered_${new Date().toISOString().slice(0,10)}.csv`, csv);
  };

  const totalCount = issues.length;
  const inProgressCount = issues.filter((c) => {
    const s = (c.status || 'open').toLowerCase();
    return !(s === 'resolved' || s === 'closed' || s === 'completed');
  }).length;
  const completedCount = issues.filter((c) => {
    const s = (c.status || '').toLowerCase();
    return s === 'resolved' || s === 'closed' || s === 'completed';
  }).length;
  const newCount = inProgressCount; // placeholder new vs old split (no createdAt delta in type)
  const criticalCount = issues.filter((c) => c.title.toLowerCase().includes("dangerous") || c.title.toLowerCase().includes("urgent") || c.title.toLowerCase().includes("pothole")).length;
  const overdueCount = 0; // not tracked yet without SLA timestamps

  // Restore admin auth on mount and load issues when authenticated
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Restore from localStorage or Supabase session (if BMC credentials were used previously)
        const persisted = typeof window !== 'undefined' && window.localStorage.getItem('bmc_admin_authed') === '1';
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session;
        if (!mounted) return;
        if (persisted || hasSession) {
          setIsAuthenticated(true);
        }
      } catch {}
    })();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const data = await listIssues();
        setIssues(data);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [isAuthenticated]);

  // Realtime subscribe to issues table
  useEffect(() => {
    if (!isAuthenticated) return;
    const channel = supabase
      .channel('bmc-issues-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, async (_payload) => {
        try {
          const data = await listIssues();
          setIssues(data);
        } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!mapCenter) {
      const firstWithGeo = issues.find(i => i.lat && i.lng);
      if (firstWithGeo) {
        setMapCenter({ lat: firstWithGeo.lat as number, lng: firstWithGeo.lng as number });
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        });
      }
    }
  }, [issues, mapCenter]);

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.rpc("verify_bmc_admin", {
        p_username: authId,
        p_password: authPassword,
      });
      if (error) throw error;
      if (data === true) {
        // Sign in to Supabase Auth so Edge Function calls include a valid JWT
        const bmcEmail = (import.meta as any).env?.VITE_BMC_EMAIL as string | undefined;
        const bmcPassword = (import.meta as any).env?.VITE_BMC_PASSWORD as string | undefined;
        if (bmcEmail && bmcPassword) {
          try {
            await supabase.auth.signInWithPassword({ email: bmcEmail, password: bmcPassword });
          } catch {}
        }
        setIsAuthenticated(true);
        try { window.localStorage.setItem('bmc_admin_authed', '1'); } catch {}
        setAuthId("");
        setAuthPassword("");
      } else {
        alert("Invalid credentials");
      }
    } catch (e) {
      alert("Login failed. Please try again.");
      // Optionally log e
    }
  };

  const handleImageUpload = (issueId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompletionFiles((prev) => ({ ...prev, [issueId]: file }));
  };

  const handleMarkCompleted = async (issueId: string) => {
    const file = completionFiles[issueId];
    try {
      let completedUrl: string | null = null;
      if (file) {
        const urls = await uploadMedia([file], `completions/${issueId}`);
        completedUrl = urls[0] ?? null;
      } else {
        alert("Please upload a proof image before marking as completed");
        return;
      }
      const updated = await adminUpdateIssue(issueId, { status: 'resolved', completed_image: completedUrl, resolved_at: new Date().toISOString() } as any);
      setIssues((s) => s.map((it) => (it.id === issueId ? updated : it)));
      setCompletionFiles((prev) => ({ ...prev, [issueId]: undefined }));
      alert("Issue marked as completed!");
      try {
        const issue = issues.find(i => i.id === issueId);
        const profile = issue ? await getProfile((issue as any).created_by) : null;
        await notify('issue_resolved_with_photo', {
          issueId,
          completed_image: completedUrl,
          toEmail: profile?.email,
          toPhone: (profile as any)?.phone,
          toWhatsapp: (profile as any)?.whatsapp
        });
      } catch {}
    } catch (e: any) {
      alert(e.message || "Failed to update issue");
    }
  };

  const handleAccept = async (issueId: string) => {
    try {
      const updated = await adminUpdateIssue(issueId, { status: 'in progress', accepted_at: new Date().toISOString() } as any);
      setIssues((s) => s.map((it) => (it.id === issueId ? updated : it)));
      alert('Issue accepted and marked In Progress');
      try {
        const issue = issues.find(i => i.id === issueId);
        const profile = issue ? await getProfile((issue as any).created_by) : null;
        const base = {
          issueId,
          toEmail: profile?.email,
          toPhone: (profile as any)?.phone,
          toWhatsapp: (profile as any)?.whatsapp
        };
        await notify('issue_accepted', base);
        await notify('issue_in_progress', base);
      } catch {}
    } catch (e: any) {
      alert(e.message || 'Failed to update issue');
    }
  };

  const handleCloseIssue = async (issueId: string) => {
    try {
      const updated = await adminUpdateIssue(issueId, { status: 'closed', closed_at: new Date().toISOString() } as any);
      setIssues((s) => s.map((it) => (it.id === issueId ? updated : it)));
      alert('Issue closed');
      try {
        const issue = issues.find(i => i.id === issueId);
        const profile = issue ? await getProfile((issue as any).created_by) : null;
        await notify('issue_closed', {
          issueId,
          toEmail: profile?.email,
          toPhone: (profile as any)?.phone,
          toWhatsapp: (profile as any)?.whatsapp
        });
      } catch {}
    } catch (e: any) {
      alert(e.message || 'Failed to close issue');
    }
  };

  const handleLogout = async () => {
    try { window.localStorage.removeItem('bmc_admin_authed'); } catch {}
    try { await supabase.auth.signOut(); } catch {}
    setIsAuthenticated(false);
    window.location.assign("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">BMC/DMC Portal</h1>
            <p className="text-gray-300">Municipal Authority Access</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-white">Authorized Access Only</h2>
            <p className="text-sm text-gray-300">Enter your special ID and password to access the administrative dashboard</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="authId" className="text-gray-200">Special ID</Label>
              <Input
                id="authId"
                value={authId}
                onChange={(e) => setAuthId(e.target.value)}
                placeholder="BMC-XXXX-XXXX"
                className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Contact your administrator for your special ID</p>
            </div>
            <div>
              <Label htmlFor="authPassword" className="text-gray-200">Password</Label>
              <Input
                id="authPassword"
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-purple-500/80 backdrop-blur-sm hover:bg-purple-600 py-6 text-lg border border-purple-400/30">
              Access Dashboard
            </Button>
          </div>


        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Glassmorphism Header */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/30 to-violet-600/30 border-b border-white/10 text-white px-8 py-6 shadow-2xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border border-white/20 shadow-lg">
              B
            </div>
            <div>
              <h1 className="text-2xl font-bold">BMC Command Center</h1>
              <p className="text-sm opacity-90">Officer: BMC Officer • ID: BMC-sm-22 •</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {criticalCount} Critical Issues
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {overdueCount} Overdue
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {Math.round((completedCount / Math.max(totalCount, 1)) * 100)}% Resolved
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 backdrop-blur-sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "overview" ? "border-purple-400 text-purple-300" : "border-transparent text-gray-300 hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("cases")}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "cases" ? "border-purple-400 text-purple-300" : "border-transparent text-gray-300 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              Cases ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "analytics" ? "border-purple-400 text-purple-300" : "border-transparent text-gray-300 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "map" ? "border-purple-400 text-purple-300" : "border-transparent text-gray-300 hover:text-white"
              }`}
            >
              <Map className="w-4 h-4" />
              Map
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "reports" ? "border-purple-400 text-purple-300" : "border-transparent text-gray-300 hover:text-white"
              }`}
            >
              <Download className="w-4 h-4" />
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <FileText className="w-4 h-4" />
                  Total
                </div>
                <div className="text-3xl font-bold text-white">{totalCount}</div>
                <div className="mt-2 h-1 bg-blue-400 rounded"></div>
                <div className="text-xs text-blue-400 mt-2">All complaints</div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Clock className="w-4 h-4" />
                  New
                </div>
                <div className="text-3xl font-bold text-blue-400">{newCount}</div>
                <div className="mt-2 h-1 bg-blue-400 rounded" style={{ width: "75%" }}></div>
                <div className="text-xs text-blue-400 mt-2">Need review</div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Clock className="w-4 h-4" />
                  In Progress
                </div>
                <div className="text-3xl font-bold text-purple-400">{inProgressCount}</div>
                <div className="mt-2 h-1 bg-purple-400 rounded" style={{ width: "70%" }}></div>
                <div className="text-xs text-purple-400 mt-2">Being worked on</div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </div>
                <div className="text-3xl font-bold text-green-400">{completedCount}</div>
                <div className="mt-2 h-1 bg-green-400 rounded"></div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Critical
                </div>
                <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
                <div className="mt-2 h-1 bg-red-400 rounded" style={{ width: "90%" }}></div>
                <div className="text-xs text-red-400 mt-2">High priority</div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Clock className="w-4 h-4" />
                  Overdue
                </div>
                <div className="text-3xl font-bold text-red-400">{overdueCount}</div>
                <div className="mt-2 h-1 bg-red-400 rounded" style={{ width: "100%" }}></div>
                <div className="text-xs text-red-400 mt-2">Past deadline</div>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-2 text-white">Quick Actions</h3>
                <p className="text-sm text-gray-300 mb-4">Common administrative tasks</p>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-purple-500/80 text-white rounded-lg hover:bg-purple-600/80 transition flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Review New Complaints ({newCount})</div>
                    </div>
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 transition flex items-center gap-3 text-white">
                    <Clock className="w-5 h-5" />
                    <div className="font-medium">Check Overdue Items ({overdueCount})</div>
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 transition flex items-center gap-3 text-white">
                    <BarChart3 className="w-5 h-5" />
                    <div className="font-medium">View Analytics Dashboard</div>
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 transition flex items-center gap-3 text-white">
                    <Download className="w-5 h-5" />
                    <div className="font-medium">Generate Reports</div>
                  </button>
                </div>
              </div>

              {/* Critical Issues */}
              <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-lg text-white">Critical Issues</h3>
                </div>
                <p className="text-sm text-gray-300 mb-4">High priority complaints requiring immediate attention</p>
                
                <div className="space-y-3">
                  {issues
                    .filter((c) => c.title.toLowerCase().includes("dangerous") || c.title.toLowerCase().includes("pothole") || (c.status || '').toLowerCase() !== "resolved")
                    .slice(0, 3)
                    .map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                          <div>
                            <h4 className="font-semibold text-white">{c.title}</h4>
                            <p className="text-sm text-gray-300">{(c.lat !== null && c.lng !== null) ? `${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}` : (c.ward || "Location not specified")}</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => setActiveTab("cases")}>
                          Review
                        </Button>
                      </div>
                    ))}

                  {issues.filter((c) => c.title.toLowerCase().includes("dangerous") || c.title.toLowerCase().includes("pothole")).length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-400" />
                      <p>No critical issues at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cases" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">All Cases ({totalCount})</h2>
            {loading ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center shadow-sm">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300">Loading issues...</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center shadow-sm">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300">No issues to display.</p>
              </div>
            ) : (
              issues.map((c) => (
                <div key={c.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-sm border-l-4" style={{ borderColor: (((c.status||'').toLowerCase()==='resolved') || ((c.status||'').toLowerCase()==='closed')) ? "#10b981" : "#f97316" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{c.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{c.description}</p>
                      {(c.lat !== null && c.lng !== null) && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                          <MapPin className="w-3 h-3" />
                          {c.lat?.toFixed(6)}, {c.lng?.toFixed(6)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(c.created_at).toLocaleString()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${((c.status||'').toLowerCase()==='closed') ? "bg-green-500/30 text-green-200" : ((c.status||'').toLowerCase()==='resolved') ? "bg-green-500/20 text-green-300" : ((c.status||'').toLowerCase()==='in progress') ? "bg-orange-500/20 text-orange-300" : "bg-blue-500/20 text-blue-300"}`}>
                      {((c.status||'').toLowerCase()==='closed') ? 'Closed' : ((c.status||'').toLowerCase()==='resolved') ? 'Completed' : ((c.status||'').toLowerCase()==='in progress') ? 'In Progress' : 'Open'}
                    </div>
                  </div>

                  {Array.isArray(c.media) && c.media.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2 text-gray-300">Issue Media:</p>
                      <img src={c.media[0]} alt="Issue" className="w-40 h-40 object-cover rounded border border-white/20" />
                    </div>
                  )}

                  {((c.status||'').toLowerCase() !== "resolved" && (c.status||'').toLowerCase() !== 'closed') && (
                    <div className="bg-purple-500/10 backdrop-blur-sm p-4 rounded-lg space-y-3 border border-purple-400/20">
                      {((c.status||'').toLowerCase() !== 'in progress') && (
                        <Button onClick={() => handleAccept(c.id)} size="sm" className="gap-2 bg-orange-600 hover:bg-orange-700">
                          Mark as In Progress
                        </Button>
                      )}
                      <Label className="text-sm font-medium text-white">Upload Work Completion Proof:</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`file-${c.id}`)?.click()}
                          className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
                        >
                          <Camera className="w-4 h-4" />
                          Choose Image
                        </Button>
                        <input
                          id={`file-${c.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(c.id, e)}
                        />
                        {completionFiles[c.id] && <span className="text-sm text-green-400">Image selected ✓</span>}
                      </div>
                      {completionFiles[c.id] && (
                        <img src={URL.createObjectURL(completionFiles[c.id]!)} alt="Completion proof" className="w-32 h-32 object-cover rounded border border-white/20 mt-2" />
                      )}
                      <Button onClick={() => handleMarkCompleted(c.id)} size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Completed
                      </Button>
                    </div>
                  )}

                  {((c.status||'').toLowerCase()==='resolved') && (
                    <div className="mt-3 bg-white/5 border border-white/20 rounded-lg p-4">
                      {(c as any).user_satisfied ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-300">User marked satisfied. You can close this issue.</span>
                          <Button onClick={() => handleCloseIssue(c.id)} size="sm" className="bg-green-600 hover:bg-green-700">Close Issue</Button>
                        </div>
                      ) : (
                        <span className="text-sm text-yellow-300">Waiting for user satisfaction before closing.</span>
                      )}
                    </div>
                  )}

                  {c.status === "closed" && c.completed_image && (
                    <div>
                      <p className="text-xs font-medium text-green-400 mb-2">Work Completed Image:</p>
                      <img src={c.completed_image} alt="Completed" className="w-40 h-40 object-cover rounded border border-green-300" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-white">Analytics Dashboard</h2>
            {totalCount === 0 ? (
              <div className="text-gray-300">No data yet. Once reports are submitted, analytics will appear here.</div>
            ) : (
            <div className="grid grid-cols-2 gap-6">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6">
                <h3 className="font-semibold mb-4 text-white">Case Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1 text-gray-300">
                      <span>In Progress</span>
                      <span className="font-medium text-white">{inProgressCount}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded">
                      <div className="h-2 bg-purple-400 rounded" style={{ width: `${totalCount > 0 ? (inProgressCount / totalCount) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 text-gray-300">
                      <span>Completed</span>
                      <span className="font-medium text-white">{completedCount}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded">
                      <div className="h-2 bg-green-400 rounded" style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6">
                <h3 className="font-semibold mb-2 text-white">Performance</h3>
                <div className="text-4xl font-bold text-green-400 mb-2">{Math.round((completedCount / Math.max(totalCount, 1)) * 100)}%</div>
                <p className="text-sm text-gray-300">Resolution Rate</p>
              </div>
            </div>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-white">Complaint Map</h2>
            {mapCenter ? (
              <div className="rounded-lg overflow-hidden border border-white/10">
                <MapPicker
                  center={mapCenter}
                  onSelect={(lat, lng) => setMapCenter({ lat, lng })}
                  markers={(issues || [])
                    .filter(i => i.lat && i.lng)
                    .map(i => ({ lat: i.lat as number, lng: i.lng as number, title: i.title, description: i.description }))}
                />
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-lg h-96 flex items-center justify-center border border-white/10 text-gray-400">Loading map…</div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-white">Generate Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="col-span-1">
                <Label className="text-gray-300">From</Label>
                <Input type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} className="mt-1 bg-white/5 border-white/20 text-white" />
              </div>
              <div className="col-span-1">
                <Label className="text-gray-300">To</Label>
                <Input type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} className="mt-1 bg-white/5 border-white/20 text-white" />
              </div>
              <div className="col-span-1">
                <Label className="text-gray-300">Status</Label>
                <select value={reportStatus} onChange={(e)=>setReportStatus(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/20 rounded-md text-white px-3 py-2">
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="col-span-1">
                <Label className="text-gray-300">Ward</Label>
                <Input placeholder="e.g. Ward 12" value={reportWard} onChange={(e) => setReportWard(e.target.value)} className="mt-1 bg-white/5 border-white/20 text-white" />
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-300 text-sm">Matching records: <span className="font-semibold text-white">{filteredIssues.length}</span> of {issues.length}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="bg-white/5 border-white/20 text-white" onClick={() => { setReportFrom(""); setReportTo(""); setReportStatus("all"); setReportWard(""); }}>Clear Filters</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Button className="gap-2 bg-purple-500/80 hover:bg-purple-600/80" onClick={handleExportFilteredCSV} disabled={filteredIssues.length===0}>
                  <Download className="w-4 h-4" />
                  Export Filtered (CSV)
                </Button>
                <Button className="gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20" onClick={handleExportJSON} disabled={filteredIssues.length===0}>
                  <Download className="w-4 h-4" />
                  Export Filtered (JSON)
                </Button>
                <Button className="gap-2 bg-purple-500/80 hover:bg-purple-600/80" onClick={handleExportMonthlySummaryFiltered} disabled={filteredIssues.length===0}>
                  <Download className="w-4 h-4" />
                  Monthly Summary (Filtered)
                </Button>
                <div className="pt-2">
                  <Button variant="outline" className="bg-white/5 border-white/20 text-white" onClick={handleExportCSV}>
                    <Download className="w-4 h-4" />
                    Export All Cases (CSV)
                  </Button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-white">Preview</h3>
                {filteredIssues.length === 0 ? (
                  <p className="text-gray-400 text-sm">No records match the current filters.</p>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-auto pr-1">
                    {filteredIssues.slice(0,8).map(it => (
                      <li key={it.id} className="text-sm text-gray-200 flex items-center justify-between gap-3">
                        <span className="truncate">{it.title}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{(it.status||'open')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMCDashboard;
