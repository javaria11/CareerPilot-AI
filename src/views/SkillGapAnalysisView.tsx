import React, { useState } from 'react';
import { SkillGapResult, UserProfile } from '../types';
import { getStoredSkillGap, getStoredSkillGapHistory, saveSkillGapResult, deleteSkillGapResult } from '../utils/storage';
import {
  BarChart3,
  Sparkles,
  Target,
  CheckCircle2,
  BookOpen,
  FolderGit2,
  Loader2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Trash2,
  History,
  Plus,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SkillGapAnalysisViewProps {
  userProfile?: UserProfile;
  analysisResult?: SkillGapResult | null;
  onAnalysisResultChange?: (result: SkillGapResult | null) => void;
  onDeleteSkillGap?: () => void;
  onShowToast?: (title: string, type?: 'success' | 'error' | 'info', description?: string) => void;
}

export const SkillGapAnalysisView: React.FC<SkillGapAnalysisViewProps> = ({
  userProfile,
  analysisResult: externalResult,
  onAnalysisResultChange,
  onDeleteSkillGap,
  onShowToast,
}) => {
  const [currentSkills, setCurrentSkills] = useState('');
  const [targetRole, setTargetRole] = useState(userProfile?.targetRole || '');
  const [companyName, setCompanyName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [historySessions, setHistorySessions] = useState<SkillGapResult[]>(getStoredSkillGapHistory());

  const [internalResult, setInternalResult] = useState<SkillGapResult | null>(() => {
    if (externalResult !== undefined) return externalResult;
    const history = getStoredSkillGapHistory();
    return history.length > 0 ? history[0] : getStoredSkillGap();
  });

  React.useEffect(() => {
    const freshHistory = getStoredSkillGapHistory();
    setHistorySessions(freshHistory);
    if (externalResult !== undefined) {
      setInternalResult(externalResult);
    } else if (freshHistory.length > 0 && (!internalResult || !freshHistory.some((h) => h.id === internalResult.id))) {
      setInternalResult(freshHistory[0]);
    }
  }, [externalResult]);

  React.useEffect(() => {
    setTargetRole(userProfile?.targetRole || '');
  }, [userProfile?.targetRole]);

  const analysisResult = externalResult !== undefined ? externalResult : internalResult;

  const handleDeleteReport = (idToDelete?: string) => {
    const updated = deleteSkillGapResult(idToDelete || analysisResult?.id);
    setHistorySessions(updated);
    const nextResult = updated.length > 0 ? updated[0] : null;
    setInternalResult(nextResult);
    if (onAnalysisResultChange) onAnalysisResultChange(nextResult);
    if (onDeleteSkillGap && updated.length === 0) onDeleteSkillGap();
    if (onShowToast) {
      onShowToast('Report Deleted', 'info', 'Skill gap analysis session removed.');
    }
  };

  const handleClearAllHistory = () => {
    const updated = deleteSkillGapResult();
    setHistorySessions([]);
    setInternalResult(null);
    if (onAnalysisResultChange) onAnalysisResultChange(null);
    if (onDeleteSkillGap) onDeleteSkillGap();
    if (onShowToast) {
      onShowToast('History Cleared', 'info', 'All skill gap analysis sessions cleared.');
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSkills.trim() || !targetRole.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/skillgap/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSkills,
          targetRole,
          companyName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run skill gap analysis.');
      }

      const data: SkillGapResult = await response.json();
      const updatedHistory = saveSkillGapResult(data);
      setHistorySessions(updatedHistory);
      setInternalResult(data);
      if (onAnalysisResultChange) onAnalysisResultChange(data);
      if (onShowToast) {
        onShowToast('Skill Gap Audit Completed', 'success', `Analyzed competency match for ${data.targetRole}.`);
      }
    } catch (err: any) {
      alert(err.message || 'Error running skill gap analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#006c49]" /> Skill Gap & Competency Analysis
          </h2>
          <p className="text-xs text-[#6c7a71] mt-1">
            Compare your current technical matrix against live industry demands for your target role to unlock a personalized learning roadmap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setInternalResult(null);
              if (onAnalysisResultChange) onAnalysisResultChange(null);
            }}
            className="px-3 py-1.5 bg-[#006c49]/10 text-[#006c49] rounded-xl text-xs font-bold hover:bg-[#006c49]/20 transition-colors flex items-center gap-1.5"
            title="Start new skill gap audit"
          >
            <Plus className="w-4 h-4" /> New Audit Setup
          </button>
        </div>
      </div>

      {/* Main Form & Past Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audit Form (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-[#bbcabf]/30 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#006c49]" /> Define Your Competency Delta
          </h3>

          <form onSubmit={handleRunAnalysis} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">
                  Your Current Skills (Comma Separated)
                </label>
                <textarea
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, HTML/CSS, Git, Basic GraphQL"
                  className="w-full h-24 p-3 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49] resize-none"
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Architect"
                    className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs text-[#0b1c30]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">
                    Target Company / Industry
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Tier-1 Tech Company"
                    className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs text-[#0b1c30]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-8 py-3.5 bg-gradient-to-r from-[#006c49] to-[#10b981] text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Competencies...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Skill Gap Audit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right 4 Cols: Past Skill Gap Sessions */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#bbcabf]/30 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <History className="w-5 h-5 text-[#006c49]" /> Past Skill Gap Sessions
              </h3>
              <span className="text-[10px] font-bold text-[#6c7a71] bg-[#eff4ff] px-2.5 py-0.5 rounded-full">
                {historySessions.length} Saved
              </span>
            </div>

            {historySessions.length > 0 ? (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {historySessions.map((s) => (
                  <div
                    key={s.id || s.targetRole}
                    onClick={() => {
                      setInternalResult(s);
                      if (onAnalysisResultChange) onAnalysisResultChange(s);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      analysisResult?.id === s.id || analysisResult?.targetRole === s.targetRole
                        ? 'bg-[#006c49]/10 border-[#006c49]'
                        : 'bg-[#f8f9ff] border-[#bbcabf]/20 hover:border-[#006c49]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#0b1c30] truncate">{s.targetRole}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#6c7a71]">
                          <span>{s.companyName || 'General Industry'}</span>
                          <span>•</span>
                          <span className="font-bold text-[#006c49]">{s.matchPercentage}% Match</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReport(s.id);
                      }}
                      className="p-1.5 text-[#6c7a71] hover:text-[#ba1a1a] hover:bg-slate-200/50 rounded-lg transition-colors shrink-0"
                      title="Delete this session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6c7a71] italic text-center py-6 bg-[#f8f9ff] rounded-2xl border border-dashed border-[#bbcabf]/30">
                No past skill gap sessions saved yet. Run an audit to start building your history!
              </p>
            )}
          </div>

          {historySessions.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="w-full mt-3 py-2 text-xs font-bold text-[#6c7a71] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-dashed border-[#bbcabf]/30"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Saved Skill Gap Sessions
            </button>
          )}
        </div>
      </div>

      {/* Results Dashboard */}
      {analysisResult ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Banner: Match Score & Market Insight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#bbcabf]/30 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-xs font-bold text-[#6c7a71] uppercase">Skill Match Score</span>
              <div className="text-5xl font-extrabold text-[#006c49] my-2">
                {analysisResult.matchPercentage}%
              </div>
              <p className="text-xs font-semibold text-[#3c4a42]">
                For {analysisResult.targetRole}
              </p>
            </div>

            <div className="md:col-span-2 bg-[#f8f9ff] p-6 rounded-3xl border border-[#bbcabf]/30 shadow-sm flex flex-col justify-between space-y-2 relative group">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#006c49]" /> Market Insight & Verdict
                  </h4>
                  <button
                    onClick={handleDeleteReport}
                    className="px-2.5 py-1 text-[#ba1a1a] border border-[#ba1a1a]/30 hover:bg-[#ba1a1a]/10 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Delete Skill Gap Report"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Report
                  </button>
                </div>
                <p className="text-xs text-[#3c4a42] leading-relaxed mt-2">
                  {analysisResult.summary}
                </p>
              </div>
              <p className="text-xs text-[#0058be] font-medium pt-1">
                💡 {analysisResult.marketInsight}
              </p>
            </div>
          </div>

          {/* Radar Chart + Missing Skills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Radar Chart */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#bbcabf]/30 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#0b1c30]">
                Competency Radar Comparison
              </h3>
              <p className="text-xs text-[#6c7a71]">
                Your Current Level vs. Market Target Thresholds
              </p>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysisResult.radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#3c4a42', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Radar
                      name="Your Skill"
                      dataKey="yourSkill"
                      stroke="#006c49"
                      fill="#006c49"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Market Requirement"
                      dataKey="marketReq"
                      stroke="#2170e4"
                      fill="#2170e4"
                      fillOpacity={0.2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-bold pt-2 border-t border-[#bbcabf]/20">
                <span className="flex items-center gap-2 text-[#006c49]">
                  <span className="w-3 h-3 rounded-full bg-[#006c49]" /> Your Competency
                </span>
                <span className="flex items-center gap-2 text-[#0058be]">
                  <span className="w-3 h-3 rounded-full bg-[#2170e4]" /> Market Benchmark
                </span>
              </div>
            </div>

            {/* Missing Skills Table */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#bbcabf]/30 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#0b1c30]">Top Identified Skill Gaps</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {analysisResult.missingSkills.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#bbcabf]/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#0b1c30]">{item.name}</span>
                      <span className="text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-md text-[10px]">
                        Req: {item.requiredLevel} (Current: {item.userLevel})
                      </span>
                    </div>

                    <div className="w-full bg-[#bbcabf]/30 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#006c49] to-[#10b981] h-full rounded-full"
                        style={{ width: `${item.gapScore}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#3c4a42] flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-[#006c49] shrink-0" />
                      <span>{item.recommendedAction}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Roadmap */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#bbcabf]/30 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#006c49]" /> Actionable Learning Roadmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analysisResult.learningRoadmap.map((phase, idx) => (
                <div key={idx} className="p-5 bg-[#f8f9ff] rounded-2xl border border-[#bbcabf]/20 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#006c49] bg-[#006c49]/10 px-2.5 py-1 rounded-full">
                      {phase.phase}
                    </span>
                    <span className="text-[10px] font-bold text-[#6c7a71]">{phase.duration}</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[#3c4a42]">
                    {phase.topics.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Portfolio Projects */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#bbcabf]/30 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-[#0b1c30] flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-[#006c49]" /> Recommended Capstone Projects to Build
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisResult.recommendedProjects.map((proj, idx) => (
                <div key={idx} className="p-5 bg-[#eff4ff]/60 rounded-2xl border border-[#0058be]/20 space-y-3">
                  <h4 className="font-bold text-sm text-[#0b1c30]">{proj.title}</h4>
                  <p className="text-xs text-[#3c4a42] leading-relaxed">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 bg-white border border-[#2170e4]/30 text-[#0058be] text-[10px] font-bold rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-[#bbcabf]/30 shadow-sm text-center space-y-3 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-[#006c49]/10 text-[#006c49] flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0b1c30]">No Skill Gap Analysis Generated Yet</h3>
          <p className="text-xs text-[#6c7a71] max-w-md mx-auto leading-relaxed">
            Fill in your current skills and target role above, then click <strong>"Run Skill Gap Audit"</strong> to generate your real-time competency report and personalized learning roadmap.
          </p>
        </div>
      )}
    </div>
  );
};
