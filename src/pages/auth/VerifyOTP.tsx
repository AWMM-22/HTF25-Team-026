import { useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import DotGrid from '@/components/DotGrid';
import LoadingButton from '@/components/LoadingButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/lib/supabaseClient';
import { upsertProfile } from '@/lib/db';
import { toast } from 'sonner';

export default function VerifyOTP() {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const pending = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('pendingProfile') || '{}'); } catch { return {}; }
  }, []);
  const email: string | undefined = pending?.email;

  async function handleVerify() {
    if (!email) return toast.error('Missing email');
    if (code.length !== 6) return toast.error('Enter 6-digit code');
    try {
      setVerifying(true);
      const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) throw error;
      // Set password and profile data
      const password = pending?.password as string | undefined;
      if (password) {
        const { error: uerr } = await supabase.auth.updateUser({ password, data: { full_name: pending?.full_name, phone: pending?.phone, ward: pending?.ward, email } });
        if (uerr) throw uerr;
      }
      if (data.session?.user) {
        await upsertProfile({ id: data.session.user.id, full_name: pending?.full_name, email, phone: pending?.phone, ward: pending?.ward });
      }
      localStorage.removeItem('pendingProfile');
      toast.success('Email verified');
      window.location.href = '/dashboard';
    } catch (e: any) {
      toast.error(e.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!email) return toast.error('Missing email');
    try {
      setResending(true);
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) throw error;
      toast.success('OTP resent to email');
    } catch (e: any) {
      toast.error(e.message || 'Resend failed');
    } finally {
      setResending(false);
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
          <h1 className="text-3xl font-bold mb-4">Verify OTP</h1>
          <p className="text-sm text-muted-foreground mb-4">We sent a 6-digit code to {email ? email : 'your email'}.</p>
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <InputOTP maxLength={6} value={code} onChange={(v) => setCode(v)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <LoadingButton className="w-full" loading={verifying} onClick={handleVerify}>Verify</LoadingButton>
              <LoadingButton variant="outline" className="w-full" loading={resending} onClick={handleResend}>Resend OTP</LoadingButton>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
