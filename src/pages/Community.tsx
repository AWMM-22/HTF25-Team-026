import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Community() {
  const leaderboard = [
    { name: 'Aarav', ward: 'Ward 5', points: 320 },
    { name: 'Meera', ward: 'Ward 12', points: 290 },
    { name: 'Ravi', ward: 'Ward 3', points: 260 },
  ];
  const posts = [
    { title: 'How to file effective reports', tag: 'Guide' },
    { title: 'Monsoon preparedness by your ward', tag: 'Awareness' },
    { title: 'Citizen spotlight: Cleanup drive success', tag: 'Story' },
  ];
  const events = [
    { title: 'Ward 7 Cleanup Drive', date: 'Sat 10:00 AM' },
    { title: 'Tree Plantation - Ward 3', date: 'Sun 9:00 AM' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 max-w-6xl mx-auto px-6 space-y-10">
        <h1 className="text-4xl font-bold">Community Feed</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <Card className="border-primary/20">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">Ward Leaderboard</h2>
              <div className="space-y-2 text-sm">
                {leaderboard.map((u, i) => (
                  <div key={u.name} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{i + 1}. {u.name}</span>
                      <span className="text-muted-foreground"> — {u.ward}</span>
                    </div>
                    <Badge variant="secondary">{u.points} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          <Card className="md:col-span-2 border-primary/20">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">Recent Posts</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {posts.map((p, i) => (
                  <div key={i} className="p-4 rounded-md border border-primary/20">
                    <Badge variant="outline" className="mb-2">{p.tag}</Badge>
                    <div className="font-medium">{p.title}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events */}
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-3">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((e, i) => (
                <div key={i} className="p-4 rounded-md border border-primary/20 flex items-center justify-between">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-sm text-muted-foreground">{e.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
