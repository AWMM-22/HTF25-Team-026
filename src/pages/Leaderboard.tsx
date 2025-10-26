import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import { Card, CardContent } from '@/components/ui/card';
import { listIssues, type Issue, getProfile } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';

export default function Leaderboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listIssues();
        setIssues(data);
        const uniqueUsers = Array.from(new Set((data||[]).map(i => (i as any).created_by).filter(Boolean)));
        const profs: Record<string, any> = {};
        await Promise.all(uniqueUsers.map(async (uid) => {
          try {
            const p = await getProfile(uid as string);
            profs[uid as string] = p;
          } catch {}
        }));
        setProfiles(profs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Realtime subscribe to issues table
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-issues-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, async (_payload) => {
        try {
          const data = await listIssues();
          setIssues(data);
          const uniqueUsers = Array.from(new Set((data||[]).map(i => (i as any).created_by).filter(Boolean)));
          const profs: Record<string, any> = {};
          await Promise.all(uniqueUsers.map(async (uid) => {
            try { const p = await getProfile(uid as string); profs[uid as string] = p; } catch {}
          }));
          setProfiles(profs);
        } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const ranking = useMemo(() => {
    const counts: Record<string, number> = {};
    (issues || []).forEach(i => {
      const uid = (i as any).created_by;
      if (!uid) return;
      counts[uid] = (counts[uid] || 0) + 1;
    });
    const rows = Object.entries(counts).map(([uid, count]) => ({ uid, count }));
    rows.sort((a, b) => b.count - a.count);
    return rows.slice(0, 20);
  }, [issues]);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="pt-28 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6">Top Citizen Reporters</h1>
        <Card className="border-primary/20">
          <CardContent className="p-4 md:p-6">
            {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
            {!loading && ranking.length === 0 && (
              <div className="text-sm text-muted-foreground">No data yet.</div>
            )}
            {!loading && ranking.length > 0 && (
              <ol className="space-y-3">
                {ranking.map((r, idx) => {
                  const p = profiles[r.uid] || {};
                  return (
                    <li key={r.uid} className="flex items-center justify-between bg-card/60 border border-primary/10 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm">{idx+1}</div>
                        <div>
                          <div className="font-semibold">{p.full_name || p.email || r.uid.slice(0,8)}</div>
                          <div className="text-xs text-muted-foreground">{p.ward ? `Ward ${p.ward}` : 'Ward N/A'}</div>
                        </div>
                      </div>
                      <div className="text-sm"><span className="font-bold">{r.count}</span> reports</div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
