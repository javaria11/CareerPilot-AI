import React, { useState, useRef } from 'react';
import { InterviewSession, InterviewQuestion, UserProfile } from '../types';
import { saveInterviewSession, getStoredInterviews } from '../utils/storage';
import { deleteInterviewSession } from '../utils/storage';
import {
  MessageSquare,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Award,
  Video,
  Clock,
  Check,
  Trash2,
  Plus,
  History,
} from 'lucide-react';

interface InterviewGeneratorViewProps {
  userProfile?: UserProfile;
  sessions?: InterviewSession[];
  onSessionsChange?: (sessions: InterviewSession[]) => void;
  onClearHistory?: () => void;
  onDeleteSession?: (id: string) => void;
}

export const InterviewGeneratorView: React.FC<InterviewGeneratorViewProps> = ({
  userProfile,
  sessions: externalSessions,
  onSessionsChange,
  onClearHistory,
  onDeleteSession,
}) => {
  const [internalSessions, setInternalSessions] = useState<InterviewSession[]>(
    externalSessions !== undefined ? externalSessions : getStoredInterviews()
  );

  const sessions = externalSessions !== undefined ? externalSessions : internalSessions;

  const [industry, setIndustry] = useState('Technology & Software');
  const [targetRole, setTargetRole] = useState(userProfile?.targetRole || '');
  const [interviewType, setInterviewType] = useState<'Technical' | 'Behavioral' | 'Combined'>('Technical');
  const [questionCount, setQuestionCount] = useState(5);

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(
    sessions.length > 0 ? sessions[0] : null
  );

  React.useEffect(() => {
    setTargetRole(userProfile?.targetRole || '');
  }, [userProfile?.targetRole]);

  React.useEffect(() => {
    if (externalSessions !== undefined) {
      setInternalSessions(externalSessions);
      if (activeSession) {
        const found = externalSessions.find((s) => s.id === activeSession.id);
        if (!found) {
          setActiveSession(externalSessions.length > 0 ? externalSessions[0] : null);
        }
      } else if (externalSessions.length > 0) {
        setActiveSession(externalSessions[0]);
      } else {
        setActiveSession(null);
      }
    }
  }, [externalSessions]);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswerInput, setUserAnswerInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);

  const handleGenerateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry,
          targetRole,
          interviewType,
          count: questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate interview questions.');
      }

      const session: InterviewSession = await response.json();
      setActiveSession(session);
      setCurrentQuestionIdx(0);
      setUserAnswerInput('');
      const updated = [session, ...sessions];
      setInternalSessions(updated);
      if (onSessionsChange) onSessionsChange(updated);
      saveInterviewSession(session);
    } catch (err: any) {
      alert(err.message || 'Error generating interview session.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReadQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isReadingQuestion) {
      window.speechSynthesis.cancel();
      setIsReadingQuestion(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsReadingQuestion(false);
    utterance.onerror = () => setIsReadingQuestion(false);
    setIsReadingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeechAnswer = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      let currentText = '';
      for (let i = 0; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setUserAnswerInput(currentText);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
  };

  const handleSubmitAnswer = async () => {
    if (!activeSession || !userAnswerInput.trim() || isEvaluating) return;

    const currentQ = activeSession.questions[currentQuestionIdx];
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          userAnswer: userAnswerInput,
          targetRole: activeSession.targetRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer.');
      }

      const feedback = await response.json();

      const updatedQuestions = [...activeSession.questions];
      updatedQuestions[currentQuestionIdx] = {
        ...currentQ,
        userAnswer: userAnswerInput,
        feedback,
      };

      const updatedSession = {
        ...activeSession,
        questions: updatedQuestions,
      };

      setActiveSession(updatedSession);
      saveInterviewSession(updatedSession);
    } catch (err: any) {
      alert(err.message || 'Error submitting answer for evaluation.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentQ = activeSession?.questions[currentQuestionIdx];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30] flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#006c49]" /> AI Interview Generator & Practice Studio
          </h2>
          <p className="text-xs text-[#6c7a71] mt-1">
            Generate custom technical and behavioral interview questions tailored to target roles and practice with real-time AI feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveSession(null);
              setCurrentQuestionIdx(0);
              setUserAnswerInput('');
            }}
            className="px-3 py-1.5 bg-[#006c49]/10 text-[#006c49] rounded-xl text-xs font-bold hover:bg-[#006c49]/20 transition-colors flex items-center gap-1.5"
            title="Configure new interview practice session"
          >
            <Plus className="w-4 h-4" /> New Session Setup
          </button>
        </div>
      </div>

      {/* Main Setup & Past Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Setup Form (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-[#bbcabf]/30 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <Video className="w-5 h-5 text-[#006c49]" /> Configure New Interview Session
          </h3>

          <form onSubmit={handleGenerateInterview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs font-semibold text-[#0b1c30]"
                >
                  <option value="Technology & Software">Technology & Software</option>
                  <option value="Finance & Banking">Finance & Banking</option>
                  <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                  <option value="Creative & Design">Creative & Design</option>
                  <option value="Product & Growth Marketing">Product & Growth Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs text-[#0b1c30]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">Focus Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs font-semibold text-[#0b1c30]"
                >
                  <option value="Technical">Technical & System Design</option>
                  <option value="Behavioral">Behavioral (STAR Method)</option>
                  <option value="Combined">Combined Loop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] uppercase mb-1">Number of Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs font-semibold text-[#0b1c30]"
                >
                  <option value={3}>3 Questions (Quick Practice)</option>
                  <option value={5}>5 Questions (Standard Loop)</option>
                  <option value={8}>8 Questions (Deep Audit)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-[#006c49] to-[#10b981] text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating AI Interview Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Practice Interview Loop
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right 4 Cols: Past Interview Sessions */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#bbcabf]/30 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <History className="w-5 h-5 text-[#006c49]" /> Past Interview Sessions
              </h3>
              <span className="text-[10px] font-bold text-[#6c7a71] bg-[#eff4ff] px-2.5 py-0.5 rounded-full">
                {sessions.length} Saved
              </span>
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSession(s);
                      setCurrentQuestionIdx(0);
                      setUserAnswerInput(s.questions[0]?.userAnswer || '');
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      activeSession?.id === s.id
                        ? 'bg-[#006c49]/10 border-[#006c49]'
                        : 'bg-[#f8f9ff] border-[#bbcabf]/20 hover:border-[#006c49]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#0b1c30] truncate">{s.targetRole}</h4>
                        <p className="text-[10px] text-[#6c7a71] truncate">
                          {s.interviewType} • {s.questions?.length || s.questionsCount} Qs ({s.createdAt})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetId = s.id;
                        const updated = deleteInterviewSession(targetId);
                        setInternalSessions(updated);
                        if (onSessionsChange) onSessionsChange(updated);
                        if (activeSession?.id === targetId) {
                          const nextActive = updated.length > 0 ? updated[0] : null;
                          setActiveSession(nextActive);
                          setCurrentQuestionIdx(0);
                          setUserAnswerInput(nextActive?.questions[0]?.userAnswer || '');
                        }
                        if (onDeleteSession) onDeleteSession(targetId);
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
                No past interview sessions saved yet. Generate a loop to start practicing!
              </p>
            )}
          </div>

          {sessions.length > 0 && onClearHistory && (
            <button
              onClick={() => {
                onClearHistory();
                setInternalSessions([]);
                if (onSessionsChange) onSessionsChange([]);
                setActiveSession(null);
                setCurrentQuestionIdx(0);
                setUserAnswerInput('');
              }}
              className="w-full mt-3 py-2 text-xs font-bold text-[#6c7a71] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-dashed border-[#bbcabf]/30"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Saved Interview Sessions
            </button>
          )}
        </div>
      </div>

      {/* Active Session Interactive Practice Arena */}
      {activeSession && currentQ && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#bbcabf]/30 shadow-sm space-y-6">
          {/* Question Navigator */}
          <div className="flex items-center justify-between border-b border-[#bbcabf]/20 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#006c49] bg-[#006c49]/10 px-3 py-1 rounded-full">
                Question {currentQuestionIdx + 1} of {activeSession.questions.length}
              </span>
              <span className="text-xs font-semibold text-[#6c7a71]">
                Category: {currentQ.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => {
                  setCurrentQuestionIdx((p) => p - 1);
                  setUserAnswerInput(activeSession.questions[currentQuestionIdx - 1]?.userAnswer || '');
                }}
                className="p-2 border border-[#bbcabf]/30 rounded-xl text-xs hover:bg-[#eff4ff] disabled:opacity-30"
                title="Previous Question"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentQuestionIdx === activeSession.questions.length - 1}
                onClick={() => {
                  setCurrentQuestionIdx((p) => p + 1);
                  setUserAnswerInput(activeSession.questions[currentQuestionIdx + 1]?.userAnswer || '');
                }}
                className="p-2 border border-[#bbcabf]/30 rounded-xl text-xs hover:bg-[#eff4ff] disabled:opacity-30"
                title="Next Question"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const targetId = activeSession.id;
                  const updated = deleteInterviewSession(targetId);
                  setInternalSessions(updated);
                  if (onSessionsChange) onSessionsChange(updated);
                  const nextActive = updated.length > 0 ? updated[0] : null;
                  setActiveSession(nextActive);
                  setCurrentQuestionIdx(0);
                  setUserAnswerInput(nextActive?.questions[0]?.userAnswer || '');
                  if (onDeleteSession) onDeleteSession(targetId);
                }}
                className="px-2.5 py-1.5 border border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ml-2"
                title="Delete current practice session"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Session</span>
              </button>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 bg-[#f8f9ff] rounded-2xl border border-[#bbcabf]/20 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base md:text-lg font-bold text-[#0b1c30] leading-snug">
                "{currentQ.question}"
              </h3>
              <button
                onClick={() => handleReadQuestion(currentQ.question)}
                className={`p-2 rounded-xl transition-all ${
                  isReadingQuestion ? 'bg-[#006c49] text-white' : 'bg-[#eff4ff] text-[#006c49]'
                }`}
                title="Listen to question"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-bold text-[#6c7a71] uppercase mb-1">
                Key Evaluation Criteria:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentQ.evaluationCriteria.map((c, i) => (
                  <span key={i} className="text-[11px] bg-white px-2.5 py-0.5 rounded-md border text-[#3c4a42]">
                    • {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Practice Input Arena */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#0b1c30] uppercase">
                Your Spoken or Typed Response
              </label>

              <button
                type="button"
                onClick={handleSpeechAnswer}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isRecording ? 'bg-[#ba1a1a] text-white animate-pulse' : 'bg-[#eff4ff] text-[#006c49]'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? 'Recording Speech...' : 'Record Voice Answer'}</span>
              </button>
            </div>

            <textarea
              value={userAnswerInput}
              onChange={(e) => setUserAnswerInput(e.target.value)}
              placeholder="Type or dictate your structured response here..."
              className="w-full h-36 p-4 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-2xl text-xs md:text-sm text-[#0b1c30] focus:outline-none focus:border-[#006c49] resize-none"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSubmitAnswer}
                disabled={isEvaluating || !userAnswerInput.trim()}
                className="px-6 py-3 bg-[#006c49] text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Answer...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit for AI Feedback
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Feedback Output */}
          {currentQ.feedback && (
            <div className="p-6 bg-[#eff4ff] rounded-3xl border border-[#006c49]/20 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#006c49] flex items-center gap-2">
                  <Award className="w-5 h-5" /> AI Evaluation Feedback
                </h4>
                <span className="text-xl font-extrabold text-[#006c49]">
                  {currentQ.feedback.score} / 100 Score
                </span>
              </div>

              <p className="text-xs text-[#3c4a42] leading-relaxed">
                {currentQ.feedback.overallFeedback}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#10b981]/30">
                  <span className="font-bold text-[#006c49] block mb-1">Strengths Noted:</span>
                  <ul className="list-disc pl-4 space-y-1 text-[#3c4a42]">
                    {currentQ.feedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#ba1a1a]/20">
                  <span className="font-bold text-[#ba1a1a] block mb-1">Areas for Refinement:</span>
                  <ul className="list-disc pl-4 space-y-1 text-[#3c4a42]">
                    {currentQ.feedback.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Ideal Sample Answer Accordion */}
          <details className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#bbcabf]/20 cursor-pointer text-xs">
            <summary className="font-bold text-[#0b1c30]">
              View Sample Ideal Answer & Best Practices
            </summary>
            <div className="mt-3 pt-3 border-t border-[#bbcabf]/20 text-[#3c4a42] space-y-2 leading-relaxed">
              <p>{currentQ.sampleAnswer}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
