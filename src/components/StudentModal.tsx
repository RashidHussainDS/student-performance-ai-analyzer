import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { Student, AppSettings } from '../types';
import { calculateStudentMetrics } from '../utils/analytics';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  studentToEdit?: Student | null;
  settings: AppSettings;
  existingIds: string[];
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
  settings,
  existingIds,
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    classSemester: 'Sem 4 - CS (Sec A)',
    mathMarks: '75',
    physicsMarks: '70',
    csMarks: '85',
    attendance: '85',
    dailyStudyHours: '3.0',
    previousExamScore: '75',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        id: studentToEdit.id,
        name: studentToEdit.name,
        classSemester: studentToEdit.classSemester,
        mathMarks: studentToEdit.mathMarks.toString(),
        physicsMarks: studentToEdit.physicsMarks.toString(),
        csMarks: studentToEdit.csMarks.toString(),
        attendance: studentToEdit.attendance.toString(),
        dailyStudyHours: studentToEdit.dailyStudyHours.toString(),
        previousExamScore: studentToEdit.previousExamScore.toString(),
        notes: studentToEdit.notes || '',
      });
    } else {
      // Generate unique candidate ID
      const nextIdNum = 1000 + existingIds.length + 1;
      setFormData({
        id: `STU-${nextIdNum}`,
        name: '',
        classSemester: 'Sem 4 - CS (Sec A)',
        mathMarks: '75',
        physicsMarks: '70',
        csMarks: '85',
        attendance: '85',
        dailyStudyHours: '3.0',
        previousExamScore: '75',
        notes: '',
      });
    }
    setErrors({});
  }, [studentToEdit, isOpen, existingIds.length]);

  if (!isOpen) return null;

  // Live preview metrics
  const previewStudent: Student = {
    id: formData.id || 'PREVIEW',
    name: formData.name || 'Student Name',
    classSemester: formData.classSemester,
    mathMarks: parseFloat(formData.mathMarks) || 0,
    physicsMarks: parseFloat(formData.physicsMarks) || 0,
    csMarks: parseFloat(formData.csMarks) || 0,
    attendance: parseFloat(formData.attendance) || 0,
    dailyStudyHours: parseFloat(formData.dailyStudyHours) || 0,
    previousExamScore: parseFloat(formData.previousExamScore) || 0,
  };

  const previewMetrics = calculateStudentMetrics(previewStudent, settings);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const max = settings.maxScore || 100;

    if (!formData.id.trim()) {
      newErrors.id = 'Student ID is required.';
    } else if (
      !studentToEdit &&
      existingIds.includes(formData.id.trim())
    ) {
      newErrors.id = 'A student with this ID already exists.';
    }

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Full Name must be at least 2 characters.';
    }

    if (!formData.classSemester.trim()) {
      newErrors.classSemester = 'Class or Semester is required.';
    }

    const math = parseFloat(formData.mathMarks);
    if (isNaN(math) || math < 0 || math > max) {
      newErrors.mathMarks = `Must be between 0 and ${max}.`;
    }

    const phys = parseFloat(formData.physicsMarks);
    if (isNaN(phys) || phys < 0 || phys > max) {
      newErrors.physicsMarks = `Must be between 0 and ${max}.`;
    }

    const cs = parseFloat(formData.csMarks);
    if (isNaN(cs) || cs < 0 || cs > max) {
      newErrors.csMarks = `Must be between 0 and ${max}.`;
    }

    const att = parseFloat(formData.attendance);
    if (isNaN(att) || att < 0 || att > 100) {
      newErrors.attendance = 'Attendance must be between 0% and 100%.';
    }

    const hours = parseFloat(formData.dailyStudyHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      newErrors.dailyStudyHours = 'Study hours must be between 0 and 24 hours/day.';
    }

    const prev = parseFloat(formData.previousExamScore);
    if (isNaN(prev) || prev < 0 || prev > 100) {
      newErrors.previousExamScore = 'Score must be between 0% and 100%.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const student: Student = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      classSemester: formData.classSemester.trim(),
      mathMarks: parseFloat(formData.mathMarks),
      physicsMarks: parseFloat(formData.physicsMarks),
      csMarks: parseFloat(formData.csMarks),
      attendance: parseFloat(formData.attendance),
      dailyStudyHours: parseFloat(formData.dailyStudyHours),
      previousExamScore: parseFloat(formData.previousExamScore),
      notes: formData.notes.trim() || undefined,
      createdAt: studentToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {studentToEdit ? 'Edit Student Record' : 'Add New Student'}
              </h2>
              <p className="text-xs text-slate-400">
                All metrics are dynamically evaluated against academic rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={!!studentToEdit}
                placeholder="e.g. STU-1025"
                className={`w-full px-3 py-2 bg-slate-800 border ${
                  errors.id ? 'border-rose-500' : 'border-slate-700'
                } rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-60`}
              />
              {errors.id && <p className="text-[11px] text-rose-400 mt-1">{errors.id}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jessica Taylor"
                className={`w-full px-3 py-2 bg-slate-800 border ${
                  errors.name ? 'border-rose-500' : 'border-slate-700'
                } rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500`}
              />
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Class / Semester *
            </label>
            <input
              type="text"
              value={formData.classSemester}
              onChange={(e) => setFormData({ ...formData, classSemester: e.target.value })}
              placeholder="e.g. Sem 4 - CS (Sec A) or Sem 6 - SE"
              className={`w-full px-3 py-2 bg-slate-800 border ${
                errors.classSemester ? 'border-rose-500' : 'border-slate-700'
              } rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500`}
            />
            {errors.classSemester && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.classSemester}</p>
            )}
          </div>

          {/* Marks Section */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Academic Marks (Max: {settings.maxScore})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Mathematics
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={settings.maxScore}
                  value={formData.mathMarks}
                  onChange={(e) => setFormData({ ...formData, mathMarks: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-800 border ${
                    errors.mathMarks ? 'border-rose-500' : 'border-slate-700'
                  } rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-500`}
                />
                {errors.mathMarks && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.mathMarks}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Physics
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={settings.maxScore}
                  value={formData.physicsMarks}
                  onChange={(e) => setFormData({ ...formData, physicsMarks: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-800 border ${
                    errors.physicsMarks ? 'border-rose-500' : 'border-slate-700'
                  } rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-500`}
                />
                {errors.physicsMarks && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.physicsMarks}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Computer Science
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={settings.maxScore}
                  value={formData.csMarks}
                  onChange={(e) => setFormData({ ...formData, csMarks: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-800 border ${
                    errors.csMarks ? 'border-rose-500' : 'border-slate-700'
                  } rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-500`}
                />
                {errors.csMarks && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.csMarks}</p>
                )}
              </div>
            </div>
          </div>

          {/* Behavior & History Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Attendance (%) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-800 border ${
                  errors.attendance ? 'border-rose-500' : 'border-slate-700'
                } rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-500`}
              />
              {errors.attendance && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.attendance}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Study Hours *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={formData.dailyStudyHours}
                onChange={(e) => setFormData({ ...formData, dailyStudyHours: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-800 border ${
                  errors.dailyStudyHours ? 'border-rose-500' : 'border-slate-700'
                } rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-500`}
              />
              {errors.dailyStudyHours && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.dailyStudyHours}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Previous Exam Score (%) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={formData.previousExamScore}
                onChange={(e) => setFormData({ ...formData, previousExamScore: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-800 border ${
                  errors.previousExamScore ? 'border-rose-500' : 'border-slate-700'
                } rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-500`}
              />
              {errors.previousExamScore && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.previousExamScore}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Teacher Observations / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g., Active in lab discussions; struggles with theoretical mechanics proofs."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Live Dynamic Preview Banner */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">Live Calculation Preview:</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-300">
                Average:{' '}
                <strong className="text-white font-mono text-sm">
                  {previewMetrics.averageMarks}%
                </strong>
              </span>
              <span className="text-slate-300">
                Grade:{' '}
                <span className="px-2 py-0.5 rounded font-bold font-mono bg-cyan-500/20 text-cyan-300">
                  {previewMetrics.grade}
                </span>
              </span>
              <span className="text-slate-300">
                Delta:{' '}
                <span
                  className={`font-mono font-semibold ${
                    previewMetrics.examDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {previewMetrics.examDelta >= 0 ? `+${previewMetrics.examDelta}` : previewMetrics.examDelta}%
                </span>
              </span>
            </div>
          </div>

          {previewMetrics.supportFlags.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Active Rule Triggers for this record:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-200/90">
                  {previewMetrics.supportFlags.map((f) => (
                    <li key={f.id}>{f.reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-950/40"
            >
              {studentToEdit ? 'Save Changes' : 'Add Student Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
