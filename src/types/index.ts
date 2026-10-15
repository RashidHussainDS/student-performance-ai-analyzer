export type PerformanceCategory = 'high_achiever' | 'average' | 'needs_support';

export interface Student {
  id: string; // e.g. "STU-1001"
  name: string;
  classSemester: string; // e.g. "CS - Sem 4", "CS - Sem 6"
  mathMarks: number;
  physicsMarks: number;
  csMarks: number;
  attendance: number; // 0 - 100%
  dailyStudyHours: number; // e.g. 1.5 - 8.0 hrs
  previousExamScore: number; // 0 - 100%
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FlagSeverity = 'critical' | 'warning' | 'info';
export type FlagType = 'low_grade' | 'low_attendance' | 'exam_drop' | 'low_study_time';
export type FlagStatus = 'active' | 'in_review' | 'dismissed';

export interface SupportFlag {
  id: string;
  type: FlagType;
  severity: FlagSeverity;
  title: string;
  reason: string;
  status: FlagStatus;
  thresholdValue: number;
  actualValue: number;
  reviewNote?: string;
}

export interface CalculatedStudentMetrics {
  averageMarks: number;
  examDelta: number; // averageMarks - previousExamScore
  grade: string; // A+, A, B, C, D, F
  gradePoints: number;
  performanceCategory: PerformanceCategory;
  highestSubject: { name: string; score: number };
  lowestSubject: { name: string; score: number };
  supportFlags: SupportFlag[];
  rank?: number;
  percentile?: number;
}

export interface AppSettings {
  maxScore: number; // default 100
  lowScoreThreshold: number; // default 50%
  lowAttendanceThreshold: number; // default 75%
  examDropThreshold: number; // default 10%
  lowStudyHoursThreshold: number; // default 2 hours
  institutionName: string;
  departmentName: string;
  academicYear: string;
  examName: string;
}

export interface SubjectAnalytics {
  subject: string;
  code: string;
  average: number;
  median: number;
  stdDev: number;
  highest: number;
  lowest: number;
  passingRate: number;
  strugglingCount: number;
}

export interface ClassAnalytics {
  totalStudents: number;
  classAverage: number;
  medianScore: number;
  standardDeviation: number;
  highestScore: { score: number; studentName: string; studentId: string };
  lowestScore: { score: number; studentName: string; studentId: string };
  averageAttendance: number;
  averageStudyHours: number;
  studentsNeedingSupportCount: number;
  attendancePerformanceCorrelation: number; // Pearson r
  studyHoursPerformanceCorrelation: number; // Pearson r
  subjectAverages: SubjectAnalytics[];
  gradeDistribution: {
    grade: string;
    label: string;
    min: number;
    max: number;
    count: number;
    percentage: number;
    color: string;
  }[];
  examComparison: {
    previousAvg: number;
    currentAvg: number;
    overallDelta: number;
    improvedCount: number;
    declinedCount: number;
    unchangedCount: number;
  };
}

export interface AIInsightData {
  executiveSummary: string;
  strugglingSubjects: {
    subject: string;
    issue: string;
    affectedPercentage: number;
    rootCauseAnalysis: string;
  }[];
  trendExplanation: string;
  classroomInterventions: {
    title: string;
    targetGroup: string;
    actionSteps: string[];
  }[];
  pedagogicalRecommendations: string[];
}

export interface StudentStudyPlan {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  weeklyStudyTimetable: {
    day: string;
    focus: string;
    durationHours: number;
    activity: string;
  }[];
  actionableTips: string[];
}

export interface CSVImportResult {
  validStudents: Student[];
  errors: { row: number; field: string; message: string; rawData?: any }[];
  warnings: string[];
}
