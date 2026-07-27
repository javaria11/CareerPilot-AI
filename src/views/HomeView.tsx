import React, { useState } from 'react';
import { UserProfile, DashboardStats, ActivityItem, ActiveTab } from '../types';
import {
  FileText,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  BookOpen,
  Award,
  Trash2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Video,
  Plus,
  X,
} from 'lucide-react';

interface HomeViewProps {
  userProfile: UserProfile;
  stats: DashboardStats;
  activities: ActivityItem[];
  onNavigate: (tab: ActiveTab) => void;
  onClearActivities?: () => void;
  onDeleteActivity?: (id: string) => void;
  onAddCustomActivity?: (title: string, description: string, type: 'resume' | 'interview' | 'skill' | 'advisor') => void;
  onOpenSettings?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile,
  stats,
  activities,
  onNavigate,
  onClearActivities,
  onDeleteActivity,
  onAddCustomActivity,
  onOpenSettings,
}) => {
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'resume' | 'interview' | 'skill' | 'advisor'>('skill');

  const rawName = userProfile.name || 'User';
  const displayUsername = rawName.includes('@') ? rawName.split('@')[0] : rawName;

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (onAddCustomActivity) {
      onAddCustomActivity(newTitle.trim(), newDesc.trim() || 'Custom career milestone logged', newType);
    }
    setNewTitle('');
    setNewDesc('');
    setIsAddActivityOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white bg-gradient-to-r from-[#006c49] via-[#0058be] to-[#00687a] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2">
            Welcome back, {displayUsername}! 👋
          </h2>
          <p className="text-sm md:text-base text-white/90 leading-relaxed mb-6">
            {userProfile.targetRole ? (
              <>
                Your AI Co-pilot has analyzed your career trajectory. You're{' '}
                <strong className="text-[#6ffbbe]">{userProfile.targetGoalProgress || 60}% ready</strong> for your target role as{' '}
                <span className="underline decoration-[#10b981]">{userProfile.targetRole}</span>.
              </>
            ) : (
              <>
                Your account is ready! Complete your professional title and target career role in{' '}
                {onOpenSettings ? (
                  <button
                    onClick={onOpenSettings}
                    className="underline font-bold text-[#6ffbbe] hover:text-white transition-colors"
                  >
                    Settings
                  </button>
                ) : (
                  <span className="font-bold text-[#6ffbbe]">Settings</span>
                )}{' '}
                to personalize your progress co-pilot.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('resume-analyzer')}
              className="bg-white text-[#006c49] px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm hover:bg-[#eff4ff] active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Analyze New Resume</span>
            </button>
            <button
              onClick={() => onNavigate('interview-generator')}
              className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm hover:bg-white/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Start Mock Interview</span>
            </button>
          </div>
        </div>

        {/* Decorative Circle Visual */}
        <div className="relative z-10 hidden md:flex items-center justify-center w-36 h-36 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shrink-0">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-white">{userProfile.targetGoalProgress}%</span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-white/80">
              Profile Score
            </span>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('resume-analyzer')}
          className="bg-white/80 backdrop-blur-md border border-[#bbcabf]/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#006c49]/10 flex items-center justify-center text-[#006c49] group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[#006c49] bg-[#006c49]/10 px-2.5 py-1 rounded-full">
              +12% this month
            </span>
          </div>
          <div>
            <p className="text-[#6c7a71] text-xs font-semibold uppercase tracking-wider mb-1">
              Resumes Analyzed
            </p>
            <h3 className="text-3xl font-extrabold text-[#0b1c30]">{stats.resumesAnalyzed}</h3>
          </div>
        </div>

        <div
          onClick={() => onNavigate('interview-generator')}
          className="bg-white/80 backdrop-blur-md border border-[#bbcabf]/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#0058be]/10 flex items-center justify-center text-[#0058be] group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[#0058be] bg-[#0058be]/10 px-2.5 py-1 rounded-full">
              Active sessions
            </span>
          </div>
          <div>
            <p className="text-[#6c7a71] text-xs font-semibold uppercase tracking-wider mb-1">
              Interviews Hosted
            </p>
            <h3 className="text-3xl font-extrabold text-[#0b1c30]">{stats.interviewsHosted}</h3>
          </div>
        </div>

        <div
          onClick={() => onNavigate('skill-gap-analysis')}
          className="bg-white/80 backdrop-blur-md border border-[#bbcabf]/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00687a]/10 flex items-center justify-center text-[#00687a] group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[#00687a] bg-[#00687a]/10 px-2.5 py-1 rounded-full">
              Top 5% Profile
            </span>
          </div>
          <div>
            <p className="text-[#6c7a71] text-xs font-semibold uppercase tracking-wider mb-1">
              Skills Tracked
            </p>
            <h3 className="text-3xl font-extrabold text-[#0b1c30]">{stats.skillsTracked}</h3>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Recommendations + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recommendations & Career Progress */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#0b1c30]">Next Steps for You</h3>
            <button
              onClick={() => onNavigate('career-advisor')}
              className="text-xs font-bold text-[#006c49] hover:underline flex items-center gap-1"
            >
              View Advisor Suggestions <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Action Card 1 */}
            <div
              onClick={() => onNavigate('skill-gap-analysis')}
              className="bg-white border border-[#bbcabf]/30 border-l-4 border-l-[#10b981] p-6 rounded-2xl relative group cursor-pointer hover:-translate-y-1 transition-all shadow-sm"
            >
              <div className="absolute top-4 right-4 bg-[#10b981]/15 text-[#00422b] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                High Priority
              </div>
              <div className="mb-4">
                <BookOpen className="w-6 h-6 text-[#006c49] mb-2" />
                <h4 className="text-base font-bold text-[#0b1c30] leading-snug">
                  Master System Architecture & Microservices
                </h4>
                <p className="text-xs text-[#3c4a42] mt-2 leading-relaxed">
                  Our market analysis shows 82% of target roles in your area require advanced knowledge of system design patterns.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#bbcabf]/20 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#6c7a71]">Est. 4 hours</span>
                <span className="text-xs font-bold text-[#006c49] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Start Learning <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Action Card 2 */}
            <div
              onClick={() => onNavigate('interview-generator')}
              className="bg-white border border-[#bbcabf]/30 border-l-4 border-l-[#2170e4] p-6 rounded-2xl relative group cursor-pointer hover:-translate-y-1 transition-all shadow-sm"
            >
              <div className="absolute top-4 right-4 bg-[#2170e4]/15 text-[#004395] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Profile Boost
              </div>
              <div className="mb-4">
                <Award className="w-6 h-6 text-[#0058be] mb-2" />
                <h4 className="text-base font-bold text-[#0b1c30] leading-snug">
                  Mock Interview: Technical & Behavioral
                </h4>
                <p className="text-xs text-[#3c4a42] mt-2 leading-relaxed">
                  Practice for your upcoming interview loop with real AI voice/type feedback on conflict resolution and system design.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#bbcabf]/20 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#6c7a71]">Est. 15 mins</span>
                <span className="text-xs font-bold text-[#0058be] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Begin Session <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Career Progress Visualizer */}
          <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-[#bbcabf]/30 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-[#0b1c30]">
                  Target: {userProfile.targetRole || 'Not set'}
                </h4>
                <p className="text-xs text-[#6c7a71]">Progress toward your target career milestone</p>
              </div>
              <span className="text-2xl font-extrabold text-[#006c49]">
                {userProfile.targetGoalProgress || 0}%
              </span>
            </div>

            <div className="relative h-3.5 w-full bg-[#eff4ff] rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#006c49] to-[#10b981] transition-all duration-1000 rounded-full"
                style={{ width: `${userProfile.targetGoalProgress || 0}%` }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#006c49]/10">
                <p className="text-[10px] text-[#6c7a71] uppercase font-bold mb-0.5">Resume ATS</p>
                <p className="text-xs font-bold text-[#006c49]">{stats.overallMatchScore}/100 Score</p>
              </div>
              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#006c49]/10">
                <p className="text-[10px] text-[#6c7a71] uppercase font-bold mb-0.5">Skills Tracked</p>
                <p className="text-xs font-bold text-[#006c49]">{stats.skillsTracked} Skills</p>
              </div>
              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#0058be]/10">
                <p className="text-[10px] text-[#6c7a71] uppercase font-bold mb-0.5">Skill Match</p>
                <p className="text-xs font-bold text-[#0058be]">
                  {stats.skillsTracked > 0 ? `${stats.overallMatchScore || 85}%` : '0%'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#bbcabf]/30">
                <p className="text-[10px] text-[#6c7a71] uppercase font-bold mb-0.5">Interviews</p>
                <p className="text-xs font-bold text-[#0b1c30]">{stats.interviewsHosted} Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity History Feed */}
        <div className="lg:col-span-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-[#bbcabf]/30 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0b1c30]">Recent Activity</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsAddActivityOpen(true)}
                  className="px-2.5 py-1 bg-[#006c49]/10 text-[#006c49] rounded-lg text-xs font-bold hover:bg-[#006c49]/20 transition-colors flex items-center gap-1"
                  title="Add Custom Activity / Milestone"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Data
                </button>
                {activities.length > 0 && onClearActivities && (
                  <button
                    onClick={onClearActivities}
                    className="p-1.5 text-[#6c7a71] hover:text-[#ba1a1a] transition-colors rounded-lg hover:bg-slate-100"
                    title="Clear All Recent Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6 flex-1 max-h-[500px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#6c7a71]">
                  No recent activity logged yet. Click "+ Log Data" above to add new milestones.
                </div>
              ) : (
                activities.map((act, index) => {
                  return (
                    <div key={act.id} className="flex gap-3 relative group">
                      {/* Timeline bar */}
                      {index !== activities.length - 1 && (
                        <div className="absolute top-8 left-4 w-0.5 h-full bg-[#bbcabf]/30 -z-0" />
                      )}
                      <div className="relative z-10 shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${act.colorClass}`}>
                          {act.type === 'resume' && <FileText className="w-4 h-4" />}
                          {act.type === 'interview' && <Video className="w-4 h-4" />}
                          {act.type === 'skill' && <CheckCircle2 className="w-4 h-4" />}
                          {act.type === 'advisor' && <Sparkles className="w-4 h-4" />}
                        </div>
                      </div>
                      <div className="pb-2 flex-1 min-w-0 pr-6">
                        <p className="text-xs font-bold text-[#0b1c30] leading-snug">{act.title}</p>
                        <p className="text-xs text-[#3c4a42] mt-0.5 leading-relaxed">{act.description}</p>
                        <span className="text-[10px] text-[#6c7a71] font-bold uppercase mt-1 inline-block">
                          {act.timestamp}
                        </span>
                      </div>
                      {onDeleteActivity && (
                        <button
                          onClick={() => onDeleteActivity(act.id)}
                          className="absolute right-0 top-0 p-1.5 text-slate-400 hover:text-[#ba1a1a] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete activity item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Activity Modal */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-[#bbcabf]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#bbcabf]/20 pb-3">
              <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#006c49]" /> Log New Career Activity / Goal
              </h3>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Activity / Milestone Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Completed AWS Cloud Practitioner Exam"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#bbcabf]/40 rounded-xl focus:outline-none focus:border-[#006c49]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Category Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-[#bbcabf]/40 rounded-xl focus:outline-none focus:border-[#006c49]"
                >
                  <option value="skill">Skill & Certification</option>
                  <option value="resume">Resume Milestone</option>
                  <option value="interview">Interview Practice</option>
                  <option value="advisor">Advisor Planning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Description / Notes
                </label>
                <textarea
                  placeholder="e.g., Achieved 92% pass score in AWS certification test."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-[#bbcabf]/40 rounded-xl focus:outline-none focus:border-[#006c49]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006c49] text-white text-xs font-bold rounded-xl hover:bg-[#005136]"
                >
                  Save Activity Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
