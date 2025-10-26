import { Mail, Phone, MapPin } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-8 md:px-16 lg:px-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Get In{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Touch
          </span>
        </h2>
        <p className="text-xl text-muted-foreground mb-12">
          Have questions? We're here to help make your community better
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 border border-primary/30 rounded-xl hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-muted-foreground">support@swatchhindia.in</p>
          </div>

          <div className="p-6 border border-primary/30 rounded-xl hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Phone</h3>
            <p className="text-muted-foreground">1800-XXX-XXXX</p>
          </div>

          <div className="p-6 border border-primary/30 rounded-xl hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Office</h3>
            <p className="text-muted-foreground">Mumbai, India</p>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-8">
          <p className="text-muted-foreground">
            © 2025 Swatchh India. All rights reserved. Making India cleaner, one report at a time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
