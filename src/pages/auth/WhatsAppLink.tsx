import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DotGrid from '@/components/DotGrid';

export default function WhatsAppLink() {
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
          <h1 className="text-3xl font-bold mb-4">Link WhatsApp</h1>
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4 text-center">
              <div className="w-48 h-48 mx-auto rounded-md border border-primary/20 bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
                QR placeholder
              </div>
              <Button className="w-full">Send message to start verification</Button>
              <div className="text-xs text-muted-foreground">Once verified, a linked badge will show in your profile.</div>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
