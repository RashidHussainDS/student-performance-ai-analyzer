import React from 'react';
import {
  Users,
  Award,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import { SubjectBarChart } from './charts/SubjectBarChart';
import { DistributionHistogram } from './charts/DistributionHistogram';
import { AttendanceScatterPlot } from './charts/AttendanceScatterPlot';
import { ExamTrendChart } from './charts/ExamTrendChart';
import { calculateStudentMetrics } from '../utils/analytics';
import { Student } from '../types';

interface DashboardProps {
  onNavigateTab: (tab: any) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onSelectStudent: (student: Student) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onOpenAddModal,
  onOpenImportModal,
  onSelectStudent,
}) => {
  const {
    students,
    classAnalytics,
    settings,
    isDemonstrationData,
    restoreSampleData,
    selectedClassFilter,
  } = useStudentContext();

  const metricsList = students.map((s) => ({
    student: s,
    metrics: calculateStudentMetrics(s, settings),
  }));

  // Top 4 High Achievers
  const topAchievers = [...metricsList]
    .sort((a, b) => b.metrics.averageMarks - a.metrics.averageMarks)
    .slice(0, 4);

  // Top 4 At-Risk or Flagged Students
  const atRiskStudents = [...metricsList]
    .filter(
      (m) =>
        m.metrics.supportFlags.length > 0 ||
        m.metrics.performanceCategory === 'needs_support'
    )
    .sort(
      (a, b) =>
        b.metrics.supportFlags.length - a.metrics.supportFlags.length ||
        a.metrics.averageMarks - b.metrics.averageMarks
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Demonstration Data Banner */}
      {isDemonstrationData && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-cyan-950/60 border border-cyan-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Active Demonstration Dataset Loaded (24 Records)
              </p>
              <p className="text-xs text-slate-400">
                All metrics and charts dynamically reflect this cohort. You can modify records, import your own CSV, or restore default values anytime.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={restoreSampleData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Dataset
            </button>
            <button
              onClick={onOpenImportModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-sm"
            >
              Upload Real CSV
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {classAnalytics.totalStudents}
            </span>
            <span className="text-xs text-slate-400">active in cohort</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            {selectedClassFilter === 'ALL' ? 'Across all sections' : selectedClassFilter}
          </p>
        </div>

        {/* Class Average */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Class Average</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {classAnalytics.classAverage}%
            </span>
            <span
              className={`text-xs font-semibold font-mono ${
                classAnalytics.examComparison.overallDelta >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {classAnalytics.examComparison.overallDelta >= 0
                ? `+${classAnalytics.examComparison.overallDelta}%`
                : `${classAnalytics.examComparison.overallDelta}%`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Median: {classAnalytics.medianScore}% &bull; SD: ±{classAnalytics.standardDeviation}%
          </p>
        </div>

        {/* Attendance Rate */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {classAnalytics.averageAttendance}%
            </span>
            <span className="text-xs text-slate-400">cohort avg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Target Benchmark: {settings.lowAttendanceThreshold}%
          </p>
        </div>

        {/* Students Needing Support */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Needs Support</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {classAnalytics.studentsNeedingSupportCount}
            </span>
            <span className="text-xs text-slate-400">
              ({classAnalytics.totalStudents > 0
                ? Math.round(
                    (classAnalytics.studentsNeedingSupportCount /
                      classAnalytics.totalStudents) *
                      100
                  )
                : 0}
              %)
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('recommendations')}
            className="text-[11px] text-amber-400 hover:underline mt-2 flex items-center gap-1"
          >
            Review Flagged Students <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Highest Score */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Highest Score</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-400 font-mono">
              {classAnalytics.highestScore.score}%
            </span>
            <span className="text-xs text-slate-400">Grade A+</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 truncate font-medium">
            {classAnalytics.highestScore.studentName}
          </p>
        </div>

        {/* Lowest Score */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lowest Score</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {classAnalytics.lowestScore.score}%
            </span>
            <span className="text-xs text-rose-400/80">Support Flagged</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 truncate font-medium">
            {classAnalytics.lowestScore.studentName}
          </p>
        </div>
      </div>

      {/* Main Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Average Marks by Subject */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white">Average Marks by Subject</h3>
              <p className="text-xs text-slate-400">
                Mathematics, Physics, and Computer Science comparisons against class average.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Details <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <SubjectBarChart
            subjects={classAnalytics.subjectAverages}
            classAverage={classAnalytics.classAverage}
          />
        </div>

        {/* Chart 2: Grade Distribution Histogram */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white">Student Performance Distribution</h3>
              <p className="text-xs text-slate-400">
                Grade bracket distribution across A+, A, B, C, D, and F.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Details <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <DistributionHistogram
            distribution={classAnalytics.gradeDistribution}
            totalStudents={classAnalytics.totalStudents}
          />
        </div>

        {/* Chart 3: Attendance vs Academic Performance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white">Attendance vs. Academic Scores</h3>
              <p className="text-xs text-slate-400">
                Individual student correlation scatter plot with linear regression trend.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Correlation Details <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <AttendanceScatterPlot
            students={students}
            settings={settings}
            correlation={classAnalytics.attendancePerformanceCorrelation}
            onSelectStudent={onSelectStudent}
          />
        </div>

        {/* Chart 4: Performance Trends across Examinations */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white">Examination Trajectory Comparison</h3>
              <p className="text-xs text-slate-400">
                Comparison of previous evaluation scores against current evaluation by cohort.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Report View <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <ExamTrendChart students={students} settings={settings} />
        </div>
      </div>

      {/* Cohort Highlights & Support Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk / Priority Action Panel */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Student Support Queue</h3>
                <p className="text-xs text-slate-400">
                  Students meeting rule-based academic support thresholds
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('recommendations')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All ({classAnalytics.studentsNeedingSupportCount}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {atRiskStudents.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
              All students currently satisfy the minimum threshold criteria.
            </div>
          ) : (
            <div className="space-y-2.5">
              {atRiskStudents.map(({ student, metrics }) => (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">{student.name}</span>
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                        {student.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {metrics.supportFlags[0]?.title || 'Academic Support Recommended'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-rose-400">
                      {metrics.averageMarks}%
                    </span>
                    <p className="text-[10px] text-slate-400">Att: {student.attendance}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performers Panel */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Top Cohort Achievers</h3>
                <p className="text-xs text-slate-400">
                  Exemplary performance across quantitative and technical subjects
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Full Roster <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topAchievers.map(({ student, metrics }, idx) => (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs">{student.name}</p>
                    <p className="text-[11px] text-slate-400">{student.classSemester}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-teal-400">
                    {metrics.averageMarks}%
                  </span>
                  <p className="text-[10px] text-emerald-400">
                    {metrics.examDelta >= 0 ? `+${metrics.examDelta}% delta` : `${metrics.examDelta}%`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Diagnostic Quick Prompt Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-cyan-900/40 border border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              AI-Powered Pedagogical Diagnostics
            </h4>
            <p className="text-xs text-slate-300">
              Generate full executive summaries, root cause struggle analyses, and targeted classroom teaching interventions using Gemini 3.8.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('insights')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-md shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Open AI Insights
        </button>
      </div>
    </div>
  );
};
