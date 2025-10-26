import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const mock = [
  { id: 'ISS-1024', title: 'Overflowing Garbage Bin', location: 'Ward 12, Sector 5', category: 'Garbage', image: 'https://images.unsplash.com/photo-1563906267088-9f9331b9046d?q=80&w=1200&auto=format&fit=crop' },
  { id: 'ISS-1030', title: 'Broken Street Light', location: 'Ward 7, MG Road', category: 'Light', image: 'https://images.unsplash.com/photo-1531258918101-b2c7df8df1d9?q=80&w=1200&auto=format&fit=crop' },
  { id: 'ISS-1045', title: 'Potholes on Main Street', location: 'Ward 3, Main St', category: 'Road', image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop' },
];

export default function FeaturedIssues() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl font-bold">Featured Issues</h2>
          <a href="/issues" className="text-primary hover:underline">View All</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mock.map((it) => (
            <Card key={it.id} className="overflow-hidden border-primary/20">
              <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${it.image})` }} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{it.title}</h3>
                  <Badge variant="secondary">{it.category}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{it.location}</div>
                <Button size="sm" className="mt-3" asChild>
                  <a href={`/issues/${it.id}`}>Open</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
