import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Student, AppSettings } from '../types';
import { parseAndValidateCSV, downloadSampleCSVFile } from '../utils/csv';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Student[], mode: 'append' | 'replace') => void;
  settings: AppSettings;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  settings,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<ReturnType<typeof parseAndValidateCSV> | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (fileToRead: File) => {
    if (!fileToRead.name.endsWith('.csv') && !fileToRead.name.endsWith('.txt')) {
      alert('Please upload a valid .csv file.');
      return;
    }

    setFile(fileToRead);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvContent(text);
      const result = parseAndValidateCSV(text, settings);
      setParseResult(result);
    };
    reader.readAsText(fileToRead);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult && parseResult.validStudents.length > 0) {
      onImport(parseResult.validStudents, importMode);
      onClose();
      // Reset state
      setFile(null);
      setCsvContent('');
      setParseResult(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import Student Records (CSV)</h2>
              <p className="text-xs text-slate-400">
                Upload student cohorts with automatic column mapping and validation.
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
        <div className="p-6 space-y-5">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Need the right format? Use our verified CSV spreadsheet template.</span>
            </div>
            <button
              type="button"
              onClick={downloadSampleCSVFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Sample CSV
            </button>
          </div>

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-950/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white mb-1">
                Drag and drop your student CSV file here, or browse
              </p>
              <p className="text-xs text-slate-400">
                Supports standard comma-separated files containing marks, attendance, and study hours.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-800/70 border border-slate-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-teal-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB &bull; Loaded into validator
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setParseResult(null);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Choose another file
                </button>
              </div>

              {/* Validation Summary */}
              {parseResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs text-emerald-300 font-medium">Valid Records</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {parseResult.validStudents.length}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-xl flex items-center gap-3 border ${
                        parseResult.errors.length > 0
                          ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400'
                      }`}
                    >
                      <AlertCircle className="w-6 h-6 shrink-0 text-rose-400" />
                      <div>
                        <p className="text-xs font-medium">Invalid Records</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {parseResult.errors.length}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs text-amber-300 font-medium">Warnings / Adjusted</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {parseResult.warnings.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Errors List if any */}
                  {parseResult.errors.length > 0 && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl max-h-36 overflow-y-auto text-xs space-y-1">
                      <p className="font-bold text-rose-300 mb-1">Errors found in CSV:</p>
                      {parseResult.errors.map((err, i) => (
                        <p key={i} className="text-rose-200">
                          <span className="font-semibold text-rose-300">
                            Row {err.row} ({err.field}):
                          </span>{' '}
                          {err.message}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Preview Table of Valid Records */}
                  {parseResult.validStudents.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 mb-2">
                        Preview of records to import (First 4 rows):
                      </h4>
                      <div className="border border-slate-800 rounded-xl overflow-hidden overflow-x-auto text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-800/80 text-slate-400">
                            <tr>
                              <th className="py-2 px-3">ID</th>
                              <th className="py-2 px-3">Name</th>
                              <th className="py-2 px-3">Class</th>
                              <th className="py-2 px-3">Math</th>
                              <th className="py-2 px-3">Phys</th>
                              <th className="py-2 px-3">CS</th>
                              <th className="py-2 px-3">Att %</th>
                              <th className="py-2 px-3">Study Hrs</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-300">
                            {parseResult.validStudents.slice(0, 4).map((s) => (
                              <tr key={s.id} className="hover:bg-slate-800/40">
                                <td className="py-2 px-3 font-mono text-cyan-400">{s.id}</td>
                                <td className="py-2 px-3 font-medium text-white">{s.name}</td>
                                <td className="py-2 px-3 text-slate-400">{s.classSemester}</td>
                                <td className="py-2 px-3 font-mono">{s.mathMarks}</td>
                                <td className="py-2 px-3 font-mono">{s.physicsMarks}</td>
                                <td className="py-2 px-3 font-mono">{s.csMarks}</td>
                                <td className="py-2 px-3 font-mono text-emerald-400">{s.attendance}%</td>
                                <td className="py-2 px-3 font-mono">{s.dailyStudyHours}h</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Mode Select */}
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Import Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          importMode === 'append'
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="mt-0.5 text-cyan-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">Append to existing records</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Keep existing students and merge new unique IDs.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          importMode === 'replace'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="mt-0.5 text-amber-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">Replace entire dataset</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Wipe current dataset and replace with imported records.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
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
              type="button"
              disabled={!parseResult || parseResult.validStudents.length === 0}
              onClick={handleConfirmImport}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-teal-950/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              Import {parseResult ? parseResult.validStudents.length : 0} Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
