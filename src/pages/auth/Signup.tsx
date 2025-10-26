import { useState } from 'react';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import LoadingButton from '@/components/LoadingButton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import DotGrid from '@/components/DotGrid';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [ward, setWard] = useState<string | undefined>();
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  async function handleSignup() {
    if (!agree) {
      toast.error('Please agree to the terms');
      return;
    }
    if (!email) {
      toast.error('Email is required for OTP');
      return;
    }
    try {
      setLoading(true);
      // Persist profile fields to finalize after OTP verification
      localStorage.setItem('pendingProfile', JSON.stringify({ full_name: fullName, email, phone, ward, password }));
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) throw error;
      toast.success('OTP sent to your email');
      window.location.href = '/auth/verify-otp';
    } catch (e: any) {
      toast.error(e.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Animated DotGrid Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#5227FF"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main className="pt-28 max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div>
                <label className="text-sm">Ward / Area</label>
                <Select value={ward} onValueChange={setWard}>
                  <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ward-1">Ward 1</SelectItem>
                    <SelectItem value="ward-2">Ward 2</SelectItem>
                    <SelectItem value="ward-3">Ward 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Profile Photo (optional)</label>
                <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Checkbox id="terms" checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} />
                <label htmlFor="terms">I agree to the <a className="underline" href="/terms">terms</a></label>
              </div>
              <LoadingButton loading={loading} className="w-full" onClick={handleSignup}>Sign Up with Email OTP</LoadingButton>
              <div className="text-sm text-center">
                Already have an account? <a className="text-primary hover:underline" href="/auth/login">Login</a>
              </div>
              <div className="text-xs text-muted-foreground text-center">We will verify your email with a one-time code. You can set a password after verification.</div>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
