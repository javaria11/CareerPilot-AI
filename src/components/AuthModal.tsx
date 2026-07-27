import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getStoredUserProfile } from '../utils/storage';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Rocket,
  BarChart3,
  Brain,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot' | 'reset';
  onLoginSuccess: (user: UserProfile) => void;
  onShowToast: (title: string, type: 'success' | 'error' | 'info', desc?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onLoginSuccess,
  onShowToast,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onShowToast('Missing Fields', 'error', 'Please enter your email address and password.');
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // Clean username: extract portion before @ if email is passed or if fullName contains @
      const rawUser = fullName || (email.includes('@') ? email.split('@')[0] : email);
      const cleanUsername = rawUser.includes('@') ? rawUser.split('@')[0] : rawUser;
      const formattedName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);

      const existingProfile = getStoredUserProfile();
      const isSameUser = existingProfile && existingProfile.email && existingProfile.email.toLowerCase() === email.toLowerCase();

      const user: UserProfile = {
        name: isSameUser && existingProfile.name ? existingProfile.name : (formattedName || 'User'),
        title: isSameUser && existingProfile.title ? existingProfile.title : '',
        tier: isSameUser && existingProfile.tier ? existingProfile.tier : 'PRO MEMBER',
        avatarUrl: isSameUser && existingProfile.avatarUrl ? existingProfile.avatarUrl : '',
        email: email,
        targetRole: isSameUser && existingProfile.targetRole ? existingProfile.targetRole : '',
        targetGoalProgress: isSameUser && existingProfile.targetGoalProgress ? existingProfile.targetGoalProgress : 0,
      };

      onLoginSuccess(user);
      onShowToast('Signed In Successfully', 'success', `Welcome back, ${user.name}!`);
      onClose();
    }, 600);
  };

  const handleSocialSignIn = (provider: 'Google' | 'LinkedIn' | 'GitHub') => {
    setLoading(true);
    onShowToast(`Google Authentication`, 'info', `Connecting securely via ${provider}...`);

    setTimeout(() => {
      setLoading(false);
      const fallbackEmail = email || (provider === 'Google' ? 'javaria.hanif@gmail.com' : 'user@example.com');
      const rawName = fullName || (fallbackEmail.includes('@') ? fallbackEmail.split('@')[0] : 'User');
      const cleanUsername = rawName.includes('@') ? rawName.split('@')[0] : rawName;
      const formattedName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);

      const existingProfile = getStoredUserProfile();
      const isSameUser = existingProfile && existingProfile.email && existingProfile.email.toLowerCase() === fallbackEmail.toLowerCase();

      const user: UserProfile = {
        name: isSameUser && existingProfile.name ? existingProfile.name : (formattedName || 'User'),
        title: isSameUser && existingProfile.title ? existingProfile.title : '',
        tier: isSameUser && existingProfile.tier ? existingProfile.tier : 'PRO MEMBER',
        avatarUrl: isSameUser && existingProfile.avatarUrl ? existingProfile.avatarUrl : '',
        email: fallbackEmail,
        targetRole: isSameUser && existingProfile.targetRole ? existingProfile.targetRole : '',
        targetGoalProgress: isSameUser && existingProfile.targetGoalProgress ? existingProfile.targetGoalProgress : 0,
      };

      onLoginSuccess(user);
      onShowToast(`Signed In with ${provider}`, 'success', `Authenticated as ${user.name} (${fallbackEmail})`);
      onClose();
    }, 750);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      onShowToast('Missing Fields', 'error', 'Please fill in all required fields.');
      return;
    }
    if (!agreedTerms) {
      onShowToast('Terms Required', 'error', 'Please agree to the Terms and Conditions.');
      return;
    }
    if (password.length < 6) {
      onShowToast('Weak Password', 'error', 'Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const cleanName = fullName.includes('@') ? fullName.split('@')[0] : fullName;
      const newUser: UserProfile = {
        name: cleanName,
        title: '',
        tier: 'PRO MEMBER',
        avatarUrl: '',
        email: email,
        targetRole: '',
        targetGoalProgress: 0,
      };

      onLoginSuccess(newUser);
      onShowToast('Account Created', 'success', 'Welcome to CareerPilot AI!');
      onClose();
    }, 700);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      onShowToast('Email Required', 'error', 'Please enter your email address.');
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setResetSent(true);
      onShowToast('Reset Link Sent', 'info', `Password reset instructions sent to ${email}`);
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      onShowToast('Missing Fields', 'error', 'Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      onShowToast('Password Mismatch', 'error', 'Passwords do not match.');
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onShowToast('Password Updated', 'success', 'You can now sign in with your new password.');
      setMode('signin');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 lg:p-8 overflow-y-auto">
      {/* Container Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ------------------- CREATE ACCOUNT MODE (IMAGE 2) ------------------- */}
        {mode === 'signup' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* Left Preview Panel */}
            <div className="lg:col-span-5 bg-[#f4f8fb] p-8 lg:p-10 flex flex-col justify-between border-r border-slate-100">
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#006c49] text-white flex items-center justify-center shadow-sm">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-base text-[#0b1c30]">CareerPilot AI</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl lg:text-3xl font-black text-[#0b1c30] tracking-tight leading-tight">
                    Your journey to <br />
                    <span className="text-[#006c49]">professional excellence</span> <br />
                    starts here.
                  </h2>
                  <p className="text-xs text-[#718096] leading-relaxed font-medium">
                    Join thousands of early-career professionals using AI-driven insights to navigate their future with Guided Ambition.
                  </p>
                </div>
              </div>

                <div className="pt-4 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">CP</div>
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">AI</div>
                    </div>
                    <span className="text-[11px] font-bold text-[#0b1c30]">Trusted by 10k+ professionals</span>
                  </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between bg-white">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0b1c30]">Create your account</h3>
                  <p className="text-xs text-[#718096] mt-0.5">Step into the future of career management.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0b1c30] mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0b1c30] mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="rounded border-slate-300 text-[#006c49] focus:ring-[#006c49]"
                    />
                    <label htmlFor="terms" className="text-[11px] text-[#718096]">
                      I agree to the <span className="text-[#006c49] font-bold cursor-pointer">Terms and Conditions</span> and <span className="text-[#006c49] font-bold cursor-pointer">Privacy Policy</span>.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#006c49] hover:bg-[#005136] text-white font-bold rounded-xl text-xs shadow-md shadow-[#006c49]/20 flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative py-2 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                    <span className="relative bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or sign up with</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialSignIn('Google')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#0b1c30] hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialSignIn('LinkedIn')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#0b1c30] hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                      LinkedIn
                    </button>
                  </div>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-[#718096]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-[#006c49] font-bold hover:underline ml-1"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400">© 2024 CareerPilot AI. All rights reserved.</p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------- SIGN IN MODE (IMAGE 3) ------------------- */}
        {mode === 'signin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] bg-[#f8fafd] relative">
            {/* Background Dotted Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            {/* Left Preview Panel */}
            <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#006c49] text-white flex items-center justify-center shadow-sm">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-base text-[#0b1c30]">CareerPilot AI</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl lg:text-3xl font-black text-[#0b1c30] tracking-tight leading-tight">
                    Your future, <br />
                    <span className="text-[#006c49]">guided by intelligence.</span>
                  </h2>
                  <p className="text-xs text-[#718096] leading-relaxed font-medium">
                    Join thousands of early-career professionals using AI to navigate their path from ambition to achievement.
                  </p>
                </div>

                {/* Feature Pill Cards */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#006c49] flex items-center justify-center">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#0b1c30]">Skill Gap Analysis</span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0058be] flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#0b1c30]">Career Advisor</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                <span className="cursor-pointer hover:text-slate-600">Privacy</span>
                <span>•</span>
                <span className="cursor-pointer hover:text-slate-600">Terms</span>
                <span className="ml-auto flex items-center gap-1 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secure Access
                </span>
              </div>
            </div>

            {/* Right Form Card Panel */}
            <div className="lg:col-span-7 p-8 lg:p-10 bg-white flex flex-col justify-center border-l border-slate-100 relative z-10">
              <div className="max-w-md w-full mx-auto space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0b1c30]">Welcome Back</h3>
                  <p className="text-xs text-[#718096] mt-0.5">Please enter your details to sign in.</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-[#0b1c30]">Password</label>
                      <button
                        type="button"
                        onClick={() => { setResetSent(false); setMode('forgot'); }}
                        className="text-xs text-[#006c49] font-bold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#006c49] focus:ring-[#006c49]"
                    />
                    <label htmlFor="remember" className="text-xs text-[#718096]">
                      Remember for 30 days
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#006c49] hover:bg-[#005136] text-white font-bold rounded-xl text-xs shadow-md shadow-[#006c49]/20 flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative py-2 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                    <span className="relative bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or continue with</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialSignIn('Google')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#0b1c30] hover:bg-slate-50 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialSignIn('LinkedIn')}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#0b1c30] hover:bg-slate-50 transition-colors"
                    >
                      <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                      LinkedIn
                    </button>
                  </div>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-[#718096]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-[#006c49] font-bold hover:underline ml-1"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------- FORGOT / RESET PASSWORD MODE (IMAGE 4) ------------------- */}
        {(mode === 'forgot' || mode === 'reset') && (
          <div className="p-8 lg:p-12 bg-[#f8fafd] flex flex-col items-center justify-center space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#006c49] text-white flex items-center justify-center shadow-md">
                <Rocket className="w-6 h-6" />
              </div>
              <h2 className="font-extrabold text-xl text-[#0b1c30]">CareerPilot AI</h2>
              <p className="text-[10px] text-[#718096] uppercase font-bold tracking-widest">Guided Ambition</p>
            </div>

            <div className="w-full max-w-md bg-white p-8 rounded-2xl border-l-4 border-l-[#006c49] border-y border-r border-slate-200/80 shadow-xl space-y-6">
              {mode === 'forgot' && (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#0b1c30]">Forgot Password?</h3>
                    <p className="text-xs text-[#718096] leading-relaxed">
                      Enter the email address associated with your account and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {resetSent ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-[#006c49] mx-auto" />
                      <h4 className="font-bold text-xs text-[#0b1c30]">Reset Link Dispatched</h4>
                      <p className="text-[11px] text-[#718096]">Check your inbox at <strong>{email}</strong></p>
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        className="mt-2 px-4 py-2 bg-[#006c49] text-white font-bold text-xs rounded-lg hover:bg-[#005136]"
                      >
                        Enter New Password
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0b1c30] mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. alex@example.com"
                            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#006c49] hover:bg-[#005136] text-white font-bold rounded-xl text-xs shadow-md shadow-[#006c49]/20 flex items-center justify-center gap-2 transition-all"
                      >
                        {loading ? 'Sending Instructions...' : 'Send Reset Link'} <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-xs text-[#006c49] font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </>
              )}

              {mode === 'reset' && (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#0b1c30]">Set New Password</h3>
                    <p className="text-xs text-[#718096]">Enter your new secure password below.</p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0b1c30] mb-1">New Password</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#006c49]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0b1c30] mb-1">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#006c49]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#006c49] hover:bg-[#005136] text-white font-bold rounded-xl text-xs shadow-md shadow-[#006c49]/20 flex items-center justify-center gap-2 transition-all"
                    >
                      {loading ? 'Updating Password...' : 'Reset Password'} <ShieldCheck className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-xs text-[#718096] font-bold hover:text-[#0b1c30]"
                    >
                      Cancel and Return to Sign In
                    </button>
                  </div>
                </>
              )}
            </div>

            <p className="text-[10px] text-slate-400 font-medium">
              Secure Authentication • Powered by CareerPilot AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
