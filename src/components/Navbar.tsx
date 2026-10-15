import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Plus,
  Upload,
  Download,
  Filter,
  RefreshCw,
  Database,
  Menu,
} from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import { exportStudentsToCSV } from '../utils/csv';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenImportModal,
  onToggleSidebar,
}) => {
  const {
    students,
    allStudents,
    selectedClassFilter,
    setSelectedClassFilter,
    isDemonstrationData,
    restoreSampleData,
    settings,
  } = useStudentContext();

  // Extract unique classes
  const uniqueClasses = Array.from(
    new Set(allStudents.map((s) => s.classSemester).filter(Boolean))
  );

  const handleExport = () => {
    exportStudentsToCSV(students, settings);
  };

  return (
    <header className="no-print sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors md:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-950/40">
              <GraduationCap className="w-5 h-5" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center text-[9px] text-slate-950 font-black">
                AI
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Student Performance
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                  AI Analyzer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs">
                {settings.institutionName}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Cohort Filter */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-medium">Cohort:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
          >
            <option value="ALL" className="bg-slate-900 text-white">
              All Cohorts ({allStudents.length} Students)
            </option>
            {uniqueClasses.map((cls) => {
              const count = allStudents.filter((s) => s.classSemester === cls).length;
              return (
                <option key={cls} value={cls} className="bg-slate-900 text-white">
                  {cls} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Right: Demo indicator & Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isDemonstrationData && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300">
              <Database className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Demo Dataset Active</span>
            </div>
          )}

          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 transition-all"
            title="Import student CSV"
          >
            <Upload className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 transition-all"
            title="Export student analytics to CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-cyan-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>
    </header>
  );
};
