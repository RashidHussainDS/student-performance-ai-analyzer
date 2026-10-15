import {
  Student,
  AppSettings,
  CalculatedStudentMetrics,
  ClassAnalytics,
  SupportFlag,
  SubjectAnalytics,
} from '../types';

/**
 * Calculates individual student metrics including averages, grade, delta, and rule-based support flags.
 */
export function calculateStudentMetrics(
  student: Student,
  settings: AppSettings,
  allStudents?: Student[]
): CalculatedStudentMetrics {
  const max = settings.maxScore || 100;
  const mathPct = (student.mathMarks / max) * 100;
  const physicsPct = (student.physicsMarks / max) * 100;
  const csPct = (student.csMarks / max) * 100;

  // Transparent scoring: equal average of the 3 core subject percentages
  const averageMarks = Number(((mathPct + physicsPct + csPct) / 3).toFixed(1));
  const examDelta = Number((averageMarks - student.previousExamScore).toFixed(1));

  let grade = 'F';
  let gradePoints = 0.0;
  if (averageMarks >= 90) {
    grade = 'A+';
    gradePoints = 4.0;
  } else if (averageMarks >= 80) {
    grade = 'A';
    gradePoints = 3.7;
  } else if (averageMarks >= 70) {
    grade = 'B';
    gradePoints = 3.0;
  } else if (averageMarks >= 60) {
    grade = 'C';
    gradePoints = 2.0;
  } else if (averageMarks >= 50) {
    grade = 'D';
    gradePoints = 1.0;
  } else {
    grade = 'F';
    gradePoints = 0.0;
  }

  let performanceCategory: 'high_achiever' | 'average' | 'needs_support' = 'average';
  if (averageMarks >= 80) {
    performanceCategory = 'high_achiever';
  } else if (averageMarks < settings.lowScoreThreshold) {
    performanceCategory = 'needs_support';
  }

  // Identify highest and lowest subjects
  const subjectList = [
    { name: 'Mathematics', score: student.mathMarks },
    { name: 'Physics', score: student.physicsMarks },
    { name: 'Computer Science', score: student.csMarks },
  ];
  subjectList.sort((a, b) => b.score - a.score);
  const highestSubject = subjectList[0];
  const lowestSubject = subjectList[subjectList.length - 1];

  // Rule-based transparent support flags
  const supportFlags: SupportFlag[] = [];

  // Flag 1: Low Academic Score
  if (averageMarks < settings.lowScoreThreshold) {
    supportFlags.push({
      id: `${student.id}-low-grade`,
      type: 'low_grade',
      severity: 'critical',
      title: 'Academic Support Recommended',
      reason: `Current average score of ${averageMarks}% is below the configured threshold of ${settings.lowScoreThreshold}%.`,
      status: 'active',
      thresholdValue: settings.lowScoreThreshold,
      actualValue: averageMarks,
    });
  }

  // Flag 2: Attendance below threshold
  if (student.attendance < settings.lowAttendanceThreshold) {
    supportFlags.push({
      id: `${student.id}-low-att`,
      type: 'low_attendance',
      severity: student.attendance < 65 ? 'critical' : 'warning',
      title: 'Attendance Follow-up Recommended',
      reason: `Recorded attendance is ${student.attendance}%, below the minimum expected ${settings.lowAttendanceThreshold}%.`,
      status: 'active',
      thresholdValue: settings.lowAttendanceThreshold,
      actualValue: student.attendance,
    });
  }

  // Flag 3: Severe decline from previous exam
  if (student.previousExamScore - averageMarks >= settings.examDropThreshold) {
    const drop = Number((student.previousExamScore - averageMarks).toFixed(1));
    supportFlags.push({
      id: `${student.id}-exam-drop`,
      type: 'exam_drop',
      severity: drop >= 15 ? 'critical' : 'warning',
      title: 'Performance Drop Review',
      reason: `Score dropped by ${drop}% compared to the previous examination (${student.previousExamScore}% → ${averageMarks}%).`,
      status: 'active',
      thresholdValue: settings.examDropThreshold,
      actualValue: drop,
    });
  }

  // Flag 4: Low daily study hours
  if (student.dailyStudyHours < settings.lowStudyHoursThreshold) {
    supportFlags.push({
      id: `${student.id}-low-study`,
      type: 'low_study_time',
      severity: 'info',
      title: 'Low Independent Study Time',
      reason: `Reports ${student.dailyStudyHours} hrs/day of study, which is below the recommended ${settings.lowStudyHoursThreshold} hrs/day benchmark.`,
      status: 'active',
      thresholdValue: settings.lowStudyHoursThreshold,
      actualValue: student.dailyStudyHours,
    });
  }

  let rank: number | undefined;
  let percentile: number | undefined;

  if (allStudents && allStudents.length > 0) {
    const allAverages = allStudents
      .map((s) => ((s.mathMarks + s.physicsMarks + s.csMarks) / 3 / max) * 100)
      .sort((a, b) => b - a);

    const pos = allAverages.findIndex((val) => val <= averageMarks);
    rank = pos >= 0 ? pos + 1 : allAverages.length;
    const belowCount = allAverages.filter((val) => val < averageMarks).length;
    percentile = Math.round((belowCount / allStudents.length) * 100);
  }

  return {
    averageMarks,
    examDelta,
    grade,
    gradePoints,
    performanceCategory,
    highestSubject,
    lowestSubject,
    supportFlags,
    rank,
    percentile,
  };
}

/**
 * Calculates comprehensive cohort analytics from the active student dataset.
 */
export function calculateClassAnalytics(
  students: Student[],
  settings: AppSettings
): ClassAnalytics {
  if (students.length === 0) {
    return getEmptyAnalytics();
  }

  const max = settings.maxScore || 100;
  const metricsList = students.map((s) => ({
    student: s,
    metrics: calculateStudentMetrics(s, settings),
  }));

  const averages = metricsList.map((m) => m.metrics.averageMarks);
  const attendances = students.map((s) => s.attendance);
  const studyHours = students.map((s) => s.dailyStudyHours);
  const previousScores = students.map((s) => s.previousExamScore);

  // Mean calculation
  const totalStudents = students.length;
  const sumAverage = averages.reduce((acc, curr) => acc + curr, 0);
  const classAverage = Number((sumAverage / totalStudents).toFixed(1));

  // Median calculation
  const sortedAverages = [...averages].sort((a, b) => a - b);
  const mid = Math.floor(sortedAverages.length / 2);
  const medianScore =
    sortedAverages.length % 2 !== 0
      ? sortedAverages[mid]
      : Number(((sortedAverages[mid - 1] + sortedAverages[mid]) / 2).toFixed(1));

  // Standard Deviation
  const variance =
    averages.reduce((acc, val) => acc + Math.pow(val - classAverage, 2), 0) /
    totalStudents;
  const standardDeviation = Number(Math.sqrt(variance).toFixed(1));

  // Highest and Lowest Achievers
  let highestItem = metricsList[0];
  let lowestItem = metricsList[0];
  for (const item of metricsList) {
    if (item.metrics.averageMarks > highestItem.metrics.averageMarks) {
      highestItem = item;
    }
    if (item.metrics.averageMarks < lowestItem.metrics.averageMarks) {
      lowestItem = item;
    }
  }

  // Attendance average
  const avgAttendance = Number(
    (attendances.reduce((acc, a) => acc + a, 0) / totalStudents).toFixed(1)
  );

  // Study hours average
  const avgStudyHours = Number(
    (studyHours.reduce((acc, h) => acc + h, 0) / totalStudents).toFixed(1)
  );

  // Support needed count: any student with active critical/warning flags or avg < lowScoreThreshold
  const studentsNeedingSupportCount = metricsList.filter(
    (m) =>
      m.metrics.performanceCategory === 'needs_support' ||
      m.metrics.supportFlags.some(
        (f) => f.severity === 'critical' || f.type === 'low_attendance'
      )
  ).length;

  // Pearson Correlation (Attendance vs Performance)
  const attendancePerformanceCorrelation = calculatePearsonCorrelation(
    attendances,
    averages
  );

  // Pearson Correlation (Study Hours vs Performance)
  const studyHoursPerformanceCorrelation = calculatePearsonCorrelation(
    studyHours,
    averages
  );

  // Subject-specific analytics
  const subjectAverages = [
    computeSubjectAnalytics('Mathematics', 'MATH', students.map((s) => (s.mathMarks / max) * 100), settings),
    computeSubjectAnalytics('Physics', 'PHYS', students.map((s) => (s.physicsMarks / max) * 100), settings),
    computeSubjectAnalytics('Computer Science', 'CS', students.map((s) => (s.csMarks / max) * 100), settings),
  ];

  // Grade Distribution Histogram
  const gradeDistribution = [
    { grade: 'A+', label: '90 - 100%', min: 90, max: 100, count: 0, percentage: 0, color: '#06b6d4' },
    { grade: 'A', label: '80 - 89%', min: 80, max: 89.9, count: 0, percentage: 0, color: '#3b82f6' },
    { grade: 'B', label: '70 - 79%', min: 70, max: 79.9, count: 0, percentage: 0, color: '#6366f1' },
    { grade: 'C', label: '60 - 69%', min: 60, max: 69.9, count: 0, percentage: 0, color: '#f59e0b' },
    { grade: 'D', label: '50 - 59%', min: 50, max: 59.9, count: 0, percentage: 0, color: '#f97316' },
    { grade: 'F', label: '< 50%', min: 0, max: 49.9, count: 0, percentage: 0, color: '#ef4444' },
  ];

  for (const avg of averages) {
    if (avg >= 90) gradeDistribution[0].count++;
    else if (avg >= 80) gradeDistribution[1].count++;
    else if (avg >= 70) gradeDistribution[2].count++;
    else if (avg >= 60) gradeDistribution[3].count++;
    else if (avg >= 50) gradeDistribution[4].count++;
    else gradeDistribution[5].count++;
  }

  for (const g of gradeDistribution) {
    g.percentage = Number(((g.count / totalStudents) * 100).toFixed(1));
  }

  // Previous vs Current Exam comparison
  const prevAvg = Number(
    (previousScores.reduce((acc, p) => acc + p, 0) / totalStudents).toFixed(1)
  );
  let improvedCount = 0;
  let declinedCount = 0;
  let unchangedCount = 0;

  for (const m of metricsList) {
    if (m.metrics.examDelta > 0.5) improvedCount++;
    else if (m.metrics.examDelta < -0.5) declinedCount++;
    else unchangedCount++;
  }

  return {
    totalStudents,
    classAverage,
    medianScore,
    standardDeviation,
    highestScore: {
      score: highestItem.metrics.averageMarks,
      studentName: highestItem.student.name,
      studentId: highestItem.student.id,
    },
    lowestScore: {
      score: lowestItem.metrics.averageMarks,
      studentName: lowestItem.student.name,
      studentId: lowestItem.student.id,
    },
    averageAttendance: avgAttendance,
    averageStudyHours: avgStudyHours,
    studentsNeedingSupportCount,
    attendancePerformanceCorrelation,
    studyHoursPerformanceCorrelation,
    subjectAverages,
    gradeDistribution,
    examComparison: {
      previousAvg: prevAvg,
      currentAvg: classAverage,
      overallDelta: Number((classAverage - prevAvg).toFixed(1)),
      improvedCount,
      declinedCount,
      unchangedCount,
    },
  };
}

/**
 * Computes statistical metrics for a single subject.
 */
function computeSubjectAnalytics(
  subject: string,
  code: string,
  scores: number[],
  settings: AppSettings
): SubjectAnalytics {
  const n = scores.length;
  if (n === 0) {
    return { subject, code, average: 0, median: 0, stdDev: 0, highest: 0, lowest: 0, passingRate: 0, strugglingCount: 0 };
  }

  const sum = scores.reduce((acc, s) => acc + s, 0);
  const average = Number((sum / n).toFixed(1));

  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));

  const variance = scores.reduce((acc, s) => acc + Math.pow(s - average, 2), 0) / n;
  const stdDev = Number(Math.sqrt(variance).toFixed(1));

  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  const passing = scores.filter((s) => s >= settings.lowScoreThreshold).length;
  const passingRate = Number(((passing / n) * 100).toFixed(1));
  const strugglingCount = scores.filter((s) => s < settings.lowScoreThreshold).length;

  return {
    subject,
    code,
    average,
    median,
    stdDev,
    highest,
    lowest,
    passingRate,
    strugglingCount,
  };
}

/**
 * Calculates Pearson Correlation Coefficient r between two numerical arrays.
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2 || x.length !== y.length) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  return Number((numerator / denominator).toFixed(2));
}

/**
 * Returns plain-English interpretation of Pearson correlation with non-causation disclaimer.
 */
export function interpretCorrelation(r: number): {
  strength: string;
  interpretation: string;
  educationalDisclaimer: string;
} {
  let strength = 'negligible';
  if (Math.abs(r) >= 0.7) strength = 'strong';
  else if (Math.abs(r) >= 0.4) strength = 'moderate';
  else if (Math.abs(r) >= 0.2) strength = 'weak';

  const direction = r > 0 ? 'positive' : r < 0 ? 'negative' : 'neutral';

  const interpretation =
    r === 0
      ? 'No apparent linear association detected between attendance and academic performance.'
      : `Shows a ${strength} ${direction} linear association (r = ${r}). Higher lecture attendance generally aligns with improved overall test marks in this cohort.`;

  const educationalDisclaimer =
    'Important Academic Note: Correlation measures statistical association, NOT causation. Improved marks are also influenced by prior preparation, active note-taking, teacher feedback, and sleep quality, rather than physical seat presence alone.';

  return { strength, interpretation, educationalDisclaimer };
}

function getEmptyAnalytics(): ClassAnalytics {
  return {
    totalStudents: 0,
    classAverage: 0,
    medianScore: 0,
    standardDeviation: 0,
    highestScore: { score: 0, studentName: 'N/A', studentId: 'N/A' },
    lowestScore: { score: 0, studentName: 'N/A', studentId: 'N/A' },
    averageAttendance: 0,
    averageStudyHours: 0,
    studentsNeedingSupportCount: 0,
    attendancePerformanceCorrelation: 0,
    studyHoursPerformanceCorrelation: 0,
    subjectAverages: [],
    gradeDistribution: [],
    examComparison: {
      previousAvg: 0,
      currentAvg: 0,
      overallDelta: 0,
      improvedCount: 0,
      declinedCount: 0,
      unchangedCount: 0,
    },
  };
}
