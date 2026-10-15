import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Student,
  AppSettings,
  ClassAnalytics,
  AIInsightData,
  StudentStudyPlan,
  FlagStatus,
} from '../types';
import { SAMPLE_STUDENTS, DEFAULT_SETTINGS } from '../data/sampleStudents';
import { calculateClassAnalytics, calculateStudentMetrics } from '../utils/analytics';

const STORAGE_KEYS = {
  STUDENTS: 'spa_students_v1',
  SETTINGS: 'spa_settings_v1',
  IS_DEMO: 'spa_is_demo_v1',
  FLAGS_OVERRIDE: 'spa_flags_status_v1',
};

interface StudentContextType {
  students: Student[];
  allStudents: Student[];
  settings: AppSettings;
  classAnalytics: ClassAnalytics;
  selectedClassFilter: string;
  isDemonstrationData: boolean;
  selectedStudentForProfile: Student | null;
  aiInsights: AIInsightData | null;
  isGeneratingAI: boolean;
  aiNotice: string | null;
  flagOverrides: Record<string, { status: FlagStatus; reviewNote?: string }>;

  // Actions
  addStudent: (student: Omit<Student, 'createdAt' | 'updatedAt'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  importStudents: (newStudents: Student[], mode: 'append' | 'replace') => void;
  restoreSampleData: () => void;
  clearAllData: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateFlagStatus: (flagId: string, status: FlagStatus, reviewNote?: string) => void;
  setSelectedClassFilter: (filter: string) => void;
  setSelectedStudentForProfile: (student: Student | null) => void;
  fetchAIInsights: (customPrompt?: string) => Promise<void>;
  fetchStudentStudyPlan: (student: Student) => Promise<StudentStudyPlan>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Load students
  const [allStudents, setAllStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SAMPLE_STUDENTS;
    } catch {
      return SAMPLE_STUDENTS;
    }
  });

  const [isDemonstrationData, setIsDemonstrationData] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Flag status overrides (e.g. educator reviewed or dismissed a flag)
  const [flagOverrides, setFlagOverrides] = useState<
    Record<string, { status: FlagStatus; reviewNote?: string }>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FLAGS_OVERRIDE);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);

  // AI state
  const [aiInsights, setAiInsights] = useState<AIInsightData | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Persist students
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allStudents));
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, JSON.stringify(isDemonstrationData));
    } catch (e) {
      console.warn('Failed to save students to localStorage', e);
    }
  }, [allStudents, isDemonstrationData]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Persist flag overrides
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FLAGS_OVERRIDE, JSON.stringify(flagOverrides));
    } catch (e) {
      console.warn('Failed to save flag overrides', e);
    }
  }, [flagOverrides]);

  // Filtered students according to class/semester filter
  const filteredStudents = useMemo(() => {
    if (selectedClassFilter === 'ALL') {
      return allStudents;
    }
    return allStudents.filter((s) => s.classSemester === selectedClassFilter);
  }, [allStudents, selectedClassFilter]);

  // Class analytics recalculated dynamically from active filtered set
  const classAnalytics = useMemo(() => {
    return calculateClassAnalytics(filteredStudents, settings);
  }, [filteredStudents, settings]);

  const addStudent = (studentData: Omit<Student, 'createdAt' | 'updatedAt'>) => {
    const newStudent: Student = {
      ...studentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAllStudents((prev) => [newStudent, ...prev]);
    setIsDemonstrationData(false);
  };

  const updateStudent = (updatedStudent: Student) => {
    setAllStudents((prev) =>
      prev.map((s) =>
        s.id === updatedStudent.id
          ? { ...updatedStudent, updatedAt: new Date().toISOString() }
          : s
      )
    );
    if (selectedStudentForProfile?.id === updatedStudent.id) {
      setSelectedStudentForProfile(updatedStudent);
    }
  };

  const deleteStudent = (id: string) => {
    setAllStudents((prev) => prev.filter((s) => s.id !== id));
    if (selectedStudentForProfile?.id === id) {
      setSelectedStudentForProfile(null);
    }
  };

  const importStudents = (newStudents: Student[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setAllStudents(newStudents);
    } else {
      // Append mode with de-duplication
      const existingIds = new Set(allStudents.map((s) => s.id));
      const filteredNew = newStudents.filter((s) => !existingIds.has(s.id));
      setAllStudents((prev) => [...prev, ...filteredNew]);
    }
    setIsDemonstrationData(false);
  };

  const restoreSampleData = () => {
    setAllStudents(SAMPLE_STUDENTS);
    setIsDemonstrationData(true);
    setFlagOverrides({});
    setSelectedClassFilter('ALL');
  };

  const clearAllData = () => {
    setAllStudents([]);
    setIsDemonstrationData(false);
    setSelectedStudentForProfile(null);
    setAiInsights(null);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateFlagStatus = (flagId: string, status: FlagStatus, reviewNote?: string) => {
    setFlagOverrides((prev) => ({
      ...prev,
      [flagId]: { status, reviewNote },
    }));
  };

  const fetchAIInsights = async (customPrompt?: string) => {
    if (filteredStudents.length === 0) return;
    setIsGeneratingAI(true);
    setAiNotice(null);

    try {
      const sampleSummary = filteredStudents.slice(0, 8).map((s) => {
        const m = calculateStudentMetrics(s, settings);
        return {
          id: s.id,
          class: s.classSemester,
          average: m.averageMarks,
          attendance: s.attendance,
          studyHours: s.dailyStudyHours,
          delta: m.examDelta,
          flags: m.supportFlags.map((f) => f.title),
        };
      });

      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyticsSummary: classAnalytics,
          subjects: classAnalytics.subjectAverages,
          sampleStudentsSummary: sampleSummary,
          customPrompt,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.insights) {
        setAiInsights(data.insights);
        if (data.notice || data.errorNotice) {
          setAiNotice(data.notice || data.errorNotice);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch AI insights:', err);
      setAiNotice('Unable to connect to AI server. Displaying rule-based analytics.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const fetchStudentStudyPlan = async (student: Student): Promise<StudentStudyPlan> => {
    const subjectMap = classAnalytics.subjectAverages.reduce(
      (acc, s) => ({ ...acc, [s.subject]: s.average }),
      {}
    );

    try {
      const res = await fetch('/api/gemini/student-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          classAverage: classAnalytics.classAverage,
          subjectAverages: subjectMap,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.plan) {
        return data.plan;
      }
      throw new Error('Invalid response structure');
    } catch (err) {
      console.error('Failed to generate student plan:', err);
      // Fallback local plan
      const metrics = calculateStudentMetrics(student, settings);
      return {
        summary: `${student.name} is currently achieving an average of ${metrics.averageMarks}% in ${student.classSemester}. Targeted revision in weaker topics will yield noticeable score improvements.`,
        strengths: [
          `Solid performance in ${metrics.highestSubject.name} (${metrics.highestSubject.score}%).`,
          student.attendance >= 80 ? 'Good attendance consistency.' : 'Self-study motivation.',
        ],
        areasForImprovement: [
          `Focus additional practice on ${metrics.lowestSubject.name} (${metrics.lowestSubject.score}%).`,
          student.dailyStudyHours < 2 ? 'Establish at least 2.5 hours of dedicated study daily.' : 'Incorporate active spaced repetition.',
        ],
        weeklyStudyTimetable: [
          { day: 'Monday', focus: `${metrics.lowestSubject.name} Concepts`, durationHours: 2, activity: 'Read core theory notes and solve 5 exercise problems.' },
          { day: 'Tuesday', focus: 'Problem Solving Drill', durationHours: 1.5, activity: 'Time-boxed practice problems under exam conditions.' },
          { day: 'Wednesday', focus: `${metrics.highestSubject.name} Advanced`, durationHours: 2, activity: 'Deepen mastery with high-difficulty challenges.' },
          { day: 'Thursday', focus: 'Formulas & Flashcards', durationHours: 1.5, activity: 'Active recall flashcards for key equations and theorems.' },
          { day: 'Friday', focus: 'Teacher Office Hours / Q&A', durationHours: 1.5, activity: 'Review marked homework and clear doubts with instructors.' },
          { day: 'Saturday', focus: 'Mock Practice Test', durationHours: 2.5, activity: 'Simulated 1-hour timed exam and error log review.' },
        ],
        actionableTips: [
          `Prioritize the first 45 minutes of daily study on ${metrics.lowestSubject.name}.`,
          'Maintain an Error Log notebook for every problem answered incorrectly.',
          'Form a two-person study accountability circle for weekly progress check-ins.',
        ],
      };
    }
  };

  return (
    <StudentContext.Provider
      value={{
        students: filteredStudents,
        allStudents,
        settings,
        classAnalytics,
        selectedClassFilter,
        isDemonstrationData,
        selectedStudentForProfile,
        aiInsights,
        isGeneratingAI,
        aiNotice,
        flagOverrides,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        restoreSampleData,
        clearAllData,
        updateSettings,
        updateFlagStatus,
        setSelectedClassFilter,
        setSelectedStudentForProfile,
        fetchAIInsights,
        fetchStudentStudyPlan,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within a StudentProvider');
  }
  return context;
};
