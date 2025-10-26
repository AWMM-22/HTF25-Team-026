import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import VideoBackground from '@/components/VideoBackground';
import LoadingButton from '@/components/LoadingButton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthProvider';
import { getProfile, upsertProfile } from '@/lib/db';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('');
  const [joined, setJoined] = useState('');

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      try {
        setLoading(true);
        const prof = await getProfile(user.id);
        setFullName(prof?.full_name ?? '');
        setEmail(prof?.email ?? user.email ?? '');
        setPhone(prof?.phone ?? '');
        setWard(prof?.ward ?? '');
        setJoined(prof?.joined_at ?? '');
      } catch (e: any) {
        // ignore if not exists
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    try {
      setSaving(true);
      await upsertProfile({ id: user.id, full_name: fullName, email, phone, ward });
      toast.success('Profile saved');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <VideoBackground />
      <main className="pt-28 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4">Profile</h1>
        <Card className="border-primary/20">
          <CardContent className="p-6 grid md:grid-cols-2 gap-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div>
                  <label className="text-sm">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm">Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm">Ward</label>
                  <Input value={ward} onChange={(e) => setWard(e.target.value)} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <LoadingButton loading={saving} onClick={handleSave}>Save</LoadingButton>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        {joined && <div className="text-xs text-muted-foreground mt-2">Joined: {new Date(joined).toLocaleDateString()}</div>}
      </main>
      <SiteFooter />
    </div>
  );
}
