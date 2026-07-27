import {
  UserProfile,
  DashboardStats,
  ActivityItem,
  ResumeAnalysisResult,
  ChatMessage,
  InterviewSession,
  SkillGapResult,
  NotificationItem,
  AdvisorSession,
} from '../types';
import { initialUserProfile, initialStats } from '../data/initialData';

const BASE_KEYS = {
  AUTH_USER: 'careerpilot_auth_user',
  USER_PROFILE: 'careerpilot_user_profile',
  STATS: 'careerpilot_stats',
  ACTIVITIES: 'careerpilot_activities',
  RESUMES: 'careerpilot_resumes',
  CHAT_MESSAGES: 'careerpilot_chat_messages',
  ADVISOR_SESSIONS: 'careerpilot_advisor_sessions',
  INTERVIEWS: 'careerpilot_interviews',
  SKILL_GAP: 'careerpilot_skill_gap',
  NOTIFICATIONS: 'careerpilot_notifications',
};

export const getAuthUser = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(BASE_KEYS.AUTH_USER);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveAuthUser = (user: UserProfile | null): void => {
  try {
    if (user) {
      localStorage.setItem(BASE_KEYS.AUTH_USER, JSON.stringify(user));
      saveUserProfile(user, user.email);
    } else {
      localStorage.removeItem(BASE_KEYS.AUTH_USER);
    }
  } catch (e) {
    console.error('Failed to save auth user', e);
  }
};

const getKey = (baseKey: string, email?: string): string => {
  const currentEmail = email || getAuthUser()?.email;
  if (currentEmail && currentEmail.trim()) {
    return `${baseKey}_${currentEmail.trim().toLowerCase()}`;
  }
  return baseKey;
};

export const getStoredUserProfile = (email?: string): UserProfile => {
  const authUser = getAuthUser();
  if (authUser && (!email || authUser.email?.toLowerCase() === email.toLowerCase())) {
    return authUser;
  }
  try {
    const key = getKey(BASE_KEYS.USER_PROFILE, email);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : (authUser || initialUserProfile);
  } catch (e) {
    return authUser || initialUserProfile;
  }
};

export const saveUserProfile = (profile: UserProfile, email?: string): void => {
  try {
    const targetEmail = email || profile.email || getAuthUser()?.email;
    const key = getKey(BASE_KEYS.USER_PROFILE, targetEmail);
    localStorage.setItem(key, JSON.stringify(profile));
    
    // Also sync to auth user if it's the current active user
    const currentAuth = getAuthUser();
    if (currentAuth && currentAuth.email?.toLowerCase() === profile.email?.toLowerCase()) {
      localStorage.setItem(BASE_KEYS.AUTH_USER, JSON.stringify(profile));
    }
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
};

export const computeUserStats = (email?: string): DashboardStats => {
  const userResumes = getStoredResumes(email);
  const userInterviews = getStoredInterviews(email);
  const userSkillGap = getStoredSkillGap(email);
  const profile = getStoredUserProfile(email);

  const resumesAnalyzed = userResumes.length;
  const interviewsHosted = userInterviews.length;
  
  const trackedSkillsCount = profile?.skills?.length
    ? profile.skills.length
    : (userSkillGap?.radarData?.length ? userSkillGap.radarData.length * 6 : 0);

  let overallMatchScore = 0;
  if (userResumes.length > 0) {
    overallMatchScore = userResumes[0].overallScore || userResumes[0].atsScore || 0;
  } else if (userSkillGap) {
    overallMatchScore = userSkillGap.matchPercentage || 0;
  }

  return {
    resumesAnalyzed,
    interviewsHosted,
    skillsTracked: trackedSkillsCount,
    overallMatchScore,
  };
};

export const getStoredStats = (email?: string): DashboardStats => {
  try {
    const key = getKey(BASE_KEYS.STATS, email);
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      const computed = computeUserStats(email);
      return {
        ...parsed,
        resumesAnalyzed: computed.resumesAnalyzed,
        interviewsHosted: computed.interviewsHosted,
        skillsTracked: computed.skillsTracked,
        overallMatchScore: computed.overallMatchScore > 0 ? computed.overallMatchScore : (parsed.overallMatchScore || 0),
      };
    }
    return computeUserStats(email);
  } catch (e) {
    return computeUserStats(email);
  }
};

export const saveStats = (stats: DashboardStats, email?: string): void => {
  try {
    const key = getKey(BASE_KEYS.STATS, email);
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
};

export const getStoredActivities = (email?: string): ActivityItem[] => {
  try {
    const key = getKey(BASE_KEYS.ACTIVITIES, email);
    const data = localStorage.getItem(key);
    return data !== null ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>, email?: string): ActivityItem => {
  const current = getStoredActivities(email);
  const newActivity: ActivityItem = {
    ...activity,
    id: `act-${Date.now()}`,
    timestamp: 'Just now',
  };
  const updated = [newActivity, ...current].slice(0, 20);
  try {
    const key = getKey(BASE_KEYS.ACTIVITIES, email);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save activities', e);
  }
  return newActivity;
};

export const deleteActivityItem = (id: string, email?: string): ActivityItem[] => {
  const current = getStoredActivities(email);
  const updated = current.filter((a) => a.id !== id);
  try {
    const key = getKey(BASE_KEYS.ACTIVITIES, email);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete activity item', e);
  }
  return updated;
};

export const clearAllActivities = (email?: string): void => {
  try {
    const key = getKey(BASE_KEYS.ACTIVITIES, email);
    localStorage.setItem(key, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear activities', e);
  }
};

export const getStoredResumes = (email?: string): ResumeAnalysisResult[] => {
  try {
    const key = getKey(BASE_KEYS.RESUMES, email);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveResumeResult = (result: ResumeAnalysisResult, email?: string): void => {
  const current = getStoredResumes(email);
  const updated = [result, ...current.filter((r) => r.id !== result.id)];
  try {
    const key = getKey(BASE_KEYS.RESUMES, email);
    localStorage.setItem(key, JSON.stringify(updated));
    const stats = computeUserStats(email);
    saveStats(stats, email);
    addActivity({
      title: `Resume "${result.fileName}" Analyzed`,
      description: `Scored ${result.overallScore}/100 with ${result.atsScore}% ATS compatibility.`,
      type: 'resume',
      icon: 'description',
      colorClass: 'text-primary bg-primary/10',
    }, email);
  } catch (e) {
    console.error('Failed to save resume result', e);
  }
};

export const deleteResumeResult = (id: string, email?: string): ResumeAnalysisResult[] => {
  const current = getStoredResumes(email);
  const updated = current.filter((r) => r.id !== id);
  try {
    const key = getKey(BASE_KEYS.RESUMES, email);
    localStorage.setItem(key, JSON.stringify(updated));
    const stats = computeUserStats(email);
    saveStats(stats, email);
  } catch (e) {
    console.error('Failed to delete resume result', e);
  }
  return updated;
};

export const clearAllResumes = (email?: string): void => {
  try {
    const key = getKey(BASE_KEYS.RESUMES, email);
    localStorage.setItem(key, JSON.stringify([]));
    const stats = computeUserStats(email);
    saveStats(stats, email);
  } catch (e) {
    console.error('Failed to clear all resumes', e);
  }
};

export const getStoredInterviews = (email?: string): InterviewSession[] => {
  try {
    const key = getKey(BASE_KEYS.INTERVIEWS, email);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveInterviewSession = (session: InterviewSession, email?: string): void => {
  const current = getStoredInterviews(email);
  const updated = [session, ...current.filter((s) => s.id !== session.id)];
  try {
    const key = getKey(BASE_KEYS.INTERVIEWS, email);
    localStorage.setItem(key, JSON.stringify(updated));
    const stats = computeUserStats(email);
    saveStats(stats, email);
  } catch (e) {
    console.error('Failed to save interview session', e);
  }
};

export const deleteInterviewSession = (id: string, email?: string): InterviewSession[] => {
  const current = getStoredInterviews(email);
  const updated = current.filter((s) => s.id !== id);
  try {
    const key = getKey(BASE_KEYS.INTERVIEWS, email);
    localStorage.setItem(key, JSON.stringify(updated));
    const stats = computeUserStats(email);
    saveStats(stats, email);
  } catch (e) {
    console.error('Failed to delete interview session', e);
  }
  return updated;
};

export const clearAllInterviews = (email?: string): void => {
  try {
    const key = getKey(BASE_KEYS.INTERVIEWS, email);
    localStorage.setItem(key, JSON.stringify([]));
    const stats = computeUserStats(email);
    saveStats(stats, email);
  } catch (e) {
    console.error('Failed to clear all interviews', e);
  }
};

export const getStoredSkillGapHistory = (email?: string): SkillGapResult[] => {
  try {
    const key = getKey(BASE_KEYS.SKILL_GAP, email);
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      const single = {
        ...parsed,
        id: parsed.id || `sg-${Date.now()}`,
        createdAt: parsed.createdAt || 'Recent Session',
      };
      return [single];
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const getStoredSkillGap = (email?: string): SkillGapResult | null => {
  const history = getStoredSkillGapHistory(email);
  return history.length > 0 ? history[0] : null;
};

export const saveSkillGapResult = (result: SkillGapResult, email?: string): SkillGapResult[] => {
  try {
    const fullResult: SkillGapResult = {
      ...result,
      id: result.id || `sg-${Date.now()}`,
      createdAt: result.createdAt || new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    const current = getStoredSkillGapHistory(email);
    const updated = [fullResult, ...current.filter((s) => s.id !== fullResult.id)];
    const key = getKey(BASE_KEYS.SKILL_GAP, email);
    localStorage.setItem(key, JSON.stringify(updated));
    const stats = computeUserStats(email);
    saveStats(stats, email);
    addActivity({
      title: `Skill Gap Analysis: ${fullResult.targetRole}`,
      description: `Found ${fullResult.matchPercentage}% overall skill match. ${fullResult.missingSkills.length} key skill gaps identified.`,
      type: 'skill',
      icon: 'analytics',
      colorClass: 'text-tertiary bg-tertiary/10',
    }, email);
    return updated;
  } catch (e) {
    console.error('Failed to save skill gap result', e);
    return [];
  }
};

export const deleteSkillGapResult = (id?: string, email?: string): SkillGapResult[] => {
  try {
    const current = getStoredSkillGapHistory(email);
    const updated = id ? current.filter((s) => s.id !== id) : [];
    const key = getKey(BASE_KEYS.SKILL_GAP, email);
    localStorage.setItem(key, JSON.stringify(updated));
    const stats = computeUserStats(email);
    saveStats(stats, email);
    return updated;
  } catch (e) {
    console.error('Failed to delete skill gap result', e);
    return [];
  }
};

export const getStoredChatMessages = (email?: string): ChatMessage[] => {
  try {
    const key = getKey(BASE_KEYS.CHAT_MESSAGES, email);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    // ignore
  }
  return [
    {
      id: 'msg-1',
      sender: 'bot',
      text: "Hello! Welcome to your AI Career Advisor. Based on your active profile, I am ready to help you analyze career pathways, salary negotiation strategies, or skill growth roadmaps. What goal would you like to discuss today?",
      timestamp: '10:00 AM',
    },
  ];
};

export const saveChatMessages = (messages: ChatMessage[], email?: string): void => {
  try {
    const key = getKey(BASE_KEYS.CHAT_MESSAGES, email);
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat messages', e);
  }
};

export const deleteChatMessage = (id: string, email?: string): ChatMessage[] => {
  const current = getStoredChatMessages(email);
  const updated = current.filter((m) => m.id !== id);
  try {
    const key = getKey(BASE_KEYS.CHAT_MESSAGES, email);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete chat message', e);
  }
  return updated;
};

export const clearAllChatMessages = (email?: string): void => {
  try {
    const key = getKey(BASE_KEYS.CHAT_MESSAGES, email);
    localStorage.setItem(key, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear chat messages', e);
  }
};

export const getStoredNotifications = (email?: string): NotificationItem[] => {
  try {
    const key = getKey(BASE_KEYS.NOTIFICATIONS, email);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    // ignore
  }
  return [];
};

export const saveNotifications = (notifications: NotificationItem[], email?: string): void => {
  try {
    const key = getKey(BASE_KEYS.NOTIFICATIONS, email);
    localStorage.setItem(key, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
};

export const getStoredAdvisorSessions = (email?: string): AdvisorSession[] => {
  try {
    const key = getKey(BASE_KEYS.ADVISOR_SESSIONS, email);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveAdvisorSession = (session: AdvisorSession, email?: string): void => {
  const current = getStoredAdvisorSessions(email);
  const updated = [session, ...current.filter((s) => s.id !== session.id)];
  try {
    const key = getKey(BASE_KEYS.ADVISOR_SESSIONS, email);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save advisor session', e);
  }
};

export const deleteAdvisorSession = (id: string, email?: string): AdvisorSession[] => {
  const current = getStoredAdvisorSessions(email);
  const updated = current.filter((s) => s.id !== id);
  try {
    const key = getKey(BASE_KEYS.ADVISOR_SESSIONS, email);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete advisor session', e);
  }
  return updated;
};

export const clearAllAdvisorSessions = (email?: string): void => {
  try {
    const key = getKey(BASE_KEYS.ADVISOR_SESSIONS, email);
    localStorage.setItem(key, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear advisor sessions', e);
  }
};
