import React from 'react';
import {
  Rocket,
  FileText,
  Brain,
  MessageSquare,
  BarChart3,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Mail,
  Globe,
  Sparkles,
} from 'lucide-react';

interface LandingViewProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenSignIn,
  onOpenSignUp,
}) => {
  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#0b1c30] flex flex-col font-sans selection:bg-[#006c49]/20 selection:text-[#006c49]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] px-6 lg:px-12 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#006c49] flex items-center justify-center text-white shadow-sm">
            <Rocket className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg text-[#0b1c30] tracking-tight">CareerPilot AI</span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#4a5568]">
          <span className="text-[#006c49] cursor-default">Features</span>
          <span className="text-[#006c49] cursor-default">About</span>
        </nav>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSignIn}
            className="text-xs font-bold text-[#0b1c30] hover:text-[#006c49] transition-colors px-2 py-1"
          >
            Sign In
          </button>
          <button
            onClick={onOpenSignUp}
            className="text-xs font-bold bg-[#006c49] hover:bg-[#005136] text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-[#0b1c30] leading-[1.12]">
              Elevate Your Career with <br />
              <span className="text-[#006c49]">AI-Powered Guidance.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-[#4a5568] leading-relaxed max-w-xl font-medium">
              Stop guessing and start growing. CareerPilot AI provides personalized analysis, skill tracking, and interview preparation designed to propel your ambition forward.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenSignUp}
                className="px-7 py-3.5 bg-[#006c49] hover:bg-[#005136] text-white font-bold text-sm rounded-lg shadow-lg shadow-[#006c49]/20 transition-all hover:scale-[1.02]"
              >
                Get Started Free
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="User 1"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="User 2"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="User 3"
                />
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-[#0b1c30]">Trusted by 20k+</p>
                <p className="text-[#718096]">students and professionals</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive UI Card Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-slate-100/80 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-9 h-9 rounded-full bg-[#006c49]/10 text-[#006c49] flex items-center justify-center font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0b1c30]">Career Advisor AI</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#718096]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>STATUS: PROCESSING...</span>
                  </div>
                </div>
              </div>

              {/* Skeleton Bars */}
              <div className="space-y-2.5">
                <div className="h-3.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
                <div className="h-3.5 bg-slate-100 rounded-full w-full animate-pulse" />
                <div className="h-3.5 bg-slate-100 rounded-full w-3/4 animate-pulse" />
              </div>

              {/* Match Potential Gauge */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-[#4a5568]">Match Potential</span>
                  <span className="text-[#006c49]">94%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0058be] to-[#006c49] rounded-full w-[94%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Powerful Tools for Every Step */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl lg:text-3xl font-black text-[#0b1c30] tracking-tight">
              Powerful Tools for Every Step
            </h2>
            <p className="text-xs md:text-sm text-[#718096] font-medium leading-relaxed">
              Our integrated suite of AI tools helps you navigate the complex professional landscape with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tool 1 */}
            <div className="bg-[#f8fafd] p-6 rounded-2xl border border-slate-100 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006c49] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0b1c30]">Resume Analyzer</h3>
                <p className="text-xs text-[#718096] leading-relaxed">
                  Instant feedback on your resume with industry-specific keyword optimization and scoring.
                </p>
              </div>
              <div className="w-8 h-1 bg-[#006c49] rounded-full pt-1" />
            </div>

            {/* Tool 2 */}
            <div className="bg-[#f8fafd] p-6 rounded-2xl border border-slate-100 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0058be] flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0b1c30]">Career Advisor</h3>
                <p className="text-xs text-[#718096] leading-relaxed">
                  AI-driven paths based on your unique skills, interests, and real-time market trends.
                </p>
              </div>
              <div className="w-8 h-1 bg-[#0058be] rounded-full pt-1" />
            </div>

            {/* Tool 3 */}
            <div className="bg-[#f8fafd] p-6 rounded-2xl border border-slate-100 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#00687a] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0b1c30]">Interview Generator</h3>
                <p className="text-xs text-[#718096] leading-relaxed">
                  Practice with realistic simulations tailored to the job description you're targeting.
                </p>
              </div>
              <div className="w-8 h-1 bg-[#00687a] rounded-full pt-1" />
            </div>

            {/* Tool 4 */}
            <div className="bg-[#f8fafd] p-6 rounded-2xl border border-slate-100 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006c49] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0b1c30]">Skill Gap Analysis</h3>
                <p className="text-xs text-[#718096] leading-relaxed">
                  Identify what's missing in your profile and get personalized learning recommendations.
                </p>
              </div>
              <div className="w-8 h-1 bg-[#006c49] rounded-full pt-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Testimonials */}
      <section className="py-20 px-6 lg:px-12 bg-[#f8fafd]">
        <div className="max-w-7xl mx-auto space-y-12">
          <h2 className="text-2xl lg:text-3xl font-black text-[#0b1c30] tracking-tight">
            Real Results from Real Users
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1 text-emerald-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#4a5568] leading-relaxed font-medium italic">
                  "The Resume Analyzer helped me land interviews at three Fortune 500 companies within weeks of signing up."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="font-bold text-xs text-[#0b1c30]">Sarah Jenkins</p>
                <p className="text-[10px] text-[#718096]">Software Engineer</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1 text-emerald-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#4a5568] leading-relaxed font-medium italic">
                  "The interview coach gave me the confidence to negotiate a 20% higher salary than my previous role."
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="font-bold text-xs text-[#0b1c30]">Markus Chen</p>
                <p className="text-[10px] text-[#718096]">Marketing Director</p>
              </div>
            </div>

            {/* Highlight Card */}
            <div className="relative rounded-2xl overflow-hidden min-h-[180px] flex items-center justify-center p-6 text-white group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80"
                alt="Cityscape"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20" />
              <div className="relative z-10 text-center space-y-1">
                <h3 className="text-4xl font-black tracking-tight">85%</h3>
                <p className="text-xs font-bold tracking-wider uppercase">Hire Rate Increase</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Banner */}
      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#0058be] via-[#006c49] to-[#10b981] rounded-3xl p-10 lg:p-16 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Take Flight?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-50 max-w-xl mx-auto leading-relaxed">
            Join thousands of successful professionals who have navigated their career paths with CareerPilot AI.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenSignUp}
              className="px-8 py-3.5 bg-white text-[#006c49] font-extrabold text-xs rounded-xl shadow-md hover:bg-slate-50 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-white border-t border-slate-100 py-12 px-6 lg:px-12 text-xs text-[#718096]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#006c49] text-white flex items-center justify-center">
                <Rocket className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-sm text-[#0b1c30]">CareerPilot AI</span>
            </div>
            <p className="text-xs text-[#718096] max-w-xs leading-relaxed">
              The ultimate AI-powered career companion for students and early-career professionals. Guided ambition starts here.
            </p>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-bold text-[11px] text-[#0b1c30] uppercase tracking-wider">Product</h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">Resume Analyzer</button></li>
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">Interview Generator</button></li>
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">Skill Tracker</button></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-bold text-[11px] text-[#0b1c30] uppercase tracking-wider">Company</h4>
            <ul className="space-y-1.5 text-xs font-medium text-slate-600">
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">About Us</button></li>
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">Careers</button></li>
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">Privacy Policy</button></li>
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">Terms of Service</button></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-bold text-[11px] text-[#0b1c30] uppercase tracking-wider">Support</h4>
            <ul className="space-y-1.5 text-xs font-medium text-slate-600">
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">Help Center</button></li>
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">Contact Sales</button></li>
              <li><button onClick={onOpenSignIn} className="hover:text-[#006c49]">Community</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2024 CareerPilot AI. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Clock className="w-4 h-4 cursor-pointer hover:text-slate-600" />
            <Globe className="w-4 h-4 cursor-pointer hover:text-slate-600" />
            <Mail className="w-4 h-4 cursor-pointer hover:text-slate-600" />
          </div>
        </div>
      </footer>
    </div>
  );
};
