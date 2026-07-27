export type ActiveTab = 
  | 'home' 
  | 'resume-analyzer' 
  | 'career-advisor' 
  | 'interview-generator' 
  | 'skill-gap-analysis';

export interface UserProfile {
  name: string;
  title: string;
  tier: string;
  avatarUrl: string;
  email: string;
  targetRole: string;
  targetGoalProgress: number; // e.g. 62
  skills?: string[];
}

export interface DashboardStats {
  resumesAnalyzed: number;
  interviewsHosted: number;
  skillsTracked: number;
  overallMatchScore: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'resume' | 'interview' | 'skill' | 'advisor';
  icon: string;
  colorClass: string;
}

export interface ResumeAnalysisResult {
  id: string;
  fileName: string;
  fileSize?: string;
  analyzedAt: string;
  overallScore: number;
  atsScore: number;
  verdict: 'Competitive' | 'Needs Improvement' | 'Exceptional' | 'Strong';
  summary: string;
  strengths: {
    title: string;
    description: string;
  }[];
  weaknesses: {
    title: string;
    description: string;
  }[];
  missingSkills: string[];
  suggestions: string[];
  rawText?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  suggestedPaths?: string[];
  roadmap?: {
    role: string;
    steps: string[];
  };
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  salaryRange: string;
  level: string;
  matchScore: string;
  skillsRequired: string[];
}

export interface InterviewQuestion {
  id: number;
  question: string;
  type: 'Technical' | 'Behavioral';
  category: string;
  sampleAnswer: string;
  evaluationCriteria: string[];
  userAnswer?: string;
  feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    overallFeedback: string;
  };
}

export interface InterviewSession {
  id: string;
  industry: string;
  targetRole: string;
  interviewType: 'Technical' | 'Behavioral' | 'Combined';
  questionsCount: number;
  createdAt: string;
  questions: InterviewQuestion[];
  completed: boolean;
  overallScore?: number;
}

export interface SkillItem {
  name: string;
  userScore: number; // 0 - 100
  marketScore: number; // 0 - 100
  category?: string;
  requiredLevel?: 'Basic' | 'Intermediate' | 'High' | 'Expert';
  userLevel?: 'None' | 'Low' | 'Intermediate' | 'Expert';
  recommendedCourses?: {
    title: string;
    type: string;
    duration: string;
    link?: string;
  }[];
}

export interface SkillGapResult {
  id?: string;
  createdAt?: string;
  targetRole: string;
  companyName?: string;
  matchPercentage: number;
  summary: string;
  radarData: {
    skill: string;
    yourSkill: number;
    marketReq: number;
  }[];
  missingSkills: {
    name: string;
    requiredLevel: string;
    userLevel: string;
    gapScore: number; // percentage
    recommendedAction: string;
  }[];
  learningRoadmap: {
    phase: string;
    duration: string;
    topics: string[];
  }[];
  recommendedProjects: {
    title: string;
    description: string;
    techStack: string[];
  }[];
  marketInsight: string;
}

export interface AdvisorSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  linkTab?: ActiveTab;
}
