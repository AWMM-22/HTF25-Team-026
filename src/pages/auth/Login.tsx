import { useState } from 'react';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import LoadingButton from '@/components/LoadingButton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import DotGrid from '@/components/DotGrid';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Logged in');
      window.location.href = '/dashboard';
    } catch (e: any) {
      toast.error(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message || 'Google sign-in failed');
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
          <h1 className="text-3xl font-bold mb-4">Login</h1>
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <LoadingButton loading={loading} className="w-full" onClick={handleLogin}>Login</LoadingButton>
              <Button variant="outline" className="w-full" onClick={handleGoogle}>Continue with Google</Button>
              <Button variant="outline" className="w-full">Continue with WhatsApp</Button>
              <div className="flex items-center justify-between text-sm">
                <a href="/auth/forgot-password" className="text-primary hover:underline">Forgot Password?</a>
                <a href="/auth/signup" className="text-primary hover:underline">New here? Sign up</a>
              </div>
              <Separator className="my-2" />
              <div className="text-xs text-muted-foreground">By continuing, you agree to our <a className="underline" href="/terms">Terms</a> and <a className="underline" href="/privacy">Privacy</a>.</div>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
