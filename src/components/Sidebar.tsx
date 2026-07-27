import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  FileText,
  Brain,
  MessageSquare,
  BarChart3,
  Sparkles,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpgradeModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenHelpModal: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpgradeModal,
  onOpenSettingsModal,
  onOpenHelpModal,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: LayoutDashboard },
    { id: 'resume-analyzer' as ActiveTab, label: 'Resume Analyzer', icon: FileText },
    { id: 'career-advisor' as ActiveTab, label: 'Career Advisor', icon: Brain },
    { id: 'interview-generator' as ActiveTab, label: 'Interview Generator', icon: MessageSquare },
    { id: 'skill-gap-analysis' as ActiveTab, label: 'Skill Gap Analysis', icon: BarChart3 },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full py-6">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006c49] to-[#0058be] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-[#006c49] leading-tight">CareerPilot AI</h1>
            <p className="text-[11px] text-[#6c7a71] font-semibold tracking-wider uppercase">Guided Ambition</p>
          </div>
        </div>
        {isOpenMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-[#6c7a71] hover:bg-slate-100 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-semibold transition-all duration-200 text-left relative ${
                isActive
                  ? 'text-[#006c49] bg-[#2170e4]/5 border-l-[3px] border-[#006c49]'
                  : 'text-[#3c4a42] hover:bg-[#dce9ff] hover:text-[#006c49]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#006c49]' : 'text-[#6c7a71]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer & Upgrade CTA */}
      <div className="px-6 mt-auto space-y-4">
        <button
          onClick={onOpenUpgradeModal}
          className="w-full bg-gradient-to-r from-[#006c49] to-[#10b981] text-white py-3.5 px-4 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upgrade to Pro</span>
        </button>

        <div className="pt-4 border-t border-[#bbcabf]/30 space-y-1">
          <button
            onClick={onOpenSettingsModal}
            className="w-full flex items-center gap-3 py-2.5 px-2 text-sm font-medium text-[#3c4a42] hover:text-[#006c49] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#6c7a71]" />
            <span>Settings</span>
          </button>
          <button
            onClick={onOpenHelpModal}
            className="w-full flex items-center gap-3 py-2.5 px-2 text-sm font-medium text-[#3c4a42] hover:text-[#006c49] transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#6c7a71]" />
            <span>Help & FAQ</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-[280px] bg-[#f8f9ff] border-r border-[#bbcabf]/20 shadow-sm z-40">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-[280px] max-w-[80vw] bg-[#f8f9ff] h-full shadow-2xl z-50 flex flex-col">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
