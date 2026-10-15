import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Download,
  BookOpen,
} from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import { Student, PerformanceCategory } from '../types';
import { calculateStudentMetrics } from '../utils/analytics';
import { exportStudentsToCSV } from '../utils/csv';

interface StudentManagementProps {
  onOpenAddModal: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteRequest: (student: Student) => void;
  onSelectStudentForProfile: (student: Student) => void;
}

type SortField =
  | 'id'
  | 'name'
  | 'classSemester'
  | 'mathMarks'
  | 'physicsMarks'
  | 'csMarks'
  | 'average'
  | 'attendance'
  | 'dailyStudyHours'
  | 'examDelta';

type SortDirection = 'asc' | 'desc';

export const StudentManagement: React.FC<StudentManagementProps> = ({
  onOpenAddModal,
  onEditStudent,
  onDeleteRequest,
  onSelectStudentForProfile,
}) => {
  const { students, allStudents, settings } = useStudentContext();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | PerformanceCategory>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'BELOW_75' | 'ABOVE_75'>('ALL');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('average');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Unique Classes
  const uniqueClasses = useMemo(() => {
    return Array.from(new Set(allStudents.map((s) => s.classSemester).filter(Boolean)));
  }, [allStudents]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and Sort Students
  const filteredAndSorted = useMemo(() => {
    return allStudents
      .filter((student) => {
        // Search Term (Name or ID)
        const matchesSearch =
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.classSemester.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // Class Filter
        if (classFilter !== 'ALL' && student.classSemester !== classFilter) {
          return false;
        }

        // Metrics for performance filters
        const metrics = calculateStudentMetrics(student, settings);

        // Performance Category
        if (categoryFilter !== 'ALL' && metrics.performanceCategory !== categoryFilter) {
          return false;
        }

        // Attendance Filter
        if (attendanceFilter === 'BELOW_75' && student.attendance >= settings.lowAttendanceThreshold) {
          return false;
        }
        if (attendanceFilter === 'ABOVE_75' && student.attendance < settings.lowAttendanceThreshold) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const metricsA = calculateStudentMetrics(a, settings);
        const metricsB = calculateStudentMetrics(b, settings);

        let valA: any = 0;
        let valB: any = 0;

        switch (sortField) {
          case 'id':
            valA = a.id;
            valB = b.id;
            break;
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'classSemester':
            valA = a.classSemester;
            valB = b.classSemester;
            break;
          case 'mathMarks':
            valA = a.mathMarks;
            valB = b.mathMarks;
            break;
          case 'physicsMarks':
            valA = a.physicsMarks;
            valB = b.physicsMarks;
            break;
          case 'csMarks':
            valA = a.csMarks;
            valB = b.csMarks;
            break;
          case 'average':
            valA = metricsA.averageMarks;
            valB = metricsB.averageMarks;
            break;
          case 'attendance':
            valA = a.attendance;
            valB = b.attendance;
            break;
          case 'dailyStudyHours':
            valA = a.dailyStudyHours;
            valB = b.dailyStudyHours;
            break;
          case 'examDelta':
            valA = metricsA.examDelta;
            valB = metricsB.examDelta;
            break;
        }

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [allStudents, searchTerm, classFilter, categoryFilter, attendanceFilter, sortField, sortDirection, settings]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  const resetFilters = () => {
    setSearchTerm('');
    setClassFilter('ALL');
    setCategoryFilter('ALL');
    setAttendanceFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Student Roster & Academic Records</h2>
          <p className="text-xs text-slate-400">
            Manage student registrations, subject grades, attendance records, and review individual profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportStudentsToCSV(filteredAndSorted, settings)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export Filtered CSV
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-cyan-950/40 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by student name or ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Class Filter */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Classes / Semesters</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Performance Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Performance Bands</option>
              <option value="high_achiever">High Achievers (≥ 80%)</option>
              <option value="average">Average Range (50% - 79%)</option>
              <option value="needs_support">Needs Support (&lt; 50%)</option>
            </select>
          </div>

          {/* Attendance Filter */}
          <div className="relative">
            <select
              value={attendanceFilter}
              onChange={(e) => {
                setAttendanceFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Attendance Levels</option>
              <option value="BELOW_75">Low Attendance (&lt; 75%)</option>
              <option value="ABOVE_75">Satisfactory Attendance (≥ 75%)</option>
            </select>
          </div>
        </div>

        {/* Filter stats & Reset button */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <span>
            Showing <strong className="text-white font-mono">{filteredAndSorted.length}</strong> of{' '}
            <span className="font-mono">{allStudents.length}</span> students
          </span>
          {(searchTerm || classFilter !== 'ALL' || categoryFilter !== 'ALL' || attendanceFilter !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 select-none">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('classSemester')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Class / Section</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('mathMarks')}
                  className="py-3 px-3 font-semibold text-center cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Math</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('physicsMarks')}
                  className="py-3 px-3 font-semibold text-center cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Phys</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('csMarks')}
                  className="py-3 px-3 font-semibold text-center cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>CS</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('average')}
                  className="py-3 px-4 font-semibold text-center cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Average %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('attendance')}
                  className="py-3 px-3 font-semibold text-center cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Attendance</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dailyStudyHours')}
                  className="py-3 px-3 font-semibold text-center cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Study Hrs</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('examDelta')}
                  className="py-3 px-3 font-semibold text-center cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Delta</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-center">Support Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No students match your criteria.</p>
                    <p className="text-xs mt-1">Try resetting the filters or adding a new student.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-cyan-400 font-semibold"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const metrics = calculateStudentMetrics(student, settings, allStudents);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                        {student.id}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-semibold text-white">
                        <button
                          onClick={() => onSelectStudentForProfile(student)}
                          className="hover:text-cyan-400 transition-colors text-left"
                        >
                          {student.name}
                        </button>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4 text-slate-400">{student.classSemester}</td>

                      {/* Marks */}
                      <td className="py-3 px-3 text-center font-mono">{student.mathMarks}</td>
                      <td className="py-3 px-3 text-center font-mono">{student.physicsMarks}</td>
                      <td className="py-3 px-3 text-center font-mono">{student.csMarks}</td>

                      {/* Average & Grade */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-white">{metrics.averageMarks}%</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              metrics.averageMarks >= 80
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : metrics.averageMarks < 50
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {metrics.grade}
                          </span>
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`font-semibold ${
                            student.attendance >= settings.lowAttendanceThreshold
                              ? 'text-emerald-400'
                              : 'text-rose-400 font-bold'
                          }`}
                        >
                          {student.attendance}%
                        </span>
                      </td>

                      {/* Daily Study Hours */}
                      <td className="py-3 px-3 text-center font-mono text-slate-300">
                        {student.dailyStudyHours}h
                      </td>

                      {/* Delta */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span
                          className={`text-xs font-semibold ${
                            metrics.examDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {metrics.examDelta >= 0 ? `+${metrics.examDelta}` : metrics.examDelta}%
                        </span>
                      </td>

                      {/* Support Status */}
                      <td className="py-3 px-4 text-center">
                        {metrics.supportFlags.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            {metrics.supportFlags.length} Flag
                            {metrics.supportFlags.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Satisfactory
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectStudentForProfile(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            title="View Full Profile & Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteRequest(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing Page <span className="font-mono text-white font-semibold">{currentPage}</span>{' '}
            of <span className="font-mono text-white font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white font-medium transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold transition-colors ${
                  currentPage === idx + 1
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
