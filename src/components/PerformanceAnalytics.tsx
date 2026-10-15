import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Calculator,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import { interpretCorrelation, calculateStudentMetrics } from '../utils/analytics';
import { AttendanceScatterPlot } from './charts/AttendanceScatterPlot';
import { SubjectBarChart } from './charts/SubjectBarChart';
import { DistributionHistogram } from './charts/DistributionHistogram';
import { Student } from '../types';

interface PerformanceAnalyticsProps {
  onSelectStudent: (student: Student) => void;
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  onSelectStudent,
}) => {
  const { students, allStudents, classAnalytics, settings } = useStudentContext();
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  const correlationInterpretation = interpretCorrelation(
    classAnalytics.attendancePerformanceCorrelation
  );

  // Student metrics for delta highlights
  const studentsWithMetrics = students.map((s) => ({
    student: s,
    metrics: calculateStudentMetrics(s, settings),
  }));

  const mostImproved = [...studentsWithMetrics]
    .sort((a, b) => b.metrics.examDelta - a.metrics.examDelta)
    .filter((s) => s.metrics.examDelta > 0)
    .slice(0, 5);

  const steepestDeclines = [...studentsWithMetrics]
    .sort((a, b) => a.metrics.examDelta - b.metrics.examDelta)
    .filter((s) => s.metrics.examDelta < 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Academic Performance & Statistical Analysis</h2>
          <p className="text-xs text-slate-400">
            Cohort mathematical metrics, variance distributions, correlation indices, and trajectory analysis.
          </p>
        </div>
        <button
          onClick={() => setShowFormulaModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/50 transition-colors shrink-0"
        >
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>Formula & Weighting Methodology</span>
        </button>
      </div>

      {/* Primary Mathematical KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cohort Mean (μ)</p>
          <p className="text-2xl font-black text-cyan-400 font-mono mt-1">
            {classAnalytics.classAverage}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Unweighted score mean</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cohort Median</p>
          <p className="text-2xl font-black text-white font-mono mt-1">
            {classAnalytics.medianScore}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">50th percentile center</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Std Deviation (σ)</p>
          <p className="text-2xl font-black text-indigo-400 font-mono mt-1">
            ±{classAnalytics.standardDeviation}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Variance spread index</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Highest Mark</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {classAnalytics.highestScore.score}%
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-1">
            {classAnalytics.highestScore.studentName}
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lowest Mark</p>
          <p className="text-2xl font-black text-rose-400 font-mono mt-1">
            {classAnalytics.lowestScore.score}%
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-1">
            {classAnalytics.lowestScore.studentName}
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Study Time</p>
          <p className="text-2xl font-black text-teal-400 font-mono mt-1">
            {classAnalytics.averageStudyHours}h
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Hours / day average</p>
        </div>
      </div>

      {/* Pearson Correlation Deep-Dive Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Correlation: Class Attendance vs. Academic Scores
              </h3>
              <p className="text-xs text-slate-400">
                Pearson product-moment correlation coefficient calculation ($r$)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 shrink-0">
            <span className="text-xs text-slate-400 font-medium">Pearson Correlation:</span>
            <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-base font-bold">
              r = {classAnalytics.attendancePerformanceCorrelation > 0 ? `+${classAnalytics.attendancePerformanceCorrelation}` : classAnalytics.attendancePerformanceCorrelation}
            </span>
          </div>
        </div>

        {/* Statistical Plain-English Interpretation */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <p className="text-sm font-semibold text-slate-200">
            {correlationInterpretation.interpretation}
          </p>
          <div className="flex items-start gap-2 text-xs text-amber-300/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Non-Causation Notice:</strong> {correlationInterpretation.educationalDisclaimer}
            </p>
          </div>
        </div>

        <AttendanceScatterPlot
          students={students}
          settings={settings}
          correlation={classAnalytics.attendancePerformanceCorrelation}
          onSelectStudent={onSelectStudent}
        />
      </div>

      {/* Subject-Wise Comparative Difficulty Matrix */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Subject-Wise Performance & Pass Rates</h3>
          <p className="text-xs text-slate-400">
            Individual subject statistics: Mean, Median, Standard Deviation, and Passing Rate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classAnalytics.subjectAverages.map((sub, i) => (
            <div
              key={sub.subject}
              className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{sub.subject}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{sub.code}</span>
                </div>
                <span className="text-lg font-black font-mono text-cyan-400">
                  {sub.average}%
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Median Score:</span>
                  <span className="font-mono text-white">{sub.median}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Standard Deviation:</span>
                  <span className="font-mono text-slate-300">±{sub.stdDev}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Passing Rate (≥{settings.lowScoreThreshold}%):</span>
                  <span className="font-mono text-emerald-400 font-semibold">{sub.passingRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Range (Low / High):</span>
                  <span className="font-mono text-white">{sub.lowest}% &mdash; {sub.highest}%</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{ width: `${sub.passingRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Examination Trajectory: Top Improvements vs Steepest Drops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Improved */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Top Examination Gains</h3>
            </div>
            <span className="text-xs text-emerald-400 font-semibold font-mono">
              {classAnalytics.examComparison.improvedCount} Students Improved
            </span>
          </div>

          <div className="space-y-2">
            {mostImproved.map(({ student, metrics }) => (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="p-3 bg-slate-950/60 hover:bg-slate-800/80 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <p className="font-semibold text-xs text-white">{student.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Previous: {student.previousExamScore}% &rarr; Current: {metrics.averageMarks}%
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/20 text-emerald-300">
                  +{metrics.examDelta}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Steepest Declines */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-sm text-white">Score Declines Needing Review</h3>
            </div>
            <span className="text-xs text-rose-400 font-semibold font-mono">
              {classAnalytics.examComparison.declinedCount} Students Declined
            </span>
          </div>

          <div className="space-y-2">
            {steepestDeclines.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No student experienced a score drop.</p>
            ) : (
              steepestDeclines.map(({ student, metrics }) => (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="p-3 bg-slate-950/60 hover:bg-slate-800/80 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div>
                    <p className="font-semibold text-xs text-white">{student.name}</p>
                    <p className="text-[10px] text-slate-400">
                      Previous: {student.previousExamScore}% &rarr; Current: {metrics.averageMarks}%
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-500/20 text-rose-300">
                    {metrics.examDelta}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Formula & Methodology Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                Scoring Formula & Statistical Methodology
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-cyan-300">1. Overall Student Percentage Formula:</p>
                <p className="font-mono text-white bg-slate-900 p-2 rounded">
                  Score % = ((Math / MaxScore) + (Physics / MaxScore) + (CS / MaxScore)) / 3 &times; 100
                </p>
                <p className="text-slate-400 text-[11px]">
                  Each subject is equally weighted. Missing subjects are excluded rather than scored as zero.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-cyan-300">2. Pearson Correlation Coefficient (r):</p>
                <p className="font-mono text-white bg-slate-900 p-2 rounded">
                  r = &Sigma;((x - &mu;x)(y - &mu;y)) / &radic;(&Sigma;(x - &mu;x)&sup2; &Sigma;(y - &mu;y)&sup2;)
                </p>
                <p className="text-slate-400 text-[11px]">
                  Evaluates linear association between attendance (x) and academic percentage (y).
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-cyan-300">3. Standard Deviation (Sample Spread):</p>
                <p className="font-mono text-white bg-slate-900 p-2 rounded">
                  &sigma; = &radic;(&Sigma;(xi - &mu;)&sup2; / N)
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
