import React, { useState, useRef, useEffect } from 'react';
import { ResumeAnalysisResult } from '../types';
import { saveResumeResult } from '../utils/storage';
import {
  Upload,
  FileText,
  Sparkles,
  Check,
  AlertTriangle,
  Copy,
  Download,
  Loader2,
  FileCode,
  ListCheck,
  Zap,
  Clock,
  ChevronRight,
  RefreshCw,
  Trash2,
  Plus,
  History,
} from 'lucide-react';

interface ResumeAnalyzerViewProps {
  resumeHistory: ResumeAnalysisResult[];
  onResultGenerated: (result: ResumeAnalysisResult) => void;
  onDeleteResult?: (id: string) => void;
  onClearHistory?: () => void;
}

export const ResumeAnalyzerView: React.FC<ResumeAnalyzerViewProps> = ({
  resumeHistory,
  onResultGenerated,
  onDeleteResult,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<ResumeAnalysisResult | null>(
    resumeHistory.length > 0 ? resumeHistory[0] : null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentResult) {
      const exists = resumeHistory.find((r) => r.id === currentResult.id);
      if (!exists) {
        setCurrentResult(resumeHistory.length > 0 ? resumeHistory[0] : null);
      }
    } else if (resumeHistory.length > 0) {
      setCurrentResult(resumeHistory[0]);
    }
  }, [resumeHistory]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB limit.');
        return;
      }
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB limit.');
        return;
      }
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleAnalyze = async () => {
    if (activeTab === 'upload' && !file) {
      setErrorMessage('Please upload a PDF or DOCX resume file first.');
      return;
    }
    if (activeTab === 'text' && (!pastedText || pastedText.trim().length < 50)) {
      setErrorMessage('Please paste at least 50 characters of resume text.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let body: any = {};

      if (activeTab === 'upload' && file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const resultStr = reader.result as string;
            const base64 = resultStr.split(',')[1] || resultStr;
            resolve(base64);
          };
          reader.onerror = (err) => reject(err);
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;

        body = {
          fileBufferBase64: base64,
          fileName: file.name,
          mimeType: file.type,
        };
      } else {
        body = {
          rawText: pastedText,
          fileName: 'Pasted_Resume_Text.txt',
        };
      }

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze resume.');
      }

      const result: ResumeAnalysisResult = await response.json();
      setCurrentResult(result);
      saveResumeResult(result);
      onResultGenerated(result);
    } catch (err: any) {
      console.error('Resume Analysis Error:', err);
      setErrorMessage(err.message || 'An error occurred during resume analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyReport = () => {
    if (!currentResult) return;
    const reportText = `CAREERPILOT AI - RESUME ANALYSIS REPORT
File Name: ${currentResult.fileName}
Overall Score: ${currentResult.overallScore}/100
ATS Score: ${currentResult.atsScore}/100
Verdict: ${currentResult.verdict}

SUMMARY:
${currentResult.summary}

KEY STRENGTHS:
${currentResult.strengths.map((s) => `• ${s.title}: ${s.description}`).join('\n')}

AREAS FOR IMPROVEMENT:
${currentResult.weaknesses.map((w) => `• ${w.title}: ${w.description}`).join('\n')}

MISSING SKILLS & KEYWORDS:
${currentResult.missingSkills.join(', ')}

SUGGESTIONS:
${currentResult.suggestions.map((s) => `• ${s}`).join('\n')}
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!currentResult) return;
    const reportContent = `=====================================================
CAREERPILOT AI - OFFICIAL RESUME ANALYSIS REPORT
Date: ${currentResult.analyzedAt}
File: ${currentResult.fileName}
Overall Resume Score: ${currentResult.overallScore}/100
ATS Compliance Score: ${currentResult.atsScore}/100
Verdict: ${currentResult.verdict}
=====================================================

1. EXECUTIVE SUMMARY
---------------------
${currentResult.summary}

2. KEY STRENGTHS
---------------------
${currentResult.strengths.map((s, i) => `${i + 1}. ${s.title}\n   ${s.description}`).join('\n\n')}

3. WEAKNESSES & RISKS
---------------------
${currentResult.weaknesses.map((w, i) => `${i + 1}. ${w.title}\n   ${w.description}`).join('\n\n')}

4. MISSING HIGH-VALUE KEYWORDS & SKILLS
----------------------------------------
${currentResult.missingSkills.map((k) => `- ${k}`).join('\n')}

5. ACTIONABLE IMPROVEMENT SUGGESTIONS
--------------------------------------
${currentResult.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resume_Analysis_${currentResult.fileName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#006c49]" /> Resume Analyzer & ATS Audit
          </h2>
          <p className="text-xs text-[#6c7a71] mt-1">
            Upload your resume (PDF or DOCX) to receive real-time Gemini AI scores, ATS keywords audit, and targeted recommendations.
          </p>
        </div>

        {/* Previous reports selector & actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setFile(null);
              setPastedText('');
              setCurrentResult(null);
            }}
            className="px-3 py-1.5 bg-[#006c49]/10 text-[#006c49] rounded-xl text-xs font-bold hover:bg-[#006c49]/20 transition-colors flex items-center gap-1.5"
            title="Start new analysis"
          >
            <Plus className="w-4 h-4" /> New Resume Analysis
          </button>
        </div>
      </div>

      {/* Main Upload & Past Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form (8 Cols) */}
        <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-[#bbcabf]/30 shadow-sm space-y-6">
          {/* Input Switch Tabs */}
          <div className="flex gap-4 border-b border-[#bbcabf]/20 pb-3 text-xs font-bold">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-b-2 border-[#006c49] text-[#006c49]'
                  : 'text-[#6c7a71] hover:text-[#0b1c30]'
              }`}
            >
              <Upload className="w-4 h-4" /> Upload File (PDF / DOCX)
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`pb-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'border-b-2 border-[#006c49] text-[#006c49]'
                  : 'text-[#6c7a71] hover:text-[#0b1c30]'
              }`}
            >
              <FileCode className="w-4 h-4" /> Paste Text Directly
            </button>
          </div>

          {/* Tab 1: Dropzone */}
          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#bbcabf] hover:border-[#006c49] bg-[#eff4ff]/50 hover:bg-[#eff4ff] transition-all rounded-2xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-[#006c49]/10 text-[#006c49] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0b1c30]">
                  {file ? file.name : 'Click to upload or drag & drop resume here'}
                </p>
                <p className="text-xs text-[#6c7a71] mt-1">
                  Supports PDF, DOCX up to 10MB
                </p>
              </div>
              {file && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006c49] bg-[#006c49]/10 px-3 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5" /> File Selected ({(file.size / 1024).toFixed(0)} KB)
                </span>
              )}
            </div>
          ) : (
            /* Tab 2: Textarea */
            <div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your full resume text here (experience, skills, education, projects)..."
                className="w-full h-40 p-4 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-2xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006c49] resize-y"
              />
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Analyze CTA */}
          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-8 py-3.5 bg-gradient-to-r from-[#006c49] to-[#10b981] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Resume with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Comprehensive Resume Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Past Resume Sessions */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#bbcabf]/30 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <History className="w-5 h-5 text-[#006c49]" /> Past Resume Sessions
              </h3>
              <span className="text-[10px] font-bold text-[#6c7a71] bg-[#eff4ff] px-2.5 py-0.5 rounded-full">
                {resumeHistory.length} Saved
              </span>
            </div>

            {resumeHistory.length > 0 ? (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {resumeHistory.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setCurrentResult(r)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      currentResult?.id === r.id
                        ? 'bg-[#006c49]/10 border-[#006c49]'
                        : 'bg-[#f8f9ff] border-[#bbcabf]/20 hover:border-[#006c49]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#0b1c30] truncate">{r.fileName}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#6c7a71]">
                          <span>{r.analyzedAt}</span>
                          <span>•</span>
                          <span className="font-bold text-[#006c49]">{r.overallScore}% ATS</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteResult) {
                          onDeleteResult(r.id);
                          if (currentResult?.id === r.id) {
                            const remaining = resumeHistory.filter((item) => item.id !== r.id);
                            setCurrentResult(remaining.length > 0 ? remaining[0] : null);
                          }
                        }
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
                No past resume sessions saved yet. Upload or paste a resume to start building your history!
              </p>
            )}
          </div>

          {resumeHistory.length > 0 && onClearHistory && (
            <button
              onClick={() => {
                onClearHistory();
                setCurrentResult(null);
              }}
              className="w-full mt-3 py-2 text-xs font-bold text-[#6c7a71] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-dashed border-[#bbcabf]/30"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Saved Resume Sessions
            </button>
          )}
        </div>
      </div>

      {/* Analysis Output Section */}
      {currentResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Score Cards Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="bg-white p-6 rounded-2xl border border-[#bbcabf]/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#6c7a71] uppercase">Overall Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-[#006c49]">
                    {currentResult.overallScore}
                  </span>
                  <span className="text-sm font-semibold text-[#6c7a71]">/ 100</span>
                </div>
                <p className="text-[11px] font-bold text-[#006c49] mt-2">
                  Verdict: {currentResult.verdict}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-[#006c49]/20 border-t-[#006c49] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#006c49]" />
              </div>
            </div>

            {/* ATS Compatibility */}
            <div className="bg-white p-6 rounded-2xl border border-[#bbcabf]/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#6c7a71] uppercase">ATS Compatibility</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-[#0058be]">
                    {currentResult.atsScore}%
                  </span>
                </div>
                <p className="text-[11px] text-[#6c7a71] mt-2">Parser Keyword Compliance</p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-[#0058be]/20 border-t-[#0058be] flex items-center justify-center">
                <ListCheck className="w-8 h-8 text-[#0058be]" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#f8f9ff] p-6 rounded-2xl border border-[#bbcabf]/30 flex flex-col justify-center gap-2.5">
              <button
                onClick={handleCopyReport}
                className="w-full py-2 bg-white border border-[#bbcabf]/40 text-[#0b1c30] font-bold text-xs rounded-xl hover:bg-[#eff4ff] transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-[#006c49]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Report Copied!' : 'Copy Summary Report'}</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="w-full py-2 bg-[#006c49] text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Report (.txt)</span>
              </button>
              {onDeleteResult && (
                <button
                  onClick={() => {
                    const targetId = currentResult.id;
                    onDeleteResult(targetId);
                    const remaining = resumeHistory.filter((r) => r.id !== targetId);
                    setCurrentResult(remaining.length > 0 ? remaining[0] : null);
                  }}
                  className="w-full py-2 bg-white border border-[#ba1a1a]/40 text-[#ba1a1a] font-bold text-xs rounded-xl hover:bg-[#ba1a1a]/10 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#bbcabf]/30 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#006c49]" /> Executive Summary
            </h3>
            <p className="text-xs md:text-sm text-[#3c4a42] leading-relaxed">
              {currentResult.summary}
            </p>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white p-6 rounded-3xl border border-[#bbcabf]/30 border-l-4 border-l-[#10b981] shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[#006c49] flex items-center gap-2">
                <Check className="w-4 h-4" /> Key Strengths
              </h4>
              <div className="space-y-3">
                {currentResult.strengths.map((s, idx) => (
                  <div key={idx} className="p-3 bg-[#eff4ff]/60 rounded-xl">
                    <p className="text-xs font-bold text-[#0b1c30]">{s.title}</p>
                    <p className="text-xs text-[#3c4a42] mt-1">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-white p-6 rounded-3xl border border-[#bbcabf]/30 border-l-4 border-l-[#ba1a1a] shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[#ba1a1a] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Areas for Growth
              </h4>
              <div className="space-y-3">
                {currentResult.weaknesses.map((w, idx) => (
                  <div key={idx} className="p-3 bg-[#ffdad6]/30 rounded-xl">
                    <p className="text-xs font-bold text-[#0b1c30]">{w.title}</p>
                    <p className="text-xs text-[#3c4a42] mt-1">{w.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missing Skills & Keyword Audit */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#bbcabf]/30 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-[#0b1c30]">
              Missing ATS High-Value Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentResult.missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#2170e4]/10 text-[#0058be] text-xs font-bold rounded-full"
                >
                  + {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#bbcabf]/30 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-[#0b1c30]">
              Actionable Improvement Suggestions
            </h4>
            <ul className="space-y-2.5">
              {currentResult.suggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#3c4a42]">
                  <ChevronRight className="w-4 h-4 text-[#006c49] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
