import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import VideoBackground from '@/components/VideoBackground';
import LoadingButton from '@/components/LoadingButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getIssueById, type Issue, listIssueComments, addIssueComment, type IssueComment } from '@/lib/db';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

export default function IssueDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [posting, setPosting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getIssueById(id);
        setIssue(data);
        try {
          const c = await listIssueComments(id);
          setComments(c);
        } catch {}
      } catch (e: any) {
        toast.error(e.message || 'Failed to load issue');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Realtime comments for this issue
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`issue-${id}-comments`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issue_comments' }, async (_payload) => {
        try {
          const c = await listIssueComments(id);
          setComments(c);
        } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Realtime single issue updates (status, completed_image, etc.)
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`issue-${id}-updates`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, async (_payload) => {
        try {
          const data = await getIssueById(id);
          setIssue(data);
        } catch {}
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <VideoBackground />
      <main className="pt-28 max-w-5xl mx-auto px-6 space-y-6">
        {loading && <div className="text-sm text-center text-muted-foreground">Loading...</div>}
        {!loading && issue && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{issue.title} <span className="text-muted-foreground text-base">#{issue.id}</span></h1>
                <div className="text-sm text-muted-foreground">Submitted • {issue.ward ?? 'Ward N/A'}</div>
              </div>
              <div className="flex gap-2">
                <LoadingButton variant="outline">Follow Issue</LoadingButton>
                <LoadingButton>Upvote Priority</LoadingButton>
              </div>
            </div>

            {/* Media + Map */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-2 border-primary/20 overflow-hidden">
                <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${issue.media?.[0] || 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop'})` }} />
                <CardContent className="p-3 text-sm text-muted-foreground">Photos/Videos gallery placeholder</CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-3">
                  <div className="h-56 rounded-md border border-primary/20 bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">Map (zoomed-in)</div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="border-primary/20">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{issue.category}</Badge>
                  <Badge variant="outline">{issue.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              </CardContent>
            </Card>

            {/* Timeline */}
            <section>
              <h2 className="font-semibold mb-3">Timeline</h2>
              <div className="space-y-2 text-sm">
                <div>• Submitted — 2 days ago</div>
                <div>• Verified — 1 day ago</div>
                <div>• In Progress — Today</div>
              </div>
            </section>

            {/* Comments */}
            <section>
              <h2 className="font-semibold mb-3">Comments</h2>
              <Card className="border-primary/20">
                <CardContent className="p-4 space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No comments yet.</div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{c.user_id.slice(0,8)}:</span> {c.content}
                      </div>
                    ))
                  )}
                  <div>
                    <Textarea placeholder="Write a comment..." value={text} onChange={(e)=>setText(e.target.value)} />
                    <div className="flex justify-end mt-2">
                      <LoadingButton size="sm" disabled={!user || !text.trim()} loading={posting} onClick={async ()=>{
                        if (!id || !user || !text.trim()) return;
                        try {
                          setPosting(true);
                          const c = await addIssueComment(id, user.id, text.trim());
                          setComments((prev)=>[...prev, c]);
                          setText('');
                        } catch (e:any) {
                          toast.error(e?.message || 'Failed to post');
                        } finally {
                          setPosting(false);
                        }
                      }}>Post</LoadingButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
