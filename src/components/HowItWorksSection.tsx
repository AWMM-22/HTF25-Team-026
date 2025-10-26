import { Camera, MapPin, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Report",
    description: "Upload images of civic issues like waste, potholes, or local problems with location details.",
    step: "01",
  },
  {
    icon: MapPin,
    title: "Track",
    description: "Monitor your complaint status in real-time as it gets assigned and processed by authorities.",
    step: "02",
  },
  {
    icon: CheckCircle,
    title: "Resolved",
    description: "Receive updates when the issue is resolved with proof images from the authorities.",
    step: "03",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 px-8 md:px-16 lg:px-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
          How It{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Works
          </span>
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
          Three simple steps to make a difference in your community
        </p>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                <div className="text-center p-6 rounded-2xl bg-card/50 border border-transparent hover:border-primary/30 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                  {/* Step Number */}
                  <div className="text-6xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors duration-300 mb-4">{step.step}</div>
                  
                  {/* Icon */}
                  <div className="inline-flex w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-full items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
