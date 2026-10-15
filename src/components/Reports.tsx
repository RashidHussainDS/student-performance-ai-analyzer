import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import { exportStudentsToCSV } from '../utils/csv';
import { calculateStudentMetrics } from '../utils/analytics';
import { Student } from '../types';

interface ReportsProps {
  onSelectStudent: (student: Student) => void;
}

export const Reports: React.FC<ReportsProps> = ({ onSelectStudent }) => {
  const { students, allStudents, classAnalytics, settings, selectedClassFilter } = useStudentContext();
  const [reportType, setReportType] = useState<'class_summary' | 'student_roster' | 'intervention_list'>('class_summary');

  const handlePrint = () => {
    window.print();
  };

  const studentsWithMetrics = students.map((s) => ({
    student: s,
    metrics: calculateStudentMetrics(s, settings),
  }));

  const atRiskStudents = studentsWithMetrics.filter(
    (s) => s.metrics.supportFlags.length > 0 || s.metrics.performanceCategory === 'needs_support'
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Report Selector (hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Academic Examination Reports</h2>
          <p className="text-xs text-slate-400">
            Generate printable executive cohort summaries, student transcripts, and intervention documentation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportStudentsToCSV(students, settings)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export Full CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-950/40 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Formatted Report
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs (hidden during print) */}
      <div className="no-print flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => setReportType('class_summary')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            reportType === 'class_summary'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          1. Class Executive Performance Summary
        </button>
        <button
          onClick={() => setReportType('student_roster')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            reportType === 'student_roster'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          2. Full Academic Roster Transcript
        </button>
        <button
          onClick={() => setReportType('intervention_list')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            reportType === 'intervention_list'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          3. Student Support & Remediation Audit
        </button>
      </div>

      {/* Main Printable Document Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-10 print:p-0 print:border-none print:bg-white print:text-slate-900">
        {/* Institutional Letterhead */}
        <div className="border-b-2 border-slate-800 print:border-slate-300 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white print:border print:border-slate-400 shadow-md">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white print:text-slate-900 tracking-tight">
                  {settings.institutionName}
                </h1>
                <p className="text-xs sm:text-sm text-cyan-400 print:text-cyan-800 font-semibold">
                  {settings.departmentName} &bull; {settings.academicYear}
                </p>
                <p className="text-xs text-slate-400 print:text-slate-500 mt-0.5">
                  Official Academic Assessment Report &bull; {settings.examName}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-0.5">
              <p>
                Report Generated:{' '}
                <strong className="text-white print:text-slate-900 font-mono">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </strong>
              </p>
              <p>
                Scope:{' '}
                <strong className="text-white print:text-slate-900">
                  {selectedClassFilter === 'ALL' ? 'All Registered Cohorts' : selectedClassFilter}
                </strong>
              </p>
              <p>Total Records Evaluated: {classAnalytics.totalStudents}</p>
            </div>
          </div>
        </div>

        {/* Report Content Based on Active Type */}
        {reportType === 'class_summary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-200 pb-2">
              <h2 className="text-base font-bold text-white print:text-slate-900">
                1. Executive Cohort Analytics & Statistical Summary
              </h2>
            </div>

            {/* KPI Summary Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Cohort Mean</p>
                <p className="text-2xl font-black text-cyan-400 print:text-cyan-800 font-mono mt-1">
                  {classAnalytics.classAverage}%
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Standard Dev: ±{classAnalytics.standardDeviation}%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Median Score</p>
                <p className="text-2xl font-black text-white print:text-slate-900 font-mono mt-1">
                  {classAnalytics.medianScore}%
                </p>
                <p className="text-[10px] text-slate-400 mt-1">50th percentile</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Attendance Mean</p>
                <p className="text-2xl font-black text-emerald-400 print:text-emerald-800 font-mono mt-1">
                  {classAnalytics.averageAttendance}%
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Benchmark: {settings.lowAttendanceThreshold}%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Support Flagged</p>
                <p className="text-2xl font-black text-amber-400 print:text-amber-800 font-mono mt-1">
                  {classAnalytics.studentsNeedingSupportCount}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {classAnalytics.totalStudents > 0
                    ? Math.round(
                        (classAnalytics.studentsNeedingSupportCount /
                          classAnalytics.totalStudents) *
                          100
                      )
                    : 0}% of cohort
                </p>
              </div>
            </div>

            {/* Subject Breakdown Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 print:text-slate-800 uppercase tracking-wider mb-2">
                Subject Performance Metrics (Max Score: {settings.maxScore})
              </h3>
              <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 print:bg-slate-200 text-slate-400 print:text-slate-800 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Subject Name</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Average %</th>
                      <th className="py-2.5 px-3">Median</th>
                      <th className="py-2.5 px-3">Std Dev</th>
                      <th className="py-2.5 px-3">Highest</th>
                      <th className="py-2.5 px-3">Lowest</th>
                      <th className="py-2.5 px-3">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-900">
                    {classAnalytics.subjectAverages.map((sub) => (
                      <tr key={sub.subject}>
                        <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">{sub.subject}</td>
                        <td className="py-2.5 px-3 font-mono text-cyan-400 print:text-cyan-800">{sub.code}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{sub.average}%</td>
                        <td className="py-2.5 px-3 font-mono">{sub.median}%</td>
                        <td className="py-2.5 px-3 font-mono">±{sub.stdDev}%</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 print:text-emerald-700">{sub.highest}%</td>
                        <td className="py-2.5 px-3 font-mono text-rose-400 print:text-rose-700">{sub.lowest}%</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-cyan-300 print:text-cyan-800">{sub.passingRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grade Bracket Distribution */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 print:text-slate-800 uppercase tracking-wider mb-2">
                Cohort Grade Classification Table
              </h3>
              <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 print:bg-slate-200 text-slate-400 print:text-slate-800 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Grade</th>
                      <th className="py-2 px-3">Score Bracket</th>
                      <th className="py-2 px-3 text-center">Student Count</th>
                      <th className="py-2 px-3 text-center">Cohort Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-900">
                    {classAnalytics.gradeDistribution.map((grade) => (
                      <tr key={grade.grade}>
                        <td className="py-2 px-3 font-bold font-mono text-white print:text-slate-900">{grade.grade}</td>
                        <td className="py-2 px-3">{grade.label}</td>
                        <td className="py-2 px-3 text-center font-mono font-semibold">{grade.count}</td>
                        <td className="py-2 px-3 text-center font-mono">{grade.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === 'student_roster' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-2">
              2. Complete Student Transcript & Grade Roster
            </h2>
            <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 print:bg-slate-200 text-slate-400 print:text-slate-800 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-2 text-center">Math</th>
                    <th className="py-2.5 px-2 text-center">Phys</th>
                    <th className="py-2.5 px-2 text-center">CS</th>
                    <th className="py-2.5 px-3 text-center">Average %</th>
                    <th className="py-2.5 px-2 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-center">Attendance</th>
                    <th className="py-2.5 px-3 text-center">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-900">
                  {studentsWithMetrics.map(({ student, metrics }) => (
                    <tr key={student.id}>
                      <td className="py-2.5 px-3 font-mono font-medium text-cyan-400 print:text-cyan-800">{student.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-white print:text-slate-900">{student.name}</td>
                      <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">{student.classSemester}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{student.mathMarks}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{student.physicsMarks}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{student.csMarks}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-white print:text-slate-900">{metrics.averageMarks}%</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold">{metrics.grade}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{student.attendance}%</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {metrics.examDelta >= 0 ? `+${metrics.examDelta}%` : `${metrics.examDelta}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'intervention_list' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white print:text-slate-900 border-b border-slate-800 print:border-slate-200 pb-2">
              3. Student Academic Support & Intervention Audit
            </h2>
            <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 print:bg-slate-200 text-slate-400 print:text-slate-800 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Average %</th>
                    <th className="py-2.5 px-3">Attendance</th>
                    <th className="py-2.5 px-4">Identified Support Triggers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-900">
                  {atRiskStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No students currently flagged for academic support.
                      </td>
                    </tr>
                  ) : (
                    atRiskStudents.map(({ student, metrics }) => (
                      <tr key={student.id}>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-white print:text-slate-900">{student.name}</p>
                          <span className="font-mono text-cyan-400 print:text-cyan-800 text-[10px]">{student.id}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">{student.classSemester}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-400 print:text-rose-700">{metrics.averageMarks}%</td>
                        <td className="py-2.5 px-3 font-mono">{student.attendance}%</td>
                        <td className="py-2.5 px-4">
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300 print:text-slate-700">
                            {metrics.supportFlags.map((f) => (
                              <li key={f.id}>{f.reason}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Signatures Row */}
        <div className="pt-10 mt-8 border-t-2 border-slate-800 print:border-slate-300 grid grid-cols-2 gap-12 text-xs text-slate-400 print:text-slate-700">
          <div>
            <div className="h-10 border-b border-dashed border-slate-700 print:border-slate-400 mb-2"></div>
            <p className="font-bold text-white print:text-slate-900">Head of Examination & Assessment</p>
            <p className="text-[11px]">{settings.departmentName}</p>
          </div>
          <div className="text-right">
            <div className="h-10 border-b border-dashed border-slate-700 print:border-slate-400 mb-2"></div>
            <p className="font-bold text-white print:text-slate-900">Dean of Academic Affairs</p>
            <p className="text-[11px]">{settings.institutionName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
