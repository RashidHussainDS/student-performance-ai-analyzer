import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Edit,
  GraduationCap,
} from 'lucide-react';
import { Student, AppSettings, ClassAnalytics, StudentStudyPlan } from '../types';
import { calculateStudentMetrics } from '../utils/analytics';
import { StudentRadarChart } from './charts/StudentRadarChart';

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  settings: AppSettings;
  classAnalytics: ClassAnalytics;
  onFetchPlan: (student: Student) => Promise<StudentStudyPlan>;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
  settings,
  classAnalytics,
  onFetchPlan,
}) => {
  const [studyPlan, setStudyPlan] = useState<StudentStudyPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);

  useEffect(() => {
    if (student && isOpen) {
      setLoadingPlan(true);
      onFetchPlan(student)
        .then((plan) => setStudyPlan(plan))
        .catch(() => setStudyPlan(null))
        .finally(() => setLoadingPlan(false));
    }
  }, [student?.id, isOpen]);

  if (!isOpen || !student) return null;

  const metrics = calculateStudentMetrics(student, settings);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 text-slate-100">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-mono text-xs font-semibold">
              {student.id}
            </span>
            <span className="text-xs text-slate-400">Individual Student Academic Profile</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(student)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Record
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Print Report Card
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Container */}
        <div className="p-6 sm:p-8 space-y-6 print:p-8 print:bg-white print:text-slate-900">
          {/* Institutional Print Header */}
          <div className="border-b border-slate-800 print:border-slate-300 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg print:border print:border-slate-400">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white print:text-slate-900">
                    {settings.institutionName}
                  </h1>
                  <p className="text-xs sm:text-sm text-cyan-400 print:text-cyan-800 font-medium">
                    {settings.departmentName} &bull; {settings.academicYear}
                  </p>
                  <p className="text-xs text-slate-400 print:text-slate-500 mt-0.5">
                    Official Student Performance & Diagnostic Assessment
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600">
                <p>
                  Evaluation: <strong className="text-white print:text-slate-900">{settings.examName}</strong>
                </p>
                <p>
                  Report Date: <span className="font-mono">{new Date().toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Student Profile Overview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/60 print:bg-slate-50 p-5 rounded-2xl border border-slate-800 print:border-slate-200">
            <div className="sm:col-span-2 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Student Details
              </span>
              <h2 className="text-xl font-bold text-white print:text-slate-900">{student.name}</h2>
              <p className="text-xs text-cyan-400 print:text-cyan-700 font-medium">
                ID: {student.id} &bull; Class: {student.classSemester}
              </p>
              {student.notes && (
                <p className="text-xs text-slate-400 print:text-slate-600 italic pt-1">
                  &ldquo;{student.notes}&rdquo;
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Overall Grade</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white print:text-slate-900 font-mono">
                    {metrics.averageMarks}%
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-500/20 text-cyan-300 print:bg-cyan-100 print:text-cyan-800">
                    {metrics.grade}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  metrics.examDelta >= 0
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                {metrics.examDelta >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Exam Trajectory</p>
                <p
                  className={`text-lg font-bold font-mono ${
                    metrics.examDelta >= 0
                      ? 'text-emerald-400 print:text-emerald-700'
                      : 'text-rose-400 print:text-rose-700'
                  }`}
                >
                  {metrics.examDelta >= 0 ? `+${metrics.examDelta}%` : `${metrics.examDelta}%`}
                </p>
                <p className="text-[10px] text-slate-400">Prev: {student.previousExamScore}%</p>
              </div>
            </div>
          </div>

          {/* Key Metrics Quick Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-800/40 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl">
              <p className="text-[11px] text-slate-400">Attendance Rate</p>
              <p
                className={`text-lg font-bold font-mono mt-0.5 ${
                  student.attendance >= settings.lowAttendanceThreshold
                    ? 'text-emerald-400 print:text-emerald-700'
                    : 'text-rose-400 print:text-rose-700'
                }`}
              >
                {student.attendance}%
              </p>
            </div>
            <div className="p-3 bg-slate-800/40 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl">
              <p className="text-[11px] text-slate-400">Daily Study Hours</p>
              <p className="text-lg font-bold font-mono text-cyan-400 print:text-cyan-700 mt-0.5">
                {student.dailyStudyHours} hrs/d
              </p>
            </div>
            <div className="p-3 bg-slate-800/40 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl">
              <p className="text-[11px] text-slate-400">Cohort Rank</p>
              <p className="text-lg font-bold font-mono text-white print:text-slate-900 mt-0.5">
                #{metrics.rank || 'N/A'}{' '}
                <span className="text-xs font-normal text-slate-400">
                  / {classAnalytics.totalStudents}
                </span>
              </p>
            </div>
            <div className="p-3 bg-slate-800/40 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl">
              <p className="text-[11px] text-slate-400">Percentile Band</p>
              <p className="text-lg font-bold font-mono text-teal-400 print:text-teal-700 mt-0.5">
                Top {100 - (metrics.percentile || 50)}%
              </p>
            </div>
          </div>

          {/* Academic Subject Performance & Radar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Subject Marks Table */}
            <div className="border border-slate-800 print:border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-800/60 print:bg-slate-100 px-4 py-2.5 border-b border-slate-800 print:border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-white print:text-slate-800 uppercase tracking-wider">
                  Course Subject Breakdown
                </span>
                <span className="text-xs text-slate-400">Max Score: {settings.maxScore}</span>
              </div>
              <div className="divide-y divide-slate-800 print:divide-slate-200">
                {[
                  { name: 'Mathematics', score: student.mathMarks, avg: classAnalytics.subjectAverages[0]?.average || 70 },
                  { name: 'Physics', score: student.physicsMarks, avg: classAnalytics.subjectAverages[1]?.average || 70 },
                  { name: 'Computer Science', score: student.csMarks, avg: classAnalytics.subjectAverages[2]?.average || 70 },
                ].map((sub) => {
                  const diff = Number((sub.score - sub.avg).toFixed(1));
                  return (
                    <div key={sub.name} className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white print:text-slate-900">{sub.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-cyan-400 print:text-cyan-800">
                            {sub.score} / {settings.maxScore}
                          </span>
                          <span
                            className={`text-[11px] font-mono ${
                              diff >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'
                            }`}
                          >
                            ({diff >= 0 ? `+${diff}` : diff}% vs class avg)
                          </span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-slate-800 print:bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 print:bg-cyan-600 rounded-full"
                          style={{ width: `${(sub.score / settings.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Radar Spider Chart */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 print:bg-transparent rounded-xl border border-slate-800 print:border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Multi-Axis Competency Radar
              </span>
              <StudentRadarChart student={student} classAnalytics={classAnalytics} />
            </div>
          </div>

          {/* Active Support Flags if any */}
          {metrics.supportFlags.length > 0 && (
            <div className="bg-amber-500/10 print:bg-amber-50 border border-amber-500/20 print:border-amber-200 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-amber-300 print:text-amber-900 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Identified Educational Support Indicators</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {metrics.supportFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-2.5 rounded-lg bg-slate-900/60 print:bg-white border border-amber-500/30 print:border-amber-200"
                  >
                    <p className="font-semibold text-white print:text-slate-900">{flag.title}</p>
                    <p className="text-slate-300 print:text-slate-700 text-[11px] mt-0.5">{flag.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI / Personalized Study Timetable & Recommendations */}
          <div className="border border-slate-800 print:border-slate-300 rounded-xl p-5 bg-slate-950/40 print:bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 print:text-cyan-700" />
                <h3 className="font-bold text-sm text-white print:text-slate-900">
                  Personalized Study Action Plan & Weekly Timetable
                </h3>
              </div>
              {loadingPlan && (
                <span className="text-xs text-cyan-400 animate-pulse font-medium">
                  Synthesizing learning schedule...
                </span>
              )}
            </div>

            {studyPlan ? (
              <div className="space-y-4 text-xs">
                <p className="text-slate-300 print:text-slate-700 leading-relaxed bg-slate-900/50 print:bg-white p-3 rounded-lg border border-slate-800 print:border-slate-200">
                  {studyPlan.summary}
                </p>

                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-emerald-950/20 print:bg-emerald-50 border border-emerald-800/30 print:border-emerald-200 rounded-lg">
                    <p className="font-bold text-emerald-400 print:text-emerald-800 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4" /> Academic Strengths
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-slate-700">
                      {studyPlan.strengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-cyan-950/20 print:bg-cyan-50 border border-cyan-800/30 print:border-cyan-200 rounded-lg">
                    <p className="font-bold text-cyan-400 print:text-cyan-800 flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-4 h-4" /> Priority Improvement Areas
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-slate-700">
                      {studyPlan.areasForImprovement.map((area, i) => (
                        <li key={i}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Timetable Table */}
                <div>
                  <h4 className="font-bold text-slate-200 print:text-slate-800 mb-2">
                    Recommended Weekly Revision Schedule:
                  </h4>
                  <div className="border border-slate-800 print:border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/70 print:bg-slate-200 text-slate-400 print:text-slate-700">
                        <tr>
                          <th className="py-2 px-3">Day</th>
                          <th className="py-2 px-3">Focus Area</th>
                          <th className="py-2 px-3">Duration</th>
                          <th className="py-2 px-3">Targeted Activity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-700">
                        {studyPlan.weeklyStudyTimetable.map((slot) => (
                          <tr key={slot.day} className="hover:bg-slate-800/30">
                            <td className="py-2 px-3 font-semibold text-white print:text-slate-900">
                              {slot.day}
                            </td>
                            <td className="py-2 px-3 font-medium text-cyan-300 print:text-cyan-800">
                              {slot.focus}
                            </td>
                            <td className="py-2 px-3 font-mono">{slot.durationHours} hrs</td>
                            <td className="py-2 px-3">{slot.activity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actionable Tips */}
                <div className="bg-slate-900/60 print:bg-white p-3 rounded-lg border border-slate-800 print:border-slate-200">
                  <p className="font-semibold text-slate-200 print:text-slate-800 mb-1">
                    Learning Coach Practical Tips:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400 print:text-slate-600">
                    {studyPlan.actionableTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Loading personalized recommendations...</p>
            )}
          </div>

          {/* Official Signatures Row (Visible in print) */}
          <div className="pt-8 border-t border-slate-800 print:border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-slate-700">
            <div>
              <div className="h-10 border-b border-dashed border-slate-700 print:border-slate-400 mb-2"></div>
              <p className="font-semibold text-white print:text-slate-900">Course Instructor / Advisor</p>
              <p className="text-[11px]">Academic Evaluation Committee</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-700 print:border-slate-400 mb-2"></div>
              <p className="font-semibold text-white print:text-slate-900">Dean / Head of Department</p>
              <p className="text-[11px]">{settings.departmentName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
