import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
import mammoth from 'mammoth';

const currentFilename = typeof __filename !== 'undefined'
  ? __filename
  : (import.meta && import.meta.url ? fileURLToPath(import.meta.url) : process.cwd());

const currentDirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(currentFilename);

const app = express();
const PORT = 3000;

// Middleware for large base64 JSON payloads (PDF/DOCX uploads)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize Gemini Client Lazily/Safely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------------------------------------------
// 1. Resume Extraction & Gemini Analysis
// ----------------------------------------------------
app.post('/api/resume/analyze', async (req, res) => {
  try {
    const { fileBufferBase64, fileName, mimeType, rawText } = req.body;

    let extractedText = rawText || '';

    // Extract text from file if provided
    if (fileBufferBase64 && !extractedText) {
      const buffer = Buffer.from(fileBufferBase64, 'base64');
      if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) {
        try {
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } catch (pdfErr) {
          console.warn('PDF parse fallback:', pdfErr);
          extractedText = buffer.toString('utf-8');
        }
      } else if (
        mimeType?.includes('word') ||
        fileName?.endsWith('.docx') ||
        fileName?.endsWith('.doc')
      ) {
        try {
          const docResult = await mammoth.extractRawText({ buffer });
          extractedText = docResult.value;
        } catch (docErr) {
          console.warn('DOCX parse fallback:', docErr);
          extractedText = buffer.toString('utf-8');
        }
      } else {
        extractedText = buffer.toString('utf-8');
      }
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({
        error: 'Unable to extract sufficient text from the provided file. Please upload a readable PDF/DOCX or paste text directly.',
      });
    }

    const ai = getGeminiClient();

    const prompt = `You are a world-class HR executive and ATS (Applicant Tracking System) expert. Analyze the following resume content thoroughly:

---
${extractedText.slice(0, 10000)}
---

Evaluate the resume across formatting, impact metrics, action verbs, ATS keyword coverage, and professional presentation. Provide a comprehensive structured critique.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Overall resume strength score 0-100' },
            atsScore: { type: Type.INTEGER, description: 'ATS compliance compatibility score 0-100' },
            verdict: {
              type: Type.STRING,
              description: 'One of: Competitive, Needs Improvement, Exceptional, Strong',
            },
            summary: { type: Type.STRING, description: 'Executive summary of resume quality' },
            strengths: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'description'],
              },
            },
            weaknesses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'description'],
              },
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top missing high-value skills and keywords',
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable bullet points for rapid enhancement',
            },
          },
          required: [
            'overallScore',
            'atsScore',
            'verdict',
            'summary',
            'strengths',
            'weaknesses',
            'missingSkills',
            'suggestions',
          ],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || '{}');

    return res.json({
      id: `res-${Date.now()}`,
      fileName: fileName || 'Uploaded_Resume.pdf',
      fileSize: fileBufferBase64 ? `${Math.round(fileBufferBase64.length * 0.75 / 1024)} KB` : 'Text Input',
      analyzedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      rawText: extractedText.slice(0, 1000),
      ...parsedResult,
    });
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze resume with AI. Please try again.',
    });
  }
});

// ----------------------------------------------------
// 2. Career Advisor AI Chat
// ----------------------------------------------------
app.post('/api/advisor/chat', async (req, res) => {
  try {
    const { history, message, userContext } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `You are CareerPilot AI, an elite, empathetic, and highly tactical Career Advisor.
Your goal is to provide tailored professional guidance, interview prep tips, career path pivots, certification suggestions, and step-by-step learning roadmaps.
Always respond in clean Markdown with bold keywords for scannability.
Be encouraging, realistic, actionable, and structured.
User Context: ${JSON.stringify(userContext || {})}`;

    // Format chat history for Gemini
    const formattedContents = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.text) {
          formattedContents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      text: response.text || 'I apologize, but I could not generate a response. Please try rephrasing your question.',
    });
  } catch (error: any) {
    console.error('Error in advisor chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to connect with Career Advisor AI.',
    });
  }
});

// ----------------------------------------------------
// 3. Interview Generator
// ----------------------------------------------------
app.post('/api/interview/generate', async (req, res) => {
  try {
    const { industry, targetRole, interviewType, count = 5 } = req.body;

    const ai = getGeminiClient();

    const prompt = `Generate a realistic mock interview session for a candidate applying for the role of "${targetRole || 'Software Engineer'}" in the "${industry || 'Technology & Software'}" industry.
Interview Type: ${interviewType || 'Technical'}.
Generate ${count} distinct, high-impact interview questions. For each question, provide a sample ideal answer using industry best practices and evaluation criteria.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'Technical or Behavioral' },
                  category: { type: Type.STRING, description: 'e.g. System Design, Conflict Resolution, Algorithmic Thinking' },
                  sampleAnswer: { type: Type.STRING, description: 'Ideal structured response' },
                  evaluationCriteria: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'question', 'type', 'category', 'sampleAnswer', 'evaluationCriteria'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');

    return res.json({
      id: `int-${Date.now()}`,
      industry: industry || 'Technology & Software',
      targetRole: targetRole || 'Software Engineer',
      interviewType: interviewType || 'Technical',
      questionsCount: result.questions?.length || 0,
      createdAt: new Date().toLocaleDateString(),
      questions: result.questions || [],
      completed: false,
    });
  } catch (error: any) {
    console.error('Error generating interview:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate interview session.',
    });
  }
});

// ----------------------------------------------------
// 4. Interview Answer Feedback
// ----------------------------------------------------
app.post('/api/interview/feedback', async (req, res) => {
  try {
    const { question, userAnswer, targetRole } = req.body;

    const ai = getGeminiClient();

    const prompt = `Role: ${targetRole || 'Professional Candidate'}
Question: "${question}"
Candidate Answer: "${userAnswer}"

Evaluate the candidate's answer. Give constructive feedback, highlight key strengths, identify missing points, and score it out of 100.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            overallFeedback: { type: Type.STRING },
          },
          required: ['score', 'strengths', 'improvements', 'overallFeedback'],
        },
      },
    });

    const feedback = JSON.parse(response.text || '{}');
    return res.json(feedback);
  } catch (error: any) {
    console.error('Error evaluating interview answer:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to evaluate answer.',
    });
  }
});

// ----------------------------------------------------
// 5. Skill Gap Analysis
// ----------------------------------------------------
app.post('/api/skillgap/analyze', async (req, res) => {
  try {
    const { currentSkills, targetRole, companyName } = req.body;

    const ai = getGeminiClient();

    const prompt = `Perform a rigorous Skill Gap Analysis for a professional candidate.
Current Skills: "${currentSkills || 'HTML, CSS, JavaScript, Basic React, Git'}"
Target Role: "${targetRole || 'Senior Product Designer @ TechCorp'}"
Company Context: "${companyName || 'TechCorp'}"

Analyze the delta between the candidate's current skills and current industry market demands for this exact role.
Provide:
1. Overall match percentage (0-100%)
2. Radar chart distribution across 6 key competencies (UI Design, UX Research, Prototyping, Stakeholder Management, Strategy, Architecture - rating 0-100 for yourSkill and marketReq)
3. Top missing skills with required level vs candidate level and gap score
4. Step-by-step learning roadmap
5. Recommended hands-on portfolio projects to build
6. Current market trend insight`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchPercentage: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            radarData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  yourSkill: { type: Type.INTEGER },
                  marketReq: { type: Type.INTEGER },
                },
                required: ['skill', 'yourSkill', 'marketReq'],
              },
            },
            missingSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  requiredLevel: { type: Type.STRING },
                  userLevel: { type: Type.STRING },
                  gapScore: { type: Type.INTEGER, description: 'Progress percentage 0-100' },
                  recommendedAction: { type: Type.STRING },
                },
                required: ['name', 'requiredLevel', 'userLevel', 'gapScore', 'recommendedAction'],
              },
            },
            learningRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['phase', 'duration', 'topics'],
              },
            },
            recommendedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'description', 'techStack'],
              },
            },
            marketInsight: { type: Type.STRING },
          },
          required: [
            'matchPercentage',
            'summary',
            'radarData',
            'missingSkills',
            'learningRoadmap',
            'recommendedProjects',
            'marketInsight',
          ],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');

    return res.json({
      targetRole: targetRole || 'Senior Product Designer',
      companyName: companyName || 'TechCorp',
      ...result,
    });
  } catch (error: any) {
    console.error('Error analyzing skill gap:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to perform skill gap analysis.',
    });
  }
});

// Vite middleware for development vs Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerPilot AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
