import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Contact() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="pt-28 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
        <section>
          <h1 className="text-4xl font-bold mb-4">Contact / Support</h1>
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm">Name</label>
                <Input placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm">Email</label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm">Message</label>
                <Textarea placeholder="How can we help?" rows={5} />
              </div>
              <Button>Send Message</Button>
            </CardContent>
          </Card>
        </section>
        <section className="pt-10 md:pt-16">
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-muted-foreground">support@wardpulse.in</div>
              </div>
              <div>
                <div className="font-semibold">Address</div>
                <div className="text-muted-foreground">NagarNetra HQ, Mumbai, India</div>
              </div>
              <div>
                <div className="font-semibold">Social</div>
                <div className="text-muted-foreground">LinkedIn, Twitter, YouTube</div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <Card className="border-primary/20">
          <CardContent className="p-0">
            <SiteFooter />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
