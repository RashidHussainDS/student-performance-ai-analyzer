import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Building,
  Database,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import { DEFAULT_SETTINGS } from '../data/sampleStudents';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    restoreSampleData,
    clearAllData,
    allStudents,
    importStudents,
  } = useStudentContext();

  const [formSettings, setFormSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset academic threshold settings back to default values?')) {
      setFormSettings(DEFAULT_SETTINGS);
      updateSettings(DEFAULT_SETTINGS);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleExportJSON = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: formSettings,
      students: allStudents,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_analyzer_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.students && Array.isArray(json.students)) {
          importStudents(json.students, 'replace');
          if (json.settings) {
            updateSettings(json.settings);
            setFormSettings(json.settings);
          }
          alert(`Successfully restored backup with ${json.students.length} student records.`);
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Application Settings & Configuration</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure rule thresholds, institution headers, and manage student dataset backups.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Academic Support Thresholds */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rule-Based Support Thresholds</h3>
              <p className="text-xs text-slate-400">
                Adjust the benchmark triggers that flag students for teacher intervention.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Low Score Support Threshold (%)
              </label>
              <input
                type="number"
                min="10"
                max="90"
                value={formSettings.lowScoreThreshold}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    lowScoreThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: 50%. Below this triggers academic review.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Low Attendance Alert (%)
              </label>
              <input
                type="number"
                min="30"
                max="95"
                value={formSettings.lowAttendanceThreshold}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    lowAttendanceThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: 75%. Below this triggers follow-up.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Exam Drop Alert Delta (%)
              </label>
              <input
                type="number"
                min="3"
                max="30"
                value={formSettings.examDropThreshold}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    examDropThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: 10%. Score decline triggering review.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Study Time Target (hrs/day)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={formSettings.lowStudyHoursThreshold}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    lowStudyHoursThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: 2.0 hrs. Recommended daily self-study.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Institution & Course Metadata */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Institution & Academic Details</h3>
              <p className="text-xs text-slate-400">
                Printed headers, report letterheads, and departmental metadata.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institution / University Name
              </label>
              <input
                type="text"
                value={formSettings.institutionName}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, institutionName: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department / Faculty Name
              </label>
              <input
                type="text"
                value={formSettings.departmentName}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, departmentName: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Academic Year / Term
              </label>
              <input
                type="text"
                value={formSettings.academicYear}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, academicYear: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Active Examination Title
              </label>
              <input
                type="text"
                value={formSettings.examName}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, examName: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Reset Thresholds to Default
          </button>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-cyan-950/40 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Dataset Backup & Restore */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Dataset Management & Backups</h3>
            <p className="text-xs text-slate-400">
              Restore sample data, export JSON snapshots, or wipe student records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <button
            type="button"
            onClick={restoreSampleData}
            className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center gap-3 text-left transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Restore Demo Data</p>
              <p className="text-[11px] text-slate-400">Load 24 sample records</p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center gap-3 text-left transition-colors"
          >
            <Download className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Export JSON Backup</p>
              <p className="text-[11px] text-slate-400">Download state snapshot</p>
            </div>
          </button>

          <label className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center gap-3 text-left transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Import JSON Backup</p>
              <p className="text-[11px] text-slate-400">Restore from local file</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to clear all student records? This will leave an empty dataset.')) {
                clearAllData();
              }
            }}
            className="p-3.5 bg-slate-950 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-800/50 rounded-xl flex items-center gap-3 text-left transition-colors"
          >
            <Trash2 className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-rose-300">Clear All Records</p>
              <p className="text-[11px] text-rose-400/80">Wipe current dataset</p>
            </div>
          </button>
        </div>
      </div>

      {/* Section 4: Privacy & Educational Compliance Notice */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
          <p className="font-bold text-white">
            Client-Side Privacy Architecture & Educational Data Notice
          </p>
          <p>
            Student performance records in this session are persisted locally in the educator&apos;s current browser environment using web storage. Sensitive student records are not transmitted publicly.
          </p>
          <p className="text-slate-400 text-[11px]">
            AI analytical requests process anonymized cohort distributions and representative benchmarks without exposing sensitive personal identification. Before production deployment with institutional databases, ensure role-based access control (RBAC) and FERPA compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
