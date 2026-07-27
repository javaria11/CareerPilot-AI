import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTab, UserProfile, DashboardStats, ActivityItem, ResumeAnalysisResult, NotificationItem } from './types';
import { initialUserProfile } from './data/initialData';
import {
  getAuthUser,
  saveAuthUser,
  getStoredUserProfile,
  saveUserProfile,
  getStoredStats,
  getStoredActivities,
  getStoredResumes,
  getStoredInterviews,
  getStoredSkillGap,
  getStoredChatMessages,
  getStoredNotifications,
  saveNotifications,
  deleteActivityItem,
  clearAllActivities,
  addActivity,
  deleteResumeResult,
  clearAllResumes,
  deleteInterviewSession,
  clearAllInterviews,
  clearAllChatMessages,
  deleteSkillGapResult,
} from './utils/storage';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import { LandingView } from './views/LandingView';
import { HomeView } from './views/HomeView';
import { ResumeAnalyzerView } from './views/ResumeAnalyzerView';
import { CareerAdvisorView } from './views/CareerAdvisorView';
import { InterviewGeneratorView } from './views/InterviewGeneratorView';
import { SkillGapAnalysisView } from './views/SkillGapAnalysisView';

export function App() {
  const [authUser, setAuthUser] = useState<UserProfile | null>(getAuthUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>(
    authUser || getStoredUserProfile(authUser?.email)
  );
  const [stats, setStats] = useState<DashboardStats>(getStoredStats(authUser?.email));
  const [activities, setActivities] = useState<ActivityItem[]>(getStoredActivities(authUser?.email));
  const [resumeHistory, setResumeHistory] = useState<ResumeAnalysisResult[]>(getStoredResumes(authUser?.email));
  const [interviewSessions, setInterviewSessions] = useState(getStoredInterviews(authUser?.email));
  const [skillGapResult, setSkillGapResult] = useState(getStoredSkillGap(authUser?.email));
  const [chatMessages, setChatMessageState] = useState(getStoredChatMessages(authUser?.email));
  const [notifications, setNotifications] = useState<NotificationItem[]>(getStoredNotifications(authUser?.email));

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOnlyOpen, setIsProfileOnlyOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync user data whenever active authUser changes
  const refreshUserDataForUser = React.useCallback((user: UserProfile | null) => {
    const email = user?.email;
    const profile = user || getStoredUserProfile(email);
    setUserProfile(profile);
    setStats(getStoredStats(email));
    setActivities(getStoredActivities(email));
    setResumeHistory(getStoredResumes(email));
    setInterviewSessions(getStoredInterviews(email));
    setSkillGapResult(getStoredSkillGap(email));
    setChatMessageState(getStoredChatMessages(email));
    setNotifications(getStoredNotifications(email));
  }, []);

  React.useEffect(() => {
    refreshUserDataForUser(authUser);
  }, [authUser, refreshUserDataForUser]);

  const showToast = (title: string, type: 'success' | 'error' | 'info', desc?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, type, description: desc }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleProfileSave = (updated: UserProfile) => {
    setUserProfile(updated);
    setAuthUser(updated);
    saveAuthUser(updated);
    saveUserProfile(updated, updated.email);
    setStats(getStoredStats(updated.email));
    showToast('Profile Saved', 'success', 'Your account profile was updated successfully.');
  };

  const handleClearActivities = () => {
    clearAllActivities(authUser?.email);
    setActivities([]);
    showToast('Activity Log Cleared', 'info', 'Your recent activity timeline has been reset.');
  };

  const handleDeleteActivity = (id: string) => {
    const updated = deleteActivityItem(id, authUser?.email);
    setActivities(updated);
    showToast('Activity Item Removed', 'info');
  };

  const handleAddCustomActivity = (title: string, description: string, type: 'resume' | 'interview' | 'skill' | 'advisor') => {
    const colorClasses = {
      resume: 'text-[#006c49] bg-[#006c49]/10',
      interview: 'text-[#0058be] bg-[#0058be]/10',
      skill: 'text-[#10b981] bg-[#10b981]/10',
      advisor: 'text-[#00687a] bg-[#00687a]/10',
    };
    addActivity({
      title,
      description,
      type,
      icon: 'star',
      colorClass: colorClasses[type] || 'text-[#006c49] bg-[#006c49]/10',
    }, authUser?.email);
    setActivities(getStoredActivities(authUser?.email));
    showToast('Activity Logged', 'success', `"${title}" was added to your history.`);
  };

  const handleDeleteResume = (id: string) => {
    const updated = deleteResumeResult(id, authUser?.email);
    setResumeHistory(updated);
    setStats(getStoredStats(authUser?.email));
    showToast('Resume Analysis Deleted', 'info');
  };

  const handleClearResumes = () => {
    clearAllResumes(authUser?.email);
    setResumeHistory([]);
    setStats(getStoredStats(authUser?.email));
    showToast('All Resume History Cleared', 'info');
  };

  const handleDeleteInterview = (id: string) => {
    deleteInterviewSession(id, authUser?.email);
    setInterviewSessions(getStoredInterviews(authUser?.email));
    setStats(getStoredStats(authUser?.email));
    showToast('Interview Session Deleted', 'info');
  };

  const handleClearInterviews = () => {
    clearAllInterviews(authUser?.email);
    setInterviewSessions([]);
    setStats(getStoredStats(authUser?.email));
    showToast('All Interview History Cleared', 'info');
  };

  const handleDeleteSkillGap = () => {
    deleteSkillGapResult(undefined, authUser?.email);
    setSkillGapResult(null);
    setStats(getStoredStats(authUser?.email));
    showToast('Skill Gap Analysis Deleted', 'info');
  };

  const handleClearAdvisorChat = () => {
    clearAllChatMessages(authUser?.email);
    setChatMessageState([]);
    showToast('Advisor Chat Cleared', 'info');
  };

  const handleClearAllData = () => {
    clearAllResumes(authUser?.email);
    clearAllInterviews(authUser?.email);
    deleteSkillGapResult(undefined, authUser?.email);
    clearAllChatMessages(authUser?.email);
    clearAllActivities(authUser?.email);

    try {
      localStorage.removeItem('career_hub_recent_searches');
    } catch {
      // ignore
    }

    setStats(getStoredStats(authUser?.email));
    setActivities([]);
    setResumeHistory([]);
    setInterviewSessions([]);
    setSkillGapResult(null);
    setChatMessageState([]);
    setNotifications([]);
    showToast('All Application Data Cleared', 'success', 'Your activity history and reports have been wiped. Your user profile and target role are preserved.');
  };

  const handleResumeGenerated = (result: ResumeAnalysisResult) => {
    setResumeHistory((prev) => [result, ...prev.filter((r) => r.id !== result.id)]);
    setStats(getStoredStats(authUser?.email));
    setActivities(getStoredActivities(authUser?.email));
    showToast('Resume Analyzed Successfully', 'success', `Scored ${result.overallScore}/100 with ${result.atsScore}% ATS compatibility.`);
    
    // Add real notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Resume "${result.fileName}" analyzed (${result.overallScore}/100 score)`,
      time: 'Just now',
      unread: true,
      linkTab: 'resume-analyzer',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveNotifications(updatedNotifs, authUser?.email);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    saveNotifications([], authUser?.email);
    showToast('Notifications Cleared', 'info');
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated, authUser?.email);
  };

  const handleSignOut = () => {
    saveAuthUser(null);
    setAuthUser(null);
    showToast('Signed Out Successfully', 'info', 'You have been signed out of CareerPilot AI.');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    saveAuthUser(user);
    setAuthUser(user);
    setUserProfile(user);
    refreshUserDataForUser(user);
    setIsAuthOpen(false);
    showToast('Authentication Successful', 'success', `Welcome, ${user.name}!`);
  };

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'home': return 'Dashboard Overview';
      case 'resume-analyzer': return 'Resume Analyzer & ATS Audit';
      case 'career-advisor': return 'AI Career Advisor';
      case 'interview-generator': return 'Interview Practice Studio';
      case 'skill-gap-analysis': return 'Skill Gap & Competency Analysis';
      default: return 'Dashboard';
    }
  };

  // Unauthenticated Flow: Show Landing Page
  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <LandingView
          onOpenSignIn={() => {
            setAuthMode('signin');
            setIsAuthOpen(true);
          }}
          onOpenSignUp={() => {
            setAuthMode('signup');
            setIsAuthOpen(true);
          }}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={authMode}
          onLoginSuccess={handleLoginSuccess}
          onShowToast={showToast}
        />

        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    );
  }

  // Authenticated Protected Application Canvas
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans antialiased selection:bg-[#006c49]/20 selection:text-[#006c49]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenHelpModal={() => setIsHelpOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Top Header Bar */}
      <Header
        userProfile={userProfile}
        notifications={notifications}
        onSelectNotification={(tab) => setActiveTab(tab)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOnlyOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onSignOut={handleSignOut}
        onClearNotifications={handleClearNotifications}
        onDeleteNotification={handleDeleteNotification}
        onShowToast={showToast}
        onNavigateTab={(tab) => setActiveTab(tab)}
        resumeHistory={resumeHistory}
        interviewSessions={interviewSessions}
        skillGapResult={skillGapResult}
        onSearch={(query) => {
          if (!query.trim()) return;
          const q = query.toLowerCase();
          if (q.includes('resume') || q.includes('ats')) setActiveTab('resume-analyzer');
          else if (q.includes('interview') || q.includes('mock') || q.includes('question')) setActiveTab('interview-generator');
          else if (q.includes('skill') || q.includes('gap') || q.includes('radar')) setActiveTab('skill-gap-analysis');
          else if (q.includes('advisor') || q.includes('chat') || q.includes('role') || q.includes('salary')) setActiveTab('career-advisor');
        }}
      />

      {/* Main App Canvas */}
      <main className="flex-1 lg:ml-[280px] pt-20 px-4 md:px-8 pb-12 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex items-center justify-between text-xs font-semibold text-[#6c7a71]">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setActiveTab('home')} className="hover:text-[#006c49] transition-colors">
              CareerPilot AI
            </button>
            <span>/</span>
            <span className="text-[#0b1c30] font-bold">{getTabTitle(activeTab)}</span>
          </div>

          {activeTab !== 'home' && (
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs font-bold text-[#006c49] hover:underline flex items-center gap-1"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && (
              <HomeView
                userProfile={userProfile}
                stats={stats}
                activities={activities}
                onNavigate={setActiveTab}
                onClearActivities={handleClearActivities}
                onDeleteActivity={handleDeleteActivity}
                onAddCustomActivity={handleAddCustomActivity}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {activeTab === 'resume-analyzer' && (
              <ResumeAnalyzerView
                resumeHistory={resumeHistory}
                onResultGenerated={handleResumeGenerated}
                onDeleteResult={handleDeleteResume}
                onClearHistory={handleClearResumes}
              />
            )}

            {activeTab === 'career-advisor' && (
              <CareerAdvisorView
                userProfile={userProfile}
                messages={chatMessages}
                onMessagesChange={setChatMessageState}
                onClearChat={handleClearAdvisorChat}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'interview-generator' && (
              <InterviewGeneratorView
                userProfile={userProfile}
                sessions={interviewSessions}
                onSessionsChange={setInterviewSessions}
                onClearHistory={handleClearInterviews}
                onDeleteSession={handleDeleteInterview}
              />
            )}

            {activeTab === 'skill-gap-analysis' && (
              <SkillGapAnalysisView
                userProfile={userProfile}
                analysisResult={skillGapResult}
                onAnalysisResultChange={setSkillGapResult}
                onDeleteSkillGap={handleDeleteSkillGap}
                onShowToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast Floating Alerts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleProfileSave}
        onClearData={handleClearAllData}
        onClearResumes={handleClearResumes}
        onClearInterviews={handleClearInterviews}
        onClearSkillGap={handleDeleteSkillGap}
        onClearChat={handleClearAdvisorChat}
        onClearActivities={handleClearActivities}
        onShowToast={showToast}
      />

      <SettingsModal
        isOpen={isProfileOnlyOpen}
        onClose={() => setIsProfileOnlyOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleProfileSave}
        onClearData={handleClearAllData}
        onShowToast={showToast}
        onlyProfile={true}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onShowToast={showToast}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />
    </div>
  );
}

export default App;
