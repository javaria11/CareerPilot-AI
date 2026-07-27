import { UserProfile, DashboardStats, ActivityItem, CareerPath } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'User',
  title: '',
  tier: 'PRO MEMBER',
  email: '',
  avatarUrl: '',
  targetRole: '',
  targetGoalProgress: 0,
};

export const initialStats: DashboardStats = {
  resumesAnalyzed: 0,
  interviewsHosted: 0,
  skillsTracked: 0,
  overallMatchScore: 0,
};

export const initialActivities: ActivityItem[] = [];

export const recommendedCareerPaths: CareerPath[] = [];

export const getCareerPathsForUserRole = (targetRole: string): CareerPath[] => {
  if (!targetRole || !targetRole.trim()) {
    return [];
  }

  const cleanRole = targetRole.trim();
  
  return [
    {
      id: `path-user-1`,
      title: `${cleanRole} Specialist`,
      description: `Core progression path expanding specialized expertise and execution velocity in ${cleanRole}.`,
      salaryRange: '$90k - $130k',
      level: 'Mid-Senior',
      matchScore: 'High Match (92%)',
      skillsRequired: ['Core Architecture', 'Technical Execution', 'Performance Optimization', 'Industry Standards'],
    },
    {
      id: `path-user-2`,
      title: `Lead ${cleanRole} Architect`,
      description: `Strategic leadership role designing end-to-end systems and guiding technical direction for ${cleanRole}.`,
      salaryRange: '$120k - $175k',
      level: 'Senior Lead',
      matchScore: 'Target Goal (85%)',
      skillsRequired: ['System Design', 'Strategic Planning', 'Cross-functional Leadership', 'Scaling'],
    },
    {
      id: `path-user-3`,
      title: `Principal ${cleanRole} Director`,
      description: `Executive pathway overseeing major technical operations, innovation roadmaps, and business alignment.`,
      salaryRange: '$160k - $220k+',
      level: 'Executive',
      matchScore: 'Aspirational (78%)',
      skillsRequired: ['Executive Leadership', 'Budget & Strategy', 'Org Development', 'AI Transformation'],
    },
  ];
};
