import React, { useState } from 'react';
import { X, Sparkles, Check, Zap, Award } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [upgraded, setUpgraded] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setUpgraded(true);
    setTimeout(() => {
      alert('Congratulations! You have upgraded to CareerPilot Pro.');
      setUpgraded(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#bbcabf]/30 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-[#006c49] via-[#10b981] to-[#0058be] opacity-90" />

        {/* Close button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-50 p-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Content */}
        <div className="relative z-10 pt-8 px-8 pb-4 text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CareerPilot Pro</span>
          </div>
          <h3 className="text-2xl font-bold">Accelerate Your Career Transition</h3>
          <p className="text-xs text-white/80 mt-1">
            Unlock unlimited AI resume analyses, live mock interview scoring, and custom roadmaps.
          </p>
        </div>

        {/* Body Content */}
        <div className="p-8 space-y-6">
          {/* Billing Selector */}
          <div className="flex items-center justify-center gap-2 bg-[#eff4ff] p-1.5 rounded-full w-fit mx-auto border border-[#bbcabf]/30">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#006c49] text-white shadow-sm'
                  : 'text-[#6c7a71] hover:text-[#0b1c30]'
              }`}
            >
              Monthly ($19/mo)
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-[#006c49] text-white shadow-sm'
                  : 'text-[#6c7a71] hover:text-[#0b1c30]'
              }`}
            >
              Yearly ($12/mo)
              <span className="bg-[#10b981] text-[#00422b] text-[9px] px-1.5 py-0.5 rounded-full uppercase">
                Save 35%
              </span>
            </button>
          </div>

          {/* Feature List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#0b1c30]">
            <div className="flex items-center gap-2.5 p-2.5 bg-[#f8f9ff] rounded-xl border border-[#bbcabf]/20">
              <Check className="w-4 h-4 text-[#006c49] shrink-0" />
              <span>Unlimited Resume ATS Scans</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-[#f8f9ff] rounded-xl border border-[#bbcabf]/20">
              <Check className="w-4 h-4 text-[#006c49] shrink-0" />
              <span>Real-Time Tone & Vocal Sentiment</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-[#f8f9ff] rounded-xl border border-[#bbcabf]/20">
              <Check className="w-4 h-4 text-[#006c49] shrink-0" />
              <span>Unlimited Mock Interview Sessions</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-[#f8f9ff] rounded-xl border border-[#bbcabf]/20">
              <Check className="w-4 h-4 text-[#006c49] shrink-0" />
              <span>Personalized AI Learning Roadmaps</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-[#f8f9ff] rounded-xl border border-[#bbcabf]/20">
              <Check className="w-4 h-4 text-[#006c49] shrink-0" />
              <span>Priority 24/7 AI Career Advisor</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-[#f8f9ff] rounded-xl border border-[#bbcabf]/20">
              <Check className="w-4 h-4 text-[#006c49] shrink-0" />
              <span>Verified Skill Badges & Portfolio Projects</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-2">
            <button
              onClick={handleUpgrade}
              disabled={upgraded}
              className="w-full py-4 bg-gradient-to-r from-[#006c49] via-[#10b981] to-[#0058be] text-white font-bold text-sm rounded-xl shadow-xl hover:shadow-2xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {upgraded ? (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-bounce" /> Activating Pro Subscription...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4" /> Start 7-Day Free Trial
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-full text-center text-xs font-semibold text-[#6c7a71] hover:text-[#0b1c30] transition-colors py-1 cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
