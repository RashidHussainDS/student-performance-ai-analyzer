import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// Initialize Google GenAI client (server-side only)
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!(ai && apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: AI Insights for Class Academic Performance
app.post('/api/gemini/insights', async (req: Request, res: Response) => {
  try {
    const { analyticsSummary, subjects, sampleStudentsSummary, customPrompt } = req.body;

    if (!analyticsSummary) {
      return res.status(400).json({ error: 'Missing analyticsSummary data.' });
    }

    if (!ai) {
      // Intelligent heuristic educational fallback if GEMINI_API_KEY is not configured
      const fallbackInsights = generateHeuristicClassInsights(analyticsSummary, subjects);
      return res.json({
        source: 'heuristic',
        insights: fallbackInsights,
        notice: 'Generated using local analytical heuristics (Gemini API key not configured in environment).',
      });
    }

    const systemPrompt = `You are a Senior Academic Analytics Consultant and Educational Data Scientist.
Analyze the provided student academic performance metrics for a university/college cohort.
Provide a rigorous, actionable, objective, and empathetic educational diagnostic.
Adhere strictly to educational principles:
1. Avoid stigmatizing labels; emphasize growth mindset, scaffolded learning, and targeted interventions.
2. Note that correlation between attendance and scores does not prove direct causation.
3. Base all conclusions strictly on the supplied metrics without fabricating student facts or records.

Return your response in valid JSON matching this schema:
{
  "executiveSummary": "A concise 3-4 sentence overview of the cohort's performance, attendance, and notable trends.",
  "strugglingSubjects": [
    {
      "subject": "Subject Name",
      "issue": "Specific challenge identified from scores",
      "affectedPercentage": 25,
      "rootCauseAnalysis": "Potential pedagogical or curriculum bottleneck explanation"
    }
  ],
  "trendExplanation": "Insight regarding student trajectory compared to previous examinations.",
  "classroomInterventions": [
    {
      "title": "Intervention Name",
      "targetGroup": "e.g., Students below 50% in Physics or with low attendance",
      "actionSteps": ["Action step 1", "Action step 2"]
    }
  ],
  "pedagogicalRecommendations": [
    "High-level curriculum recommendation 1",
    "High-level curriculum recommendation 2",
    "High-level curriculum recommendation 3"
  ]
}`;

    const userMessage = `Cohort Analytics Data:
- Total Students: ${analyticsSummary.totalStudents}
- Overall Class Average: ${analyticsSummary.classAverage}%
- Median Score: ${analyticsSummary.medianScore}%
- Standard Deviation: ${analyticsSummary.standardDeviation}%
- Average Attendance: ${analyticsSummary.averageAttendance}%
- Attendance-Performance Pearson Correlation (r): ${analyticsSummary.attendancePerformanceCorrelation}
- Students Flagged for Support: ${analyticsSummary.studentsNeedingSupportCount}
- Subject Breakdown: ${JSON.stringify(subjects)}
- Previous Exam Comparison: Previous Avg ${analyticsSummary.examComparison?.previousAvg}%, Current Avg ${analyticsSummary.examComparison?.currentAvg}%, Improved: ${analyticsSummary.examComparison?.improvedCount}, Declined: ${analyticsSummary.examComparison?.declinedCount}
- Representative Student Summary: ${JSON.stringify(sampleStudentsSummary || [])}

${customPrompt ? `Educator's specific query / focus area: "${customPrompt}"` : ''}

Please analyze this data and generate the structured JSON report.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean possible markdown fences
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({
      source: 'gemini',
      insights: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini Insights Error:', error);
    // Provide graceful educational heuristic fallback on API rate limit or error
    const { analyticsSummary, subjects } = req.body;
    const fallback = generateHeuristicClassInsights(analyticsSummary || {}, subjects || []);
    return res.json({
      source: 'heuristic_fallback',
      insights: fallback,
      errorNotice: error?.message || 'Gemini API call timed out or failed. Displaying local analytical synthesis.',
    });
  }
});

// Endpoint: AI Personalized Study Plan for Individual Student
app.post('/api/gemini/student-plan', async (req: Request, res: Response) => {
  try {
    const { student, classAverage, subjectAverages } = req.body;
    if (!student) {
      return res.status(400).json({ error: 'Missing student data' });
    }

    if (!ai) {
      const fallbackPlan = generateHeuristicStudentPlan(student, classAverage);
      return res.json({
        source: 'heuristic',
        plan: fallbackPlan,
      });
    }

    const systemPrompt = `You are a supportive academic advisor and learning coach.
Create a personalized, constructive study recommendation plan for a student based on their subject scores, attendance, and study hours.
Be practical, encouraging, and focused on actionable study strategies.

Return JSON in this format:
{
  "summary": "2-3 sentences evaluating the student's current academic standing and potential.",
  "strengths": ["Key strength 1", "Key strength 2"],
  "areasForImprovement": ["Key area 1", "Key area 2"],
  "weeklyStudyTimetable": [
    { "day": "Monday", "focus": "Subject/Topic", "durationHours": 2, "activity": "Activity description" },
    { "day": "Tuesday", "focus": "Subject/Topic", "durationHours": 1.5, "activity": "Activity description" },
    { "day": "Wednesday", "focus": "Subject/Topic", "durationHours": 2, "activity": "Activity description" },
    { "day": "Thursday", "focus": "Subject/Topic", "durationHours": 1.5, "activity": "Activity description" },
    { "day": "Friday", "focus": "Subject/Topic", "durationHours": 2, "activity": "Activity description" },
    { "day": "Saturday", "focus": "Subject/Topic", "durationHours": 2.5, "activity": "Review & Practice tests" }
  ],
  "actionableTips": [
    "Tip 1 with concrete methodology",
    "Tip 2 with concrete methodology",
    "Tip 3 with concrete methodology"
  ]
}`;

    const userPrompt = `Student Profile:
- ID: ${student.id}
- Class/Semester: ${student.classSemester}
- Mathematics: ${student.mathMarks}/100
- Physics: ${student.physicsMarks}/100
- Computer Science: ${student.csMarks}/100
- Attendance: ${student.attendance}%
- Daily Study Hours: ${student.dailyStudyHours} hrs/day
- Previous Exam Score: ${student.previousExamScore}%
- Class Average Benchmark: ${classAverage}%
- Subject Averages: ${JSON.stringify(subjectAverages || {})}

Generate a targeted, motivating study plan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({
      source: 'gemini',
      plan: parsed,
    });
  } catch (error: any) {
    console.error('Gemini Student Plan Error:', error);
    const { student, classAverage } = req.body;
    return res.json({
      source: 'heuristic_fallback',
      plan: generateHeuristicStudentPlan(student, classAverage),
      errorNotice: error?.message || 'Generated via local rules due to API unavailability.',
    });
  }
});

// Local Heuristic Fallback Generators
function generateHeuristicClassInsights(analytics: any, subjects: any[]) {
  const avg = analytics.classAverage || 72;
  const attendance = analytics.averageAttendance || 80;
  const lowAttendance = attendance < 75;

  const struggling = (subjects || [])
    .filter((s: any) => s.average < 70)
    .map((s: any) => ({
      subject: s.subject,
      issue: `Cohort average of ${s.average.toFixed(1)}% is below the 70% proficiency target.`,
      affectedPercentage: Math.round(((100 - s.average) / 100) * 45),
      rootCauseAnalysis: `Concept difficulty in foundational problem-solving and insufficient hands-on laboratory application.`,
    }));

  return {
    executiveSummary: `The class exhibits an overall mean score of ${avg.toFixed(1)}% with an average attendance of ${attendance.toFixed(1)}%. While top students maintain high performance in core topics, approximately ${(analytics.studentsNeedingSupportCount || 3)} students fall below support thresholds, requiring targeted academic scaffolding.`,
    strugglingSubjects: struggling.length > 0 ? struggling : [
      {
        subject: 'Physics',
        issue: 'Variance in analytical calculations and formula derivations.',
        affectedPercentage: 28,
        rootCauseAnalysis: 'Prerequisite gaps in applied calculus and vector mechanics.',
      },
    ],
    trendExplanation: `Comparing previous examination scores to current evaluations shows ${analytics.examComparison?.improvedCount || 14} students demonstrating upward mastery, while ${analytics.examComparison?.declinedCount || 6} students experienced score drops requiring follow-up.`,
    classroomInterventions: [
      {
        title: 'Weekly Problem-Solving Recitation Clinics',
        targetGroup: 'Students scoring below 60% in quantitative subjects',
        actionSteps: [
          'Host 45-minute guided step-by-step problem deconstruction sessions.',
          'Pair peer study buddies for collaborative lab exercises.',
        ],
      },
      {
        title: 'Attendance & Engagement Recovery System',
        targetGroup: lowAttendance ? 'All students with attendance under 75%' : 'At-risk attendance cluster',
        actionSteps: [
          'Provide interactive lecture summaries and digital concept checkpoints.',
          'Schedule bi-weekly advisory check-ins with course instructors.',
        ],
      },
    ],
    pedagogicalRecommendations: [
      'Incorporate low-stakes formative quizzes every two weeks to identify knowledge decay early.',
      'Blend theoretical derivations with interactive simulations to bridge abstract models with applied concepts.',
      'Establish office hours specifically dedicated to prerequisite review before midterm modules.',
    ],
  };
}

function generateHeuristicStudentPlan(student: any, classAvg: number = 72) {
  const scores = [
    { name: 'Mathematics', score: student?.mathMarks ?? 0 },
    { name: 'Physics', score: student?.physicsMarks ?? 0 },
    { name: 'Computer Science', score: student?.csMarks ?? 0 },
  ];
  scores.sort((a, b) => a.score - b.score);
  const weakest = scores[0];
  const strongest = scores[scores.length - 1];

  return {
    summary: `${student?.name || 'The student'} demonstrates strong capability in ${strongest.name} (${strongest.score}%), with key improvement potential in ${weakest.name} (${weakest.score}%). With structured revision and steady daily habits, overall mastery will improve significantly.`,
    strengths: [
      `High conceptual grasp and problem mastery in ${strongest.name}.`,
      student?.attendance >= 80 ? 'Reliable lecture attendance and classroom presence.' : 'Self-directed study initiative during examination prep.',
    ],
    areasForImprovement: [
      `Dedicated practice drills in ${weakest.name} to reinforce core theoretical foundations.`,
      student?.dailyStudyHours < 2 ? 'Increase structured daily study time to at least 2.5 hours.' : 'Improve active recall and spaced repetition efficiency.',
    ],
    weeklyStudyTimetable: [
      { day: 'Monday', focus: `${weakest.name} Fundamentals`, durationHours: 2, activity: 'Core concept review and 5 foundational textbook problems.' },
      { day: 'Tuesday', focus: `${scores[1].name} Application`, durationHours: 1.5, activity: 'Lecture notes synthesis and formula reference sheet creation.' },
      { day: 'Wednesday', focus: `${strongest.name} Advanced`, durationHours: 2, activity: 'Complex problem sets and coding/lab simulation.' },
      { day: 'Thursday', focus: `${weakest.name} Problem Sets`, durationHours: 2, activity: 'Timed practice questions and error log analysis.' },
      { day: 'Friday', focus: 'Integrated Review & Q&A', durationHours: 1.5, activity: 'Identify questions for teacher office hours.' },
      { day: 'Saturday', focus: 'Self-Assessment & Mock Exam', durationHours: 2.5, activity: 'One hour timed quiz followed by thorough review.' },
    ],
    actionableTips: [
      `Focus the first 45 minutes of each study session on ${weakest.name} before fatigue sets in.`,
      'Maintain an active Error Log notebook: document every missed test problem, why the error occurred, and the correct approach.',
      'Utilize 25-minute Pomodoro study intervals with 5-minute active breaks to maximize cognitive retention.',
    ],
  };
}

// Full-Stack Server Launch
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');
  const indexHtml = path.resolve(distDir, 'index.html');

  if (!isProduction) {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite middleware initialization notice:', err);
      if (fs.existsSync(indexHtml)) {
        app.use(express.static(distDir));
        app.get('*', (_req: Request, res: Response) => {
          res.sendFile(indexHtml);
        });
      }
    }
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(indexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} [${isProduction ? 'production' : 'development'}]`);
  });
}

startServer();
