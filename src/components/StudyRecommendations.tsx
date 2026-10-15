import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle,
  Eye,
  Check,
  XCircle,
  Filter,
  Info,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import { Student, FlagStatus, FlagType } from '../types';
import { calculateStudentMetrics } from '../utils/analytics';

interface StudyRecommendationsProps {
  onSelectStudent: (student: Student) => void;
}

export const StudyRecommendations: React.FC<StudyRecommendationsProps> = ({
  onSelectStudent,
}) => {
  const {
    students,
    settings,
    flagOverrides,
    updateFlagStatus,
  } = useStudentContext();

  const [activeFilter, setActiveFilter] = useState<'ALL' | FlagType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | FlagStatus>('ALL');

  // Collect all flagged students and their flags
  const flaggedStudentList = students
    .map((student) => {
      const metrics = calculateStudentMetrics(student, settings);
      const flagsWithOverrides = metrics.supportFlags.map((flag) => {
        const override = flagOverrides[flag.id];
        return {
          ...flag,
          status: override ? override.status : flag.status,
          reviewNote: override ? override.reviewNote : undefined,
        };
      });

      return {
        student,
        metrics,
        flags: flagsWithOverrides,
      };
    })
    .filter((item) => item.flags.length > 0);

  // Filtered by flag type or status
  const filteredList = flaggedStudentList
    .map((item) => ({
      ...item,
      flags: item.flags.filter((f) => {
        if (activeFilter !== 'ALL' && f.type !== activeFilter) return false;
        if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
        return true;
      }),
    }))
    .filter((item) => item.flags.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Student Support & Study Recommendations</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Transparent, rule-based screening to assist teacher judgment with targeted learning interventions and study plans.
        </p>
      </div>

      {/* Ethical Educational Philosophy Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-bold text-white">
            Ethical Educational Screening Constitution
          </p>
          <p className="text-slate-300 leading-relaxed">
            These screening indicators are <strong>configurable heuristics</strong>, not universal educational standards or automated diagnostic decisions. They are designed to highlight students who may benefit from proactive advisory conversations, prerequisite scaffolding, or attendance check-ins. Teachers retain complete discretion to mark flags as reviewed or dismissed.
          </p>
          <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-cyan-300">
            <span>&bull; Academic Threshold: &lt; {settings.lowScoreThreshold}%</span>
            <span>&bull; Attendance Threshold: &lt; {settings.lowAttendanceThreshold}%</span>
            <span>&bull; Exam Drop Alert: &ge; {settings.examDropThreshold}%</span>
            <span>&bull; Study Time Target: &ge; {settings.lowStudyHoursThreshold} hrs/d</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
        {/* Type filters */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === 'ALL'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Indicators ({flaggedStudentList.length})
          </button>
          <button
            onClick={() => setActiveFilter('low_grade')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === 'low_grade'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Academic Score (&lt; {settings.lowScoreThreshold}%)
          </button>
          <button
            onClick={() => setActiveFilter('low_attendance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === 'low_attendance'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Attendance Deficit (&lt; {settings.lowAttendanceThreshold}%)
          </button>
          <button
            onClick={() => setActiveFilter('exam_drop')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFilter === 'exam_drop'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Examination Drop (&ge; {settings.examDropThreshold}%)
          </button>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Review Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active (Pending Review)</option>
            <option value="in_review">In Review</option>
            <option value="dismissed">Dismissed / Resolved</option>
          </select>
        </div>
      </div>

      {/* Flagged Students Queue */}
      {filteredList.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Flagged Students for Selected Filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All students in this cohort currently meet the active threshold rules or flags have been resolved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map(({ student, metrics, flags }) => (
            <div
              key={student.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4 hover:border-slate-700 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold font-mono text-cyan-300 text-sm">
                    {student.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{student.name}</h3>
                      <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                        {student.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {student.classSemester} &bull; Score: <strong className="text-white font-mono">{metrics.averageMarks}%</strong> &bull; Attendance: <strong className="text-white font-mono">{student.attendance}%</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Full Profile & Timetable
                  </button>
                </div>
              </div>

              {/* Flags List for this student */}
              <div className="space-y-2.5">
                {flags.map((flag) => {
                  let badgeBg = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
                  if (flag.severity === 'critical') {
                    badgeBg = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
                  }

                  return (
                    <div
                      key={flag.id}
                      className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeBg}`}>
                            {flag.title}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              flag.status === 'dismissed'
                                ? 'bg-slate-800 text-slate-400'
                                : flag.status === 'in_review'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            Status: {flag.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{flag.reason}</p>
                      </div>

                      {/* Status Toggle Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 text-xs">
                        {flag.status !== 'in_review' && (
                          <button
                            onClick={() => updateFlagStatus(flag.id, 'in_review')}
                            className="px-2.5 py-1 rounded bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/40 text-blue-300 font-medium transition-colors"
                          >
                            Mark In Review
                          </button>
                        )}
                        {flag.status !== 'dismissed' ? (
                          <button
                            onClick={() => updateFlagStatus(flag.id, 'dismissed', 'Reviewed by instructor')}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                          >
                            Dismiss Flag
                          </button>
                        ) : (
                          <button
                            onClick={() => updateFlagStatus(flag.id, 'active')}
                            className="px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/40 text-amber-300 font-medium transition-colors"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Practical Teacher Remediation Recommendations */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  Recommended Scaffolding Interventions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <p className="font-semibold text-white mb-0.5">1. Target Weaker Topic</p>
                    <p className="text-[11px] text-slate-400">
                      Provide targeted practice exercises in {metrics.lowestSubject.name} ({metrics.lowestSubject.score}%).
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <p className="font-semibold text-white mb-0.5">2. Habit & Study Pacing</p>
                    <p className="text-[11px] text-slate-400">
                      Target {Math.max(2.5, student.dailyStudyHours + 1.0)} hrs/day structured with 25-minute Pomodoro sessions.
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <p className="font-semibold text-white mb-0.5">3. 1-on-1 Advisory</p>
                    <p className="text-[11px] text-slate-400">
                      Schedule a 15-minute instructor check-in to review test solutions and clear conceptual doubts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
