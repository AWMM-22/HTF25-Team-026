import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ImpactStats from "@/components/ImpactStats";
import FeaturedIssues from "@/components/FeaturedIssues";
import Testimonials from "@/components/Testimonials";
import GetInvolved from "@/components/GetInvolved";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <ImpactStats />
      <FeaturedIssues />
      <Testimonials />
      <GetInvolved />
      <SiteFooter />
    </div>
  );
};

export default Index;
