import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { label: 'Issues Reported', value: '10,245+' },
  { label: 'Resolved', value: '7,900+' },
  { label: 'Active Wards', value: '85' },
  { label: 'Citizen Contributors', value: '1,200+' },
];

export default function ImpactStats() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8">Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <Card key={s.label} className="border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
