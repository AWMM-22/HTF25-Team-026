import { useNavigate } from "react-router-dom";
import LaserFlow from "./LaserFlow";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-background">
      {/* Laser Flow Background */}
      <div className="absolute inset-0 z-0">
        <LaserFlow
          color="#a855f7"
          horizontalBeamOffset={0.1}
          verticalBeamOffset={-0.25}
          horizontalSizing={0.5}
          verticalSizing={2}
          wispDensity={1}
          wispSpeed={15}
          wispIntensity={5}
          flowSpeed={0.35}
          flowStrength={0.25}
          fogIntensity={0.55}
          fogScale={0.3}
          fogFallSpeed={0.6}
          decay={1.1}
          falloffStart={1.2}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-start px-8 md:px-16 lg:px-24">
        <div className="max-w-4xl">
          {/* Headline and copy */}
          <h1 className="text-6xl md:text-[5.5rem] leading-tight md:leading-[1.02] font-extrabold mb-6 tracking-tight text-foreground">
            <div>Empowering citizens</div>
            <div className="mt-1">
              to build better{" "}
              <span className="bg-gradient-to-r from-[#e879f9] via-[#c084fc] to-[#a855f7] bg-clip-text text-transparent">
                wards
              </span>
            </div>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl" style={{ opacity: 0.95 }}>
            NagarNetra lets you report civic issues, track their resolution, and collaborate with authorities to improve your community.
          </p>

          <div className="flex items-center space-x-6">
            <button
              className="relative inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-white/90 to-white/70 text-black font-semibold shadow-none overflow-hidden"
              onClick={() => navigate('/report')}
            >
              <span className="relative z-10">Report Now</span>
              <span aria-hidden className="absolute -inset-0.5 rounded-full blur-xl opacity-60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ffb86b] via-[#ff6b8a] to-[#a06cff]" style={{ mixBlendMode: 'screen', filter: 'blur(18px)' }}></span>
            </button>

            <button
              onClick={() => navigate('/issues')}
              className="px-6 py-3 rounded-full border border-primary/30 text-primary font-semibold bg-transparent hover:bg-primary/5 transition"
            >
              Explore Issues
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
