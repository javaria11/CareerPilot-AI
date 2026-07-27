import React, { useState } from 'react';
import { X, HelpCircle, FileText, Brain, MessageSquare, BarChart3, ChevronDown, Send, CheckCircle2, BookOpen, Mail } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (title: string, type: 'success' | 'error' | 'info', desc?: string) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'guide'>('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Query');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How does the AI Resume Analyzer calculate the ATS score?',
      a: 'The ATS engine parses your uploaded PDF/DOCX or text content and evaluates keyword density, section headers, formatting structure, action verbs, and alignment with target role expectations.',
    },
    {
      q: 'Can I upload DOCX and PDF resumes?',
      a: 'Yes! CareerPilot AI natively parses both PDF and Microsoft Word DOCX files up to 10MB.',
    },
    {
      q: 'Is my resume data kept private and secure?',
      a: 'Absolutely. Your resume text is processed in-memory via secure server API proxy calls and stored locally in your browser. It is never sold or shared with third parties.',
    },
    {
      q: 'How does the Interview Practice Mode work with voice?',
      a: 'In the Interview Generator, click the "Record Voice Answer" button to dictate your answer using Web Speech API speech recognition. Then submit it for instant AI scoring, strength callouts, and STAR method feedback.',
    },
    {
      q: 'How are Skill Gap recommendations generated?',
      a: 'The Skill Gap engine compares your current skills list against live industry market benchmarks for your desired role, producing radar charts, missing skill gap percentages, and curated capstone projects.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSubmitted(true);
    if (onShowToast) {
      onShowToast('Support Request Sent', 'success', 'Our team will respond to your inquiry shortly.');
    }
    setTimeout(() => {
      setContactSubmitted(false);
      setContactMessage('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#bbcabf]/30 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#bbcabf]/20 flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#006c49]" />
            <h3 className="text-lg font-bold text-[#0b1c30]">Help Center & Support</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6c7a71] hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#bbcabf]/20 bg-[#f8f9ff] px-6 gap-6 text-xs font-bold text-[#6c7a71]">
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'faq' ? 'border-[#006c49] text-[#006c49]' : 'border-transparent hover:text-[#0b1c30]'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'guide' ? 'border-[#006c49] text-[#006c49]' : 'border-transparent hover:text-[#0b1c30]'
            }`}
          >
            <BookOpen className="w-4 h-4" /> User Guide
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'contact' ? 'border-[#006c49] text-[#006c49]' : 'border-transparent hover:text-[#0b1c30]'
            }`}
          >
            <Mail className="w-4 h-4" /> Contact Support
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="border border-[#bbcabf]/30 rounded-2xl overflow-hidden bg-[#f8f9ff]">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-4 text-left font-bold text-xs text-[#0b1c30] flex justify-between items-center hover:bg-[#eff4ff]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-[#006c49] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-xs text-[#3c4a42] leading-relaxed border-t border-[#bbcabf]/15 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-[#0b1c30]">
              <div className="p-4 bg-[#eff4ff] rounded-2xl border border-[#006c49]/20">
                <h4 className="font-bold text-[#006c49] mb-1">CareerPilot AI Quick Start Guide</h4>
                <p className="text-[#3c4a42] leading-relaxed">
                  CareerPilot AI combines 4 intelligence engines to systematically boost your career progression.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#bbcabf]/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#006c49]">
                    <FileText className="w-4 h-4" /> 1. Resume Analyzer
                  </div>
                  <p className="text-[#6c7a71] leading-relaxed">
                    Upload PDF/DOCX files or paste resume text. Get overall scores, ATS compatibility badges, missing keywords, and downloadable report text files.
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#bbcabf]/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#006c49]">
                    <Brain className="w-4 h-4" /> 2. Career Advisor AI
                  </div>
                  <p className="text-[#6c7a71] leading-relaxed">
                    Chat with Gemini AI for career pivot strategies, salary negotiation tactics, and recommended career pathways.
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#bbcabf]/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#006c49]">
                    <MessageSquare className="w-4 h-4" /> 3. Interview Generator
                  </div>
                  <p className="text-[#6c7a71] leading-relaxed">
                    Generate technical and behavioral interview loops. Practice live with speech recognition and get instant AI answer evaluations.
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#bbcabf]/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#006c49]">
                    <BarChart3 className="w-4 h-4" /> 4. Skill Gap Analysis
                  </div>
                  <p className="text-[#6c7a71] leading-relaxed">
                    Input your current skills and target role. View competency radar charts, skill gap scores, and actionable learning roadmaps.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {contactSubmitted ? (
                <div className="p-6 bg-[#006c49]/10 border border-[#006c49]/30 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#006c49] mx-auto" />
                  <h4 className="font-bold text-sm text-[#0b1c30]">Message Received!</h4>
                  <p className="text-xs text-[#6c7a71]">Thank you for reaching out. We will respond to your email shortly.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0b1c30] mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Alex Chen"
                        className="w-full px-3 py-2 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0b1c30] mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="alex.chen@example.com"
                        className="w-full px-3 py-2 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">Subject</label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs font-semibold"
                    >
                      <option value="General Query">General Query</option>
                      <option value="Resume Analyzer Help">Resume Analyzer Help</option>
                      <option value="Interview Practice Query">Interview Practice Query</option>
                      <option value="Feature Request">Feature Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1c30] mb-1">Message</label>
                    <textarea
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Describe your query or feedback..."
                      className="w-full h-28 p-3 bg-[#eff4ff] border border-[#bbcabf]/30 rounded-xl text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#006c49] text-white font-bold text-xs rounded-xl hover:bg-[#005136] shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
