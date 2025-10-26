import { Shield, Eye, Zap } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-8 md:px-16 lg:px-24 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
          About{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Swatchh India
          </span>
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          A citizen-powered platform connecting communities with local authorities to address civic issues efficiently. 
          Using AI verification and real-time tracking, we ensure transparency and accountability in issue resolution.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group p-8 border border-primary/30 rounded-2xl hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">AI-Verified Reports</h3>
            <p className="text-muted-foreground">
              Advanced AI technology verifies and categorizes reports automatically, ensuring authenticity and proper routing to relevant authorities.
            </p>
          </div>

          <div className="group p-8 border border-primary/30 rounded-2xl hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Real-Time Tracking</h3>
            <p className="text-muted-foreground">
              Monitor your complaint status from submission to resolution with complete transparency and regular updates.
            </p>
          </div>

          <div className="group p-8 border border-primary/30 rounded-2xl hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Quick Resolution</h3>
            <p className="text-muted-foreground">
              Direct communication channel between citizens and BMC/DMC authorities for faster issue resolution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
