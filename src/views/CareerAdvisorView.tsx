import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile, CareerPath, AdvisorSession } from '../types';
import {
  getStoredChatMessages,
  saveChatMessages,
  getStoredAdvisorSessions,
  saveAdvisorSession,
  deleteAdvisorSession,
} from '../utils/storage';
import { getCareerPathsForUserRole } from '../data/initialData';
import {
  Brain,
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Trash2,
  Mic,
  MicOff,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Award,
  Target,
  History,
  MessageSquare,
} from 'lucide-react';

interface CareerAdvisorViewProps {
  userProfile: UserProfile;
  messages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onClearChat?: () => void;
  onShowToast?: (title: string, type?: 'success' | 'error' | 'info', description?: string) => void;
}

export const CareerAdvisorView: React.FC<CareerAdvisorViewProps> = ({
  userProfile,
  messages: externalMessages,
  onMessagesChange,
  onClearChat,
  onShowToast,
}) => {
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>(
    externalMessages !== undefined ? externalMessages : getStoredChatMessages()
  );
  const [pastSessions, setPastSessions] = useState<AdvisorSession[]>(getStoredAdvisorSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const messages = externalMessages !== undefined ? externalMessages : internalMessages;

  useEffect(() => {
    if (externalMessages !== undefined) {
      setInternalMessages(externalMessages);
    }
  }, [externalMessages]);

  const dynamicPaths = getCareerPathsForUserRole(userProfile.targetRole);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const promptSuggestions = [
    'How do I pivot from QA to Data Engineering?',
    'What are the top 3 certifications for AWS Cloud Architecture?',
    'Generate a 3-month roadmap for Product Analytics.',
    'How should I structure my salary negotiation call?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text || text.trim().length === 0 || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setInternalMessages(newMessages);
    if (onMessagesChange) onMessagesChange(newMessages);
    saveChatMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: newMessages.slice(-8), // send recent history context
          message: text,
          userContext: userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from Career Advisor AI.');
      }

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: data.text || "I'm sorry, I couldn't process your request right now.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedWithBot = [...newMessages, botMsg];
      setInternalMessages(updatedWithBot);
      if (onMessagesChange) onMessagesChange(updatedWithBot);
      saveChatMessages(updatedWithBot);
    } catch (err: any) {
      console.error('Advisor Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: '⚠️ An error occurred while communicating with Career Advisor AI. Please verify your internet connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updatedWithError = [...newMessages, errorMsg];
      setInternalMessages(updatedWithError);
      if (onMessagesChange) onMessagesChange(updatedWithError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleDeleteMessage = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setInternalMessages(updated);
    if (onMessagesChange) onMessagesChange(updated);
    saveChatMessages(updated);
    if (onShowToast) onShowToast('Message Deleted', 'info', 'Message removed from active chat.');
  };

  const handleNewSession = () => {
    // If current conversation has user messages, auto-save to past sessions
    const hasUserMsg = messages.some((m) => m.sender === 'user');
    if (hasUserMsg) {
      const firstUserMsg = messages.find((m) => m.sender === 'user')?.text || 'Career Consultation';
      const title = firstUserMsg.length > 32 ? `${firstUserMsg.substring(0, 32)}...` : firstUserMsg;
      const newSavedSession: AdvisorSession = {
        id: `session-${Date.now()}`,
        title,
        createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        messages: [...messages],
      };
      saveAdvisorSession(newSavedSession);
      setPastSessions(getStoredAdvisorSessions());
    }

    const initial = [
      {
        id: `msg-${Date.now()}`,
        sender: 'bot' as const,
        text: `New conversation started. How can I guide your career goals today, ${userProfile.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setInternalMessages(initial);
    if (onMessagesChange) onMessagesChange(initial);
    saveChatMessages(initial);
    setActiveSessionId(null);
    if (onShowToast) {
      onShowToast(
        'New Session Started',
        'success',
        hasUserMsg ? 'Previous consultation saved to Past Sessions.' : 'Fresh chat session started.'
      );
    }
  };

  const handleOpenSession = (session: AdvisorSession) => {
    setInternalMessages(session.messages);
    if (onMessagesChange) onMessagesChange(session.messages);
    saveChatMessages(session.messages);
    setActiveSessionId(session.id);
    if (onShowToast) {
      onShowToast('Session Opened', 'info', `Loaded past session: "${session.title}"`);
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteAdvisorSession(id);
    setPastSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
    if (onShowToast) {
      onShowToast('Session Deleted', 'info', 'Career advisor session deleted.');
    }
  };

  const handleClearHistory = () => {
    const initial = [
      {
        id: 'msg-1',
        sender: 'bot' as const,
        text: `Hello ${userProfile.name}! I am your dedicated Career Advisor AI. Ask me anything regarding career transitions, interview preparation, salary strategies, or learning roadmaps!`,
        timestamp: '10:00 AM',
      },
    ];
    setInternalMessages(initial);
    if (onMessagesChange) onMessagesChange(initial);
    saveChatMessages(initial);
    if (onClearChat) onClearChat();
    if (onShowToast) onShowToast('Chat Cleared', 'info', 'Chat history cleared.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30] flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#006c49]" /> AI Career Advisor & Growth Companion
          </h2>
          <p className="text-xs text-[#6c7a71] mt-1">
            Get personalized career guidance, step-by-step learning roadmaps, salary insights, and transition strategies powered by Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewSession}
            className="px-3 py-1.5 bg-[#006c49]/10 text-[#006c49] rounded-xl text-xs font-bold hover:bg-[#006c49]/20 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
          <button
            onClick={handleClearHistory}
            className="p-2 text-[#6c7a71] hover:text-[#ba1a1a] hover:bg-slate-100 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" /> Clear Chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chat Interface Column */}
        <div className="lg:col-span-8 flex flex-col h-[680px] bg-white rounded-3xl border border-[#bbcabf]/30 shadow-sm overflow-hidden">
          {/* Chat Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#f8f9ff]/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[88%] group relative ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-[#0058be] text-white'
                        : 'bg-gradient-to-br from-[#006c49] to-[#10b981] text-white'
                    }`}
                  >
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>

                  <div className="relative">
                    <div
                      className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                        isUser
                          ? 'bg-[#0058be] text-white rounded-tr-none'
                          : 'bg-white border border-[#bbcabf]/30 text-[#0b1c30] rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center justify-between mt-1 px-1">
                      <span className="text-[10px] text-[#6c7a71]">
                        {msg.timestamp}
                      </span>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 text-slate-400 hover:text-[#ba1a1a] hover:bg-slate-200/50 rounded transition-colors ml-2"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#006c49] to-[#10b981] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="p-4 bg-white border border-[#bbcabf]/30 text-xs text-[#6c7a71] rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#006c49] animate-spin" />
                  <span>Advisor AI is crafting your response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="p-3 bg-white border-t border-[#bbcabf]/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-[#6c7a71] uppercase shrink-0">
              Suggestions:
            </span>
            {promptSuggestions.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 bg-[#eff4ff] hover:bg-[#2170e4]/10 text-[#006c49] text-xs font-medium rounded-full shrink-0 transition-colors border border-[#bbcabf]/20"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-white border-t border-[#bbcabf]/20 flex items-center gap-3">
            <button
              onClick={handleSpeechInput}
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? 'bg-[#ba1a1a] text-white animate-pulse'
                  : 'bg-[#eff4ff] text-[#6c7a71] hover:text-[#006c49]'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about careers, certifications, salary negotiation, or roadmaps..."
              className="flex-1 py-3 px-4 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs md:text-sm text-[#0b1c30] focus:outline-none focus:border-[#006c49]"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 bg-gradient-to-r from-[#006c49] to-[#10b981] text-white rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Sidebar Column: Past Sessions & Recommended Paths */}
        <div className="lg:col-span-4 space-y-6">
          {/* Past Consultation Sessions */}
          <div className="bg-white rounded-3xl p-6 border border-[#bbcabf]/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <History className="w-5 h-5 text-[#006c49]" /> Past Sessions
              </h3>
              <span className="text-[10px] font-bold text-[#6c7a71] bg-[#eff4ff] px-2.5 py-0.5 rounded-full">
                {pastSessions.length} Saved
              </span>
            </div>

            {pastSessions.length > 0 ? (
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleOpenSession(session)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      activeSessionId === session.id
                        ? 'bg-[#006c49]/10 border-[#006c49]'
                        : 'bg-[#f8f9ff] border-[#bbcabf]/20 hover:border-[#006c49]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#0b1c30] truncate">{session.title}</h4>
                        <p className="text-[10px] text-[#6c7a71] truncate">{session.createdAt}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="p-1.5 text-[#6c7a71] hover:text-[#ba1a1a] hover:bg-slate-200/50 rounded-lg transition-colors shrink-0"
                      title="Delete this session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6c7a71] italic text-center py-3 bg-[#f8f9ff] rounded-2xl border border-dashed border-[#bbcabf]/30">
                No past sessions saved yet. Start chatting and click "New Session" to archive conversations!
              </p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#bbcabf]/30 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#006c49]" /> Recommended Career Paths
            </h3>
            {dynamicPaths.length > 0 ? (
              <>
                <p className="text-xs text-[#6c7a71]">
                  Custom pathways generated for your target role: <strong className="text-[#0b1c30]">{userProfile.targetRole}</strong>
                </p>

                <div className="space-y-4">
                  {dynamicPaths.map((path) => (
                    <div
                      key={path.id}
                      onClick={() => setSelectedPath(path)}
                      className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/20 hover:border-[#006c49] cursor-pointer transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-[#0b1c30]">{path.title}</h4>
                        <span className="text-[10px] font-bold text-[#006c49] bg-[#006c49]/10 px-2 py-0.5 rounded-full">
                          {path.matchScore}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#3c4a42] line-clamp-2">{path.description}</p>
                      <div className="mt-3 pt-2 border-t border-[#bbcabf]/15 flex items-center justify-between text-[10px] font-bold text-[#6c7a71]">
                        <span className="flex items-center gap-1 text-[#0058be]">
                          <DollarSign className="w-3 h-3" /> {path.salaryRange}
                        </span>
                        <span>{path.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-5 bg-[#eff4ff]/60 border border-[#bbcabf]/30 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#006c49]/10 text-[#006c49] flex items-center justify-center mx-auto">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0b1c30]">No Target Role Set Yet</h4>
                  <p className="text-[11px] text-[#6c7a71] mt-1 leading-relaxed">
                    Set your target role in Settings or run a Skill Gap Analysis to generate customized career pathways based on your background.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Path Details Modal */}
      {selectedPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-[#bbcabf]/30 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider">
                  Career Pathway
                </span>
                <h3 className="text-lg font-bold text-[#0b1c30]">{selectedPath.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPath(null)}
                className="text-xs text-[#6c7a71] hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#3c4a42] leading-relaxed">{selectedPath.description}</p>

            <div className="p-3 bg-[#eff4ff] rounded-xl flex justify-between text-xs font-bold text-[#0b1c30]">
              <span>Salary Range: {selectedPath.salaryRange}</span>
              <span>Level: {selectedPath.level}</span>
            </div>

            <div>
              <h5 className="text-xs font-bold text-[#0b1c30] mb-2">Core Required Skills:</h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedPath.skillsRequired.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#006c49]/10 text-[#006c49] text-[11px] font-bold rounded-lg"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                handleSendMessage(
                  `Give me a detailed 4-week step-by-step learning roadmap and certification recommendation to become a ${selectedPath.title}.`
                );
                setSelectedPath(null);
              }}
              className="w-full py-3 bg-[#006c49] text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Ask AI to Generate Full Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
