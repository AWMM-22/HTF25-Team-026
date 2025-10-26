export default function SiteFooter() {
  return (
    <footer className="border-t border-primary/10 py-10 mt-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">NagarNetra</div>
          <p className="text-sm text-muted-foreground mt-2">Empowering citizens to build better wards.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Quick Links</div>
          <ul className="space-y-1 text-sm">
            <li><a href="/about" className="hover:underline">About</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
            <li><a href="/privacy" className="hover:underline">Privacy</a></li>
            <li><a href="/terms" className="hover:underline">Terms</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Social</div>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:underline">LinkedIn</a></li>
            <li><a href="#" className="hover:underline">Twitter</a></li>
            <li><a href="#" className="hover:underline">YouTube</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <div className="text-sm text-muted-foreground">support@wardpulse.in</div>
          <div className="text-xs text-muted-foreground mt-4">© {new Date().getFullYear()} NagarNetra. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
