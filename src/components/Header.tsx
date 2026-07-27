import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, NotificationItem, ActiveTab, ResumeAnalysisResult, InterviewSession, SkillGapResult } from '../types';
import {
  Search, Bell, Settings, Menu, LogOut, Check, ArrowRight, Trash2, X, FileText, Brain,
  MessageSquare, BarChart3, LayoutDashboard, Sparkles, Clock, History, Tag, ChevronRight, User
} from 'lucide-react';

interface HeaderProps {
  userProfile: UserProfile;
  notifications: NotificationItem[];
  onSelectNotification: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  onOpenMobileMenu: () => void;
  onSearch: (query: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  resumeHistory?: ResumeAnalysisResult[];
  interviewSessions?: InterviewSession[];
  skillGapResult?: SkillGapResult | null;
  onSignOut?: () => void;
  onClearNotifications?: () => void;
  onDeleteNotification?: (id: string) => void;
  onShowToast?: (title: string, type?: 'success' | 'error' | 'info', description?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  notifications,
  onSelectNotification,
  onOpenSettings,
  onOpenProfile,
  onOpenMobileMenu,
  onSearch,
  onNavigateTab,
  resumeHistory = [],
  interviewSessions = [],
  skillGapResult = null,
  onSignOut,
  onClearNotifications,
  onDeleteNotification,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'modules' | 'resumes' | 'interviews' | 'skills'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifList, setNotifList] = useState<NotificationItem[]>(notifications);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('career_hub_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setNotifList(notifications);
  }, [notifications]);

  // Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifList.filter((n) => n.unread).length;

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('career_hub_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('career_hub_recent_searches');
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== item);
    setRecentSearches(updated);
    try {
      localStorage.setItem('career_hub_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch(val);
  };

  const handleSelectSearchResult = (tab: ActiveTab, searchTermToSave?: string) => {
    if (searchTermToSave) {
      saveRecentSearch(searchTermToSave);
    } else if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }

    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      onSelectNotification(tab);
    }
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleQuickChipClick = (term: string) => {
    setSearchQuery(term);
    onSearch(term);
    inputRef.current?.focus();
  };

  const handleMarkAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleDeleteNotif = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteNotification) {
      onDeleteNotification(id);
    } else {
      setNotifList((prev) => prev.filter((n) => n.id !== id));
    }
    if (onShowToast) onShowToast('Notification Deleted', 'info', 'Notification removed.');
  };

  const handleClearAll = () => {
    if (onClearNotifications) {
      onClearNotifications();
    }
    setNotifList([]);
    if (onShowToast) onShowToast('Notifications Cleared', 'info', 'All notifications cleared.');
  };

  const handleNotifClick = (notif: NotificationItem) => {
    if (notif.linkTab) {
      onSelectNotification(notif.linkTab);
    }
    setNotifList((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setShowNotifications(false);
  };

  // Search filter options
  const q = searchQuery.trim().toLowerCase();
  
  const allFeatures = [
    { id: 'home' as ActiveTab, title: 'Dashboard Overview', subtitle: 'View stats, activity timeline, & career trajectory', icon: LayoutDashboard },
    { id: 'resume-analyzer' as ActiveTab, title: 'Resume Analyzer & ATS Audit', subtitle: 'Analyze resume score, missing keywords, & impact', icon: FileText },
    { id: 'career-advisor' as ActiveTab, title: 'AI Career Advisor', subtitle: 'Chat about career strategies, salary, and paths', icon: Brain },
    { id: 'interview-generator' as ActiveTab, title: 'Interview Practice Studio', subtitle: 'Generate custom AI mock interviews & evaluate answers', icon: MessageSquare },
    { id: 'skill-gap-analysis' as ActiveTab, title: 'Skill Gap & Competency Analysis', subtitle: 'Identify missing skills and learning roadmaps', icon: BarChart3 },
  ];

  const profileSkills = (userProfile.skills || []).map((skill) => ({
    title: `Skill: ${skill}`,
    subtitle: `Target role: ${userProfile.targetRole || 'Software Engineer'}`,
    tab: 'skill-gap-analysis' as ActiveTab,
  }));

  const matchedFeatures = q
    ? allFeatures.filter((f) => f.title.toLowerCase().includes(q) || f.subtitle.toLowerCase().includes(q) || f.id.includes(q))
    : [];

  const matchedResumes = q
    ? resumeHistory.filter((r) =>
        r.fileName?.toLowerCase().includes(q) ||
        r.verdict?.toLowerCase().includes(q) ||
        r.jobTitle?.toLowerCase().includes(q) ||
        r.missingKeywords?.some((k) => k.toLowerCase().includes(q))
      )
    : [];

  const matchedInterviews = q
    ? interviewSessions.filter((s) =>
        s.targetRole?.toLowerCase().includes(q) ||
        s.industry?.toLowerCase().includes(q) ||
        s.interviewType?.toLowerCase().includes(q) ||
        s.questions?.some((quest) => quest.question.toLowerCase().includes(q))
      )
    : [];

  const matchedSkills = q
    ? profileSkills.filter((s) => s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q))
    : [];

  const showModules = selectedCategory === 'all' || selectedCategory === 'modules';
  const showResumes = selectedCategory === 'all' || selectedCategory === 'resumes';
  const showInterviews = selectedCategory === 'all' || selectedCategory === 'interviews';
  const showSkills = selectedCategory === 'all' || selectedCategory === 'skills';

  const visibleModules = showModules ? matchedFeatures : [];
  const visibleResumes = showResumes ? matchedResumes : [];
  const visibleInterviews = showInterviews ? matchedInterviews : [];
  const visibleSkills = showSkills ? matchedSkills : [];

  const totalResultsCount =
    matchedFeatures.length + matchedResumes.length + matchedInterviews.length + matchedSkills.length;

  const hasSearchMatches = totalResultsCount > 0;

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-200/90 text-[#0b1c30] font-bold rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-16 bg-[#f8f9ff]/90 backdrop-blur-md border-b border-[#bbcabf]/20 flex justify-between items-center px-4 md:px-8 z-30">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-[#3c4a42] hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full max-w-md" ref={searchContainerRef}>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6c7a71]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={handleSearchChange}
            placeholder="Search roles, skills, or features..."
            className="w-full pl-10 pr-14 py-2 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-full focus:outline-none focus:ring-2 focus:ring-[#006c49]/20 focus:border-[#006c49] text-sm text-[#0b1c30] placeholder-[#6c7a71] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }}
                className="p-0.5 rounded-full text-[#6c7a71] hover:text-[#ba1a1a] hover:bg-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono font-semibold text-[#6c7a71] bg-white border border-[#bbcabf]/40 px-1.5 py-0.5 rounded shadow-2xs">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Interactive Search Results Popover */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#bbcabf]/30 py-3 z-50 max-h-[80vh] overflow-y-auto animate-in fade-in duration-150">
              
              {/* Category Filter Tabs */}
              {q && totalResultsCount > 0 && (
                <div className="px-3 pb-2 border-b border-[#bbcabf]/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All', count: totalResultsCount },
                    { id: 'modules', label: 'Modules', count: matchedFeatures.length },
                    { id: 'resumes', label: 'Resumes', count: matchedResumes.length },
                    { id: 'interviews', label: 'Interviews', count: matchedInterviews.length },
                    { id: 'skills', label: 'Skills', count: matchedSkills.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id as any)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                        selectedCategory === tab.id
                          ? 'bg-[#006c49] text-white'
                          : 'bg-[#f0f4f1] text-[#4a5568] hover:bg-[#e2e8f0]'
                      }`}
                    >
                      {tab.label}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedCategory === tab.id ? 'bg-white/20 text-white' : 'bg-[#bbcabf]/30 text-[#0b1c30]'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* WHEN QUERY IS EMPTY: Show Quick Suggestions & Recent Searches */}
              {!q && (
                <div className="p-3 space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 mb-1.5">
                        <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider flex items-center gap-1">
                          <History className="w-3 h-3 text-[#006c49]" /> Recent Searches
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-[10px] font-bold text-[#ba1a1a] hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((term, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleQuickChipClick(term)}
                            className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-[#eff4ff] cursor-pointer text-xs text-[#0b1c30] group transition-colors"
                          >
                            <span className="flex items-center gap-2 font-medium">
                              <Clock className="w-3.5 h-3.5 text-[#6c7a71] group-hover:text-[#006c49]" />
                              {term}
                            </span>
                            <button
                              onClick={(e) => removeRecentSearch(e, term)}
                              className="p-1 text-[#6c7a71] hover:text-[#ba1a1a] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Quick Tools */}
                  <div>
                    <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider px-2 mb-2 block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#0058be]" /> Popular Quick Actions
                    </span>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {[
                        { label: 'ATS Resume Audit', tab: 'resume-analyzer' as ActiveTab },
                        { label: 'Mock Technical Interview', tab: 'interview-generator' as ActiveTab },
                        { label: 'Skill Gap Matrix', tab: 'skill-gap-analysis' as ActiveTab },
                        { label: 'Salary Negotiation', tab: 'career-advisor' as ActiveTab },
                        { label: 'System Design Questions', tab: 'interview-generator' as ActiveTab },
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSearchResult(chip.tab, chip.label)}
                          className="px-3 py-1.5 bg-[#f0f4f1] hover:bg-[#006c49] hover:text-white rounded-xl text-xs font-semibold text-[#0b1c30] transition-all flex items-center gap-1.5 shadow-2xs border border-[#bbcabf]/30"
                        >
                          <Tag className="w-3 h-3 opacity-60" />
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* WHEN QUERY HAS MATCHES */}
              {q && hasSearchMatches && (
                <div className="space-y-3 pt-2">
                  {visibleModules.length > 0 && (
                    <div>
                      <p className="px-4 text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <LayoutDashboard className="w-3 h-3 text-[#006c49]" /> Modules & Tools
                      </p>
                      {visibleModules.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectSearchResult(item.id, item.title)}
                            className="px-4 py-2.5 hover:bg-[#eff4ff] cursor-pointer transition-colors flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#0b1c30]">{highlightText(item.title, searchQuery)}</p>
                              <p className="text-[11px] text-[#6c7a71] truncate">{highlightText(item.subtitle, searchQuery)}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#6c7a71] shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {visibleResumes.length > 0 && (
                    <div className="pt-2 border-t border-[#bbcabf]/20">
                      <p className="px-4 text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#006c49]" /> Saved Resumes
                      </p>
                      {visibleResumes.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => handleSelectSearchResult('resume-analyzer', r.fileName)}
                          className="px-4 py-2 hover:bg-[#eff4ff] cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-[#006c49] shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#0b1c30] truncate">{highlightText(r.fileName, searchQuery)}</p>
                              {r.verdict && <p className="text-[10px] text-[#6c7a71] truncate">{highlightText(r.verdict, searchQuery)}</p>}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-[#006c49]/10 text-[#006c49] px-2 py-0.5 rounded-full shrink-0">
                            Score {r.overallScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {visibleInterviews.length > 0 && (
                    <div className="pt-2 border-t border-[#bbcabf]/20">
                      <p className="px-4 text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-[#0058be]" /> Interview Sessions
                      </p>
                      {visibleInterviews.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSearchResult('interview-generator', s.targetRole)}
                          className="px-4 py-2 hover:bg-[#eff4ff] cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare className="w-4 h-4 text-[#0058be] shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#0b1c30] truncate">{highlightText(s.targetRole, searchQuery)}</p>
                              <p className="text-[10px] text-[#6c7a71] truncate">{highlightText(s.industry, searchQuery)} • {s.questions?.length || 0} Questions</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-[#0058be] bg-[#0058be]/10 px-2 py-0.5 rounded-full shrink-0">
                            {s.interviewType}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {visibleSkills.length > 0 && (
                    <div className="pt-2 border-t border-[#bbcabf]/20">
                      <p className="px-4 text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 text-[#006c49]" /> Profile Skills
                      </p>
                      {visibleSkills.map((sk, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectSearchResult(sk.tab, sk.title)}
                          className="px-4 py-2 hover:bg-[#eff4ff] cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <BarChart3 className="w-4 h-4 text-[#006c49] shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#0b1c30] truncate">{highlightText(sk.title, searchQuery)}</p>
                              <p className="text-[10px] text-[#6c7a71] truncate">{highlightText(sk.subtitle, searchQuery)}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#6c7a71]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NO MATCHES */}
              {q && !hasSearchMatches && (
                <div className="p-6 text-center">
                  <p className="text-xs text-[#6c7a71] font-medium mb-3">
                    No results found for "<span className="text-[#0b1c30] font-bold">{searchQuery}</span>"
                  </p>
                  <p className="text-[11px] text-[#6c7a71] mb-4">
                    Try another search term or trigger an AI action directly:
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <button
                      onClick={() => handleSelectSearchResult('resume-analyzer', searchQuery)}
                      className="px-3 py-1.5 bg-[#006c49] text-white rounded-xl text-xs font-semibold hover:bg-[#005237] transition-colors"
                    >
                      Audit Resume for "{searchQuery}"
                    </button>
                    <button
                      onClick={() => handleSelectSearchResult('interview-generator', searchQuery)}
                      className="px-3 py-1.5 bg-[#0058be] text-white rounded-xl text-xs font-semibold hover:bg-[#004395] transition-colors"
                    >
                      Mock Interview for "{searchQuery}"
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notification Bell with Dropdown Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#3c4a42] hover:text-[#006c49] hover:bg-[#eff4ff] rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-[#bbcabf]/30 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 pb-2 border-b border-[#bbcabf]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#0b1c30]">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="bg-[#006c49]/10 text-[#006c49] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-[#006c49] hover:underline flex items-center gap-0.5"
                    >
                      <Check className="w-3 h-3" /> Mark read
                    </button>
                  )}
                  {notifList.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-[11px] font-semibold text-[#ba1a1a] hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#bbcabf]/10">
                {notifList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#6c7a71]">
                    No notifications
                  </div>
                ) : (
                  notifList.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`p-3.5 hover:bg-[#eff4ff] cursor-pointer transition-colors flex items-start justify-between gap-2 group ${
                        n.unread ? 'bg-[#2170e4]/5' : ''
                      }`}
                    >
                      <div className="flex-1 pr-1">
                        <p className="text-xs font-semibold text-[#0b1c30] leading-snug">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-[#6c7a71] font-medium mt-1 inline-block">
                          {n.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleDeleteNotif(e, n.id)}
                          className="text-[#6c7a71] hover:text-[#ba1a1a] p-1 rounded hover:bg-slate-200/50 transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6c7a71] mt-1" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-[#3c4a42] hover:text-[#006c49] hover:bg-[#eff4ff] rounded-full transition-colors hidden sm:block"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-7 w-px bg-[#bbcabf]/40" />

        {/* User Info & Avatar */}
        {(() => {
          const rawName = userProfile.name || 'User';
          const displayUsername = rawName.includes('@') ? rawName.split('@')[0] : rawName;
          const initialLetter = displayUsername.charAt(0).toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#0b1c30] leading-none">{displayUsername}</p>
                <p className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider mt-0.5">
                  {userProfile.tier}
                </p>
              </div>
              <div
                onClick={onOpenProfile || onOpenSettings}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#10b981]/40 cursor-pointer hover:border-[#006c49] transition-all bg-[#006c49] text-white flex items-center justify-center font-bold text-xs shrink-0"
                title="View Profile"
              >
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={displayUsername}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initialLetter}</span>
                )}
              </div>
              <button
                onClick={onSignOut || (() => window.location.reload())}
                className="text-xs text-[#6c7a71] hover:text-[#ba1a1a] font-medium transition-colors hidden md:flex items-center gap-1"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          );
        })()}
      </div>
    </header>
  );
};

