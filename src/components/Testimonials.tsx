import { Card, CardContent } from '@/components/ui/card';

const stories = [
  { name: 'Aarav', ward: 'Ward 5', quote: 'My complaint about a broken drain was resolved in 3 days. The updates kept me informed throughout!', before: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop', after: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop' },
  { name: 'Meera', ward: 'Ward 12', quote: 'We reported overflowing garbage and the municipal team cleared it the next morning.', before: 'https://images.unsplash.com/photo-1563906267088-9f9331b9046d?q=80&w=1200&auto=format&fit=crop', after: 'https://images.unsplash.com/photo-1456444029059-7c6a7b8d1dc5?q=80&w=1200&auto=format&fit=crop' },
  { name: 'Ravi', ward: 'Ward 3', quote: 'Streetlights were repaired after multiple reports got consolidated by NagarNetra.', before: 'https://images.unsplash.com/photo-1531258918101-b2c7df8df1d9?q=80&w=1200&auto=format&fit=crop', after: 'https://images.unsplash.com/photo-1504972211601-b09d858b4a40?q=80&w=1200&auto=format&fit=crop' },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8">Community Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((s, idx) => (
            <Card key={idx} className="border-primary/20 overflow-hidden">
              <div className="grid grid-cols-2 gap-0">
                <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${s.before})` }} />
                <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${s.after})` }} />
              </div>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{s.ward}</div>
                <div className="font-semibold">{s.name}</div>
                <p className="text-sm mt-2">“{s.quote}”</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
