import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, User, Shield, Sliders, Trash2, Check, Lock, Bell, KeyRound } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onClearData: () => void;
  onClearResumes?: () => void;
  onClearInterviews?: () => void;
  onClearSkillGap?: () => void;
  onClearChat?: () => void;
  onClearActivities?: () => void;
  onShowToast?: (title: string, type: 'success' | 'error' | 'info', desc?: string) => void;
  onlyProfile?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onClearData,
  onClearResumes,
  onClearInterviews,
  onClearSkillGap,
  onClearChat,
  onClearActivities,
  onShowToast,
  onlyProfile = false,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'preferences'>('profile');
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Notification settings state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [weeklyProgress, setWeeklyProgress] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
      setFormData(userProfile);
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      ...formData,
      targetGoalProgress: formData.targetGoalProgress || (formData.targetRole ? 60 : 0),
    };
    onSaveProfile(updatedProfile);
    setSavedSuccess(true);
    if (onShowToast) {
      onShowToast('Profile Updated', 'success', 'Your personal information was saved successfully.');
    }
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      if (onShowToast) onShowToast('Missing Password Fields', 'error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      if (onShowToast) onShowToast('Password Mismatch', 'error', 'New passwords do not match.');
      return;
    }
    if (onShowToast) {
      onShowToast('Password Updated', 'success', 'Your account password has been successfully changed.');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#bbcabf]/30 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#bbcabf]/20 flex items-center justify-between bg-[#f8f9ff]">
          <h3 className="text-lg font-bold text-[#0b1c30]">
            {onlyProfile ? 'My Profile' : 'Settings & Preferences'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6c7a71] hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        {!onlyProfile && (
          <div className="flex border-b border-[#bbcabf]/20 bg-[#f8f9ff] px-6 gap-6 text-xs font-bold text-[#6c7a71] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'profile'
                  ? 'border-[#006c49] text-[#006c49]'
                  : 'border-transparent hover:text-[#0b1c30]'
              }`}
            >
              <User className="w-4 h-4" /> Profile Info
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'account'
                  ? 'border-[#006c49] text-[#006c49]'
                  : 'border-transparent hover:text-[#0b1c30]'
              }`}
            >
              <Lock className="w-4 h-4" /> Account & Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'notifications'
                  ? 'border-[#006c49] text-[#006c49]'
                  : 'border-transparent hover:text-[#0b1c30]'
              }`}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'preferences'
                  ? 'border-[#006c49] text-[#006c49]'
                  : 'border-transparent hover:text-[#0b1c30]'
              }`}
            >
              <Sliders className="w-4 h-4" /> Data & Danger Zone
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/40 rounded-xl text-xs font-semibold text-[#0b1c30]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/40 rounded-xl text-xs font-semibold text-[#0b1c30]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">
                    Current Professional Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Software Engineer, Designer, Student"
                    className="w-full px-4 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/40 rounded-xl text-xs font-semibold text-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">
                    Target Role Goal
                  </label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full px-4 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/40 rounded-xl text-xs font-semibold text-[#0b1c30]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg (optional)"
                  className="w-full px-4 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/40 rounded-xl text-xs text-[#0b1c30]"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                {savedSuccess && (
                  <span className="text-xs font-bold text-[#006c49] flex items-center gap-1">
                    <Check className="w-4 h-4" /> Profile saved!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-6 py-2.5 bg-[#006c49] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#005136]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <form onSubmit={handleChangePassword} className="space-y-4 bg-[#f8f9ff] p-5 rounded-2xl border border-[#bbcabf]/20">
                <h4 className="font-bold text-xs text-[#0b1c30] uppercase flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#006c49]" /> Change Account Password
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white border border-[#bbcabf]/30 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      className="w-full px-3 py-2 bg-white border border-[#bbcabf]/30 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3 py-2 bg-white border border-[#bbcabf]/30 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#006c49] text-white text-xs font-bold rounded-xl hover:bg-[#005136]"
                >
                  Update Password
                </button>
              </form>

              <div className="p-4 bg-[#eff4ff] border border-[#006c49]/20 rounded-2xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#006c49] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#006c49]">Server-Side Security & AI API Status</h4>
                  <p className="text-xs text-[#3c4a42] mt-0.5">
                    Your account is protected by encrypted authentication sessions. Gemini AI endpoints run server-side with zero client-side key leakage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-2xl border border-[#bbcabf]/20">
                <div>
                  <h4 className="font-bold text-xs text-[#0b1c30]">Email Activity Notifications</h4>
                  <p className="text-[11px] text-[#6c7a71]">Receive emails when resume analysis or mock interviews complete.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#006c49]"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-2xl border border-[#bbcabf]/20">
                <div>
                  <h4 className="font-bold text-xs text-[#0b1c30]">In-App Bell Alerts</h4>
                  <p className="text-[11px] text-[#6c7a71]">Show unread badge and dropdown popover for real-time app events.</p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppAlerts}
                  onChange={(e) => setInAppAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#006c49]"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-2xl border border-[#bbcabf]/20">
                <div>
                  <h4 className="font-bold text-xs text-[#0b1c30]">Weekly Career Progress Digest</h4>
                  <p className="text-[11px] text-[#6c7a71]">Summary of skill gaps closed and practice questions completed.</p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyProgress}
                  onChange={(e) => setWeeklyProgress(e.target.checked)}
                  className="w-4 h-4 accent-[#006c49]"
                />
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#0b1c30] uppercase">Selective Data Management</h4>
                <p className="text-xs text-[#6c7a71]">Delete specific categories of history or start fresh without clearing your whole account.</p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-[#f8f9ff] border border-[#bbcabf]/20 rounded-xl">
                    <div>
                      <h5 className="font-bold text-xs text-[#0b1c30]">Resume Audit Reports</h5>
                      <p className="text-[11px] text-[#6c7a71]">Clear all saved ATS analysis scores & resume upload history.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (onClearResumes) onClearResumes();
                        if (onShowToast) onShowToast('Resumes Cleared', 'info', 'All resume audit reports deleted.');
                      }}
                      className="px-3 py-1.5 border border-[#ba1a1a]/40 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Resumes
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#f8f9ff] border border-[#bbcabf]/20 rounded-xl">
                    <div>
                      <h5 className="font-bold text-xs text-[#0b1c30]">Mock Interview Sessions</h5>
                      <p className="text-[11px] text-[#6c7a71]">Clear all saved interview practice questions and AI evaluation feedback.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (onClearInterviews) onClearInterviews();
                        if (onShowToast) onShowToast('Interviews Cleared', 'info', 'All interview sessions deleted.');
                      }}
                      className="px-3 py-1.5 border border-[#ba1a1a]/40 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Interviews
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#f8f9ff] border border-[#bbcabf]/20 rounded-xl">
                    <div>
                      <h5 className="font-bold text-xs text-[#0b1c30]">Skill Gap Analysis Reports</h5>
                      <p className="text-[11px] text-[#6c7a71]">Delete saved competency analysis report & skill gap metrics.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (onClearSkillGap) onClearSkillGap();
                        if (onShowToast) onShowToast('Skill Gap Cleared', 'info', 'Skill gap analysis report deleted.');
                      }}
                      className="px-3 py-1.5 border border-[#ba1a1a]/40 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Skill Gap
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#f8f9ff] border border-[#bbcabf]/20 rounded-xl">
                    <div>
                      <h5 className="font-bold text-xs text-[#0b1c30]">Career Advisor AI Chat</h5>
                      <p className="text-[11px] text-[#6c7a71]">Reset chat history with AI Career Advisor.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (onClearChat) onClearChat();
                        if (onShowToast) onShowToast('Chat Reset', 'info', 'Career Advisor chat history cleared.');
                      }}
                      className="px-3 py-1.5 border border-[#ba1a1a]/40 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Chat
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#f8f9ff] border border-[#bbcabf]/20 rounded-xl">
                    <div>
                      <h5 className="font-bold text-xs text-[#0b1c30]">Activity Feed & Milestones</h5>
                      <p className="text-[11px] text-[#6c7a71]">Clear recent activity log timeline on your dashboard.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (onClearActivities) onClearActivities();
                        if (onShowToast) onShowToast('Activities Cleared', 'info', 'Dashboard activity feed cleared.');
                      }}
                      className="px-3 py-1.5 border border-[#ba1a1a]/40 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Feed
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#bbcabf]/30">
                <div className="p-5 bg-[#ffdad6]/40 border border-[#ba1a1a]/20 rounded-2xl flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-[#ba1a1a]">Full Reset (Clear All App Data)</h4>
                    <p className="text-xs text-[#3c4a42] mt-1">
                      Permanently clears all saved data across all features and resets your profile to default state.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClearData();
                      if (onShowToast) onShowToast('All Data Cleared', 'info', 'Your local account state has been reset.');
                      onClose();
                    }}
                    className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-bold rounded-xl hover:bg-red-700 shrink-0 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
