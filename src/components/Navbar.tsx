import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthProvider";

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const [adminAuthed, setAdminAuthed] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync admin auth flag from localStorage so Navbar reflects admin login/logout
  useEffect(() => {
    const load = () => {
      try { setAdminAuthed(window.localStorage.getItem('bmc_admin_authed') === '1'); } catch { setAdminAuthed(false); }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'bmc_admin_authed') load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? "w-[95%] max-w-6xl" : "w-[90%] max-w-6xl"
      }`}
    >
      <div
        className={`backdrop-blur-md border rounded-full px-6 py-3 md:px-8 md:py-4 transition-all duration-300 overflow-hidden ${
          isScrolled
            ? "bg-background/80 border-primary/50 shadow-lg"
            : "bg-primary/10 border-primary/30"
        }`}
      >
        <div className="flex items-center gap-3 md:gap-6 flex-nowrap">
          {/* Left: Logo */}
          <Link to="/" className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#e879f9] via-[#c084fc] to-[#a855f7] bg-clip-text text-transparent shrink-0 whitespace-nowrap">
            NagarNetra
          </Link>
          {/* Center: Links (desktop) */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-5 lg:space-x-7 whitespace-nowrap">
            <Link to="/" className="text-sm lg:text-base tracking-tight text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/about" className="text-sm lg:text-base tracking-tight text-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/issues" className="text-sm lg:text-base tracking-tight text-foreground hover:text-primary transition-colors">Explore</Link>
            <Link to="/heatmap" className="text-sm lg:text-base tracking-tight text-foreground hover:text-primary transition-colors">Heatmap</Link>
            <Link to="/leaderboard" className="text-sm lg:text-base tracking-tight text-foreground hover:text-primary transition-colors">Leaderboard</Link>
            <Link to="/faq" className="text-sm lg:text-base tracking-tight text-foreground hover:text-primary transition-colors">FAQ</Link>
            <Link to="/contact" className="text-sm lg:text-base tracking-tight text-foreground hover:text-primary transition-colors">Contact</Link>
          </div>

          <div className="flex items-center space-x-4">
          {!(user || adminAuthed) ? (
            <>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full"
                onClick={() => navigate("/auth/login")}
              >
                Login / Sign Up
              </Button>
              <Button
                className="bg-primary hover:bg-primary-glow rounded-full"
                onClick={() => navigate("/auth/login")}
              >
                Report an Issue
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                className="bg-primary hover:bg-primary-glow rounded-full"
                onClick={() => navigate("/report")}
              >
                Report an Issue
              </Button>
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={async () => {
                  try { window.localStorage.removeItem('bmc_admin_authed'); } catch {}
                  await signOut();
                  window.location.assign("/");
                }}
              >
                Logout
              </Button>
            </>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
