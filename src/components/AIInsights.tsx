import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Target,
  ArrowRight,
  TrendingDown,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';

export const AIInsights: React.FC = () => {
  const {
    students,
    classAnalytics,
    aiInsights,
    isGeneratingAI,
    aiNotice,
    fetchAIInsights,
  } = useStudentContext();

  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const presetQueries = [
    'Comprehensive Cohort Diagnostic',
    'Root Cause Analysis of Struggling Subjects',
    'Classroom Interventions for Borderline Students',
    'Attendance Decay vs Examination Score Drop',
  ];

  const handleRunInsight = async (prompt?: string) => {
    await fetchAIInsights(prompt || customPrompt);
  };

  const handleCopy = () => {
    if (!aiInsights) return;
    const textToCopy = `Academic Performance AI Diagnostic Report
Executive Summary:
${aiInsights.executiveSummary}

Struggling Subjects:
${aiInsights.strugglingSubjects.map((s) => `- ${s.subject}: ${s.issue} (Affecting ~${s.affectedPercentage}%)`).join('\n')}

Trajectory & Exam Trends:
${aiInsights.trendExplanation}

Classroom Interventions:
${aiInsights.classroomInterventions.map((c) => `- ${c.title} (Target: ${c.targetGroup}): ${c.actionSteps.join(', ')}`).join('\n')}

Pedagogical Recommendations:
${aiInsights.pedagogicalRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">AI-Powered Academic Insights</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured educational data analysis, pedagogical explanations, and classroom remediation strategies.
          </p>
        </div>

        {aiInsights && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Report' : 'Copy Synthesis'}
            </button>
            <button
              onClick={() => handleRunInsight()}
              disabled={isGeneratingAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>
          </div>
        )}
      </div>

      {/* Query Bar & Presets */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Select or Customise Diagnostic Focus
        </label>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {presetQueries.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setCustomPrompt(preset);
                handleRunInsight(preset);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-cyan-950/40 hover:text-cyan-300 border border-slate-700/60 transition-all text-slate-300"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunInsight()}
            placeholder="Ask a specific pedagogical question (e.g., 'What strategies can help students failing Physics with good attendance?')..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleRunInsight()}
            disabled={isGeneratingAI || students.length === 0}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/40 shrink-0"
          >
            {isGeneratingAI ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Insights
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Notice Banner (if fallback heuristic was used) */}
      {aiNotice && (
        <div className="p-3.5 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isGeneratingAI && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Synthesizing Cohort Performance Insights</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Gemini is evaluating subject distributions, attendance coefficients, and previous exam trajectories to formulate actionable recommendations...
            </p>
          </div>
        </div>
      )}

      {/* Display Results */}
      {!isGeneratingAI && aiInsights && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-blue-950/40 border border-slate-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>Executive Cohort Diagnostic</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {aiInsights.executiveSummary}
            </p>
          </div>

          {/* Struggling Subjects & Root Cause */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <TrendingDown className="w-4 h-4" />
              <span>Subject Struggle Analysis & Curriculum Bottlenecks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.strugglingSubjects.map((item, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{item.subject}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 font-mono">
                      ~{item.affectedPercentage}% Affected
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{item.issue}</p>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 text-[11px] text-slate-400">
                    <strong className="text-slate-300">Root Cause:</strong> {item.rootCauseAnalysis}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Explanation */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Examination Trajectory & Cohort Momentum</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {aiInsights.trendExplanation}
            </p>
          </div>

          {/* Targeted Classroom Interventions */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Actionable Classroom Teaching Interventions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.classroomInterventions.map((intervention, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{intervention.title}</h4>
                    <p className="text-[11px] text-cyan-400 font-medium mt-0.5">
                      Target Group: {intervention.targetGroup}
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {intervention.actionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Pedagogical Recommendations */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>High-Level Curriculum & Teaching Best Practices</span>
            </div>
            <div className="space-y-2">
              {aiInsights.pedagogicalRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 flex items-start gap-3 text-xs text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initial Empty State before running */}
      {!isGeneratingAI && !aiInsights && (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Diagnostic Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click &ldquo;Generate Insights&rdquo; or pick one of the presets above to synthesize a complete educational review with Gemini.
            </p>
          </div>
          <button
            onClick={() => handleRunInsight('Comprehensive Cohort Diagnostic')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-950/40"
          >
            <Sparkles className="w-4 h-4" /> Run Comprehensive Diagnostic
          </button>
        </div>
      )}
    </div>
  );
};
