import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DotGrid from '@/components/DotGrid';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen relative overflow-hidden">
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
          <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <Input placeholder="Email or phone" />
              <Button className="w-full">Send OTP</Button>
              <div className="h-px bg-border" />
              <Input type="password" placeholder="New password" />
              <Input type="password" placeholder="Confirm new password" />
              <Button className="w-full">Reset Password</Button>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
