import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./lib/AuthProvider";
import VideoBackground from "./components/VideoBackground";
import Index from "./pages/Index";
import UserDashboard from "./pages/UserDashboard";
import BMCDashboard from "./pages/BMCDashboard";
import NotFound from "./pages/NotFound";
// Public
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Issues from "./pages/Issues";
import IssueDetails from "./pages/IssueDetails";
import Community from "./pages/Community";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Maintenance from "./pages/Maintenance";
import Error500 from "./pages/Error500";
// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";
import WhatsAppLink from "./pages/auth/WhatsAppLink";
// User
import Report from "./pages/Report";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
// Admin
import AdminLogin from "./pages/admin/Login";
import AdminIssues from "./pages/admin/Issues";
import AdminIssueDetails from "./pages/admin/IssueDetails";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminManageUsers from "./pages/admin/ManageUsers";
import AdminSettings from "./pages/admin/Settings";
import Heatmap from "./pages/Heatmap";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

function RouteBackground() {
  const location = useLocation();
  const path = location.pathname;
  const showBg = (
    path === "/issues" ||
    path === "/faq" ||
    path === "/contact" ||
    path === "/auth/login" ||
    path === "/auth/signup" ||
    path === "/report" ||
    path === "/heatmap" ||
    path === "/leaderboard" ||
    path === "/report"
  );
  return showBg ? <VideoBackground /> : null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
      <BrowserRouter>
        <RouteBackground />
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Public */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetails />} />
          <Route path="/community" element={<Community />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/500" element={<Error500 />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/verify-otp" element={<VerifyOTP />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/whatsapp-link" element={<WhatsAppLink />} />
          {/* User Portal */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/report" element={<Report />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          {/* Admin Portal */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<BMCDashboard />} />
          <Route path="/admin/issues" element={<AdminIssues />} />
          <Route path="/admin/issues/:id" element={<AdminIssueDetails />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/manage-users" element={<AdminManageUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
