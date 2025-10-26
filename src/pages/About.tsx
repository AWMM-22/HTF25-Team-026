import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function About() {
  const team = [
    { name: 'Aanya Gupta', role: 'Product Lead', img: 'https://i.pravatar.cc/150?img=12', li: '#' },
    { name: 'Karthik Rao', role: 'Engineering', img: 'https://i.pravatar.cc/150?img=32', li: '#' },
    { name: 'Sara Khan', role: 'Design', img: 'https://i.pravatar.cc/150?img=45', li: '#' },
    { name: 'Vikram Singh', role: 'Partnerships', img: 'https://i.pravatar.cc/150?img=15', li: '#' },
  ];

  const partners = ['Municipal Corp', 'Clean City NGO', 'Urban Lab', 'CivicTech'];

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="pt-28 max-w-6xl mx-auto px-6 space-y-14">
        <section>
          <h1 className="text-4xl font-bold">About NagarNetra</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">Our mission is to empower citizens with simple tools to report civic issues, and our vision is a transparent feedback loop between communities and authorities for faster, verifiable resolutions.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">What Problem We Solve</h2>
          <Card className="border-primary/20">
            <CardContent className="p-6 grid md:grid-cols-3 gap-6">
              <div>
                <div className="font-semibold">Report</div>
                <p className="text-sm text-muted-foreground">Snap a photo, add details and location. Your report is logged instantly.</p>
              </div>
              <div>
                <div className="font-semibold">Track</div>
                <p className="text-sm text-muted-foreground">Get updates as authorities verify and work on the issue.</p>
              </div>
              <div>
                <div className="font-semibold">Resolve</div>
                <p className="text-sm text-muted-foreground">Receive proof of fix with before/after images and timestamps.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((m) => (
              <Card key={m.name} className="border-primary/20 text-center">
                <CardContent className="p-6">
                  <img src={m.img} alt={m.name} className="w-20 h-20 rounded-full mx-auto" />
                  <div className="mt-3 font-semibold">{m.name}</div>
                  <div className="text-sm text-muted-foreground">{m.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Partners</h2>
          <div className="flex flex-wrap gap-3">
            {partners.map((p) => (
              <span key={p} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm">{p}</span>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold">Partner with us</h2>
          <p className="text-muted-foreground mt-1">Collaborate for cleaner, safer neighborhoods.</p>
          <div className="mt-4">
            <Button asChild>
              <a href="/contact">Contact for Partnerships</a>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
