import { Button } from '@/components/ui/button';

export default function GetInvolved() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold">Join your ward community today</h2>
        <p className="text-muted-foreground mt-2">Report issues, track progress, and collaborate for better neighborhoods.</p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button onClick={() => (window.location.href = '/auth/signup')}>Sign Up</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/contact')}>Partner with Us</Button>
        </div>
      </div>
    </section>
  );
}
