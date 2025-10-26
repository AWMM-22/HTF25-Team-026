import { Clock, Image, MapPinned, Users, Bot, Lock } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description: "Stay updated with live status of your complaints from submission to resolution.",
  },
  {
    icon: Image,
    title: "Image Upload",
    description: "Upload clear photos of issues to help authorities understand and act quickly.",
  },
  {
    icon: MapPinned,
    title: "Location Tagging",
    description: "Precise location data ensures issues are routed to the right department instantly.",
  },
  {
    icon: Users,
    title: "Separate Admin Portal",
    description: "Dedicated BMC/DMC portal for efficient complaint management and resolution.",
  },
  {
    icon: Bot,
    title: "AI Verification",
    description: "Advanced AI validates reports and categorizes issues for faster processing.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your data is encrypted and handled with the highest security standards.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-8 md:px-16 lg:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
          Powerful{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Features
          </span>
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          Everything you need to report, track, and resolve civic issues efficiently
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-8 border border-primary/20 rounded-2xl hover:border-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] overflow-hidden"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors group-hover:scale-110 duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
