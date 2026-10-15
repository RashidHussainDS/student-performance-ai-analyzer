import { Student, AppSettings, CSVImportResult } from '../types';
import { calculateStudentMetrics } from './analytics';

export const SAMPLE_CSV_HEADER =
  'StudentID,Name,ClassSemester,MathMarks,PhysicsMarks,CSMarks,AttendancePercent,DailyStudyHours,PreviousExamScore,Notes';

export function generateSampleCSV(): string {
  const sampleRows = [
    'STU-2001,Alexander Hayes,Sem 4 - CS (Sec A),88,82,90,92,3.5,84,Strong interest in systems architecture',
    'STU-2002,Beatriz Silva,Sem 4 - CS (Sec A),74,68,80,85,2.5,72,Good progress in Python lab',
    'STU-2003,Carlos Mendez,Sem 4 - CS (Sec B),45,52,58,68,1.5,60,Needs review on calculus prerequisites',
    'STU-2004,Daphne Vance,Sem 6 - SE,95,91,98,97,4.8,93,Consistently top tier in software testing',
    'STU-2005,Emre Yilmaz,Sem 6 - SE,62,55,70,72,2.0,75,Significant drop in physics midterm',
  ];
  return [SAMPLE_CSV_HEADER, ...sampleRows].join('\n');
}

export function downloadSampleCSVFile(): void {
  const content = generateSampleCSV();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'student_records_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Robust CSV parser that handles quotes, commas, and multi-line fields.
 */
function parseCSVRows(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      cell = '';
      if (row.length > 0 && row.some((c) => c !== '')) {
        lines.push(row);
      }
      row = [];
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c !== '')) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Validates and parses uploaded CSV file content into Student models.
 */
export function parseAndValidateCSV(
  csvContent: string,
  settings: AppSettings
): CSVImportResult {
  const rawRows = parseCSVRows(csvContent.trim());
  const maxScore = settings.maxScore || 100;

  if (rawRows.length < 2) {
    return {
      validStudents: [],
      errors: [
        {
          row: 1,
          field: 'file',
          message:
            'The CSV file is empty or missing data rows. Must contain a header row and at least one student record.',
        },
      ],
      warnings: [],
    };
  }

  const rawHeaders = rawRows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const headerMap: Record<string, number> = {};

  rawHeaders.forEach((header, index) => {
    if (header.includes('id') || header.includes('roll') || header.includes('studentno')) {
      headerMap['id'] = index;
    } else if (header.includes('name') || header.includes('studentname')) {
      headerMap['name'] = index;
    } else if (header.includes('class') || header.includes('semester') || header.includes('section')) {
      headerMap['class'] = index;
    } else if (header.includes('math')) {
      headerMap['math'] = index;
    } else if (header.includes('phys')) {
      headerMap['physics'] = index;
    } else if (header.includes('cs') || header.includes('comp') || header.includes('computer')) {
      headerMap['cs'] = index;
    } else if (header.includes('att') || header.includes('present')) {
      headerMap['attendance'] = index;
    } else if (header.includes('study') || header.includes('hour')) {
      headerMap['studyHours'] = index;
    } else if (header.includes('prev') || header.includes('past') || header.includes('last')) {
      headerMap['prevExam'] = index;
    } else if (header.includes('note') || header.includes('remark')) {
      headerMap['notes'] = index;
    }
  });

  const requiredFields = ['id', 'name', 'math', 'physics', 'cs', 'attendance'];
  const missingHeaders = requiredFields.filter((f) => headerMap[f] === undefined);

  if (missingHeaders.length > 0) {
    return {
      validStudents: [],
      errors: [
        {
          row: 1,
          field: 'headers',
          message: `Missing required column headers: ${missingHeaders.join(', ')}. Please use our downloadable CSV template.`,
        },
      ],
      warnings: [],
    };
  }

  const validStudents: Student[] = [];
  const errors: { row: number; field: string; message: string; rawData?: any }[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  for (let rowIndex = 1; rowIndex < rawRows.length; rowIndex++) {
    const row = rawRows[rowIndex];
    const rowNumber = rowIndex + 1;

    const id = row[headerMap['id']]?.trim();
    const name = row[headerMap['name']]?.trim();
    const classSemester =
      headerMap['class'] !== undefined && row[headerMap['class']]
        ? row[headerMap['class']].trim()
        : 'General CS';

    const rawMath = row[headerMap['math']];
    const rawPhys = row[headerMap['physics']];
    const rawCs = row[headerMap['cs']];
    const rawAtt = row[headerMap['attendance']];
    const rawHours = headerMap['studyHours'] !== undefined ? row[headerMap['studyHours']] : '2.5';
    const rawPrev = headerMap['prevExam'] !== undefined ? row[headerMap['prevExam']] : '70';
    const notes = headerMap['notes'] !== undefined ? row[headerMap['notes']] : '';

    if (!id) {
      errors.push({ row: rowNumber, field: 'StudentID', message: 'Student ID cannot be empty.' });
      continue;
    }
    if (seenIds.has(id)) {
      errors.push({ row: rowNumber, field: 'StudentID', message: `Duplicate Student ID '${id}' detected in file.` });
      continue;
    }
    seenIds.add(id);

    if (!name || name.length < 2) {
      errors.push({ row: rowNumber, field: 'Name', message: 'Student Name must be at least 2 characters long.' });
      continue;
    }

    const math = parseFloat(rawMath);
    const physics = parseFloat(rawPhys);
    const cs = parseFloat(rawCs);
    const attendance = parseFloat(rawAtt);
    const studyHours = parseFloat(rawHours);
    const prevExam = parseFloat(rawPrev);

    if (isNaN(math) || math < 0 || math > maxScore) {
      errors.push({
        row: rowNumber,
        field: 'MathMarks',
        message: `Mathematics mark must be a valid number between 0 and ${maxScore} (found: "${rawMath}").`,
      });
      continue;
    }
    if (isNaN(physics) || physics < 0 || physics > maxScore) {
      errors.push({
        row: rowNumber,
        field: 'PhysicsMarks',
        message: `Physics mark must be a valid number between 0 and ${maxScore} (found: "${rawPhys}").`,
      });
      continue;
    }
    if (isNaN(cs) || cs < 0 || cs > maxScore) {
      errors.push({
        row: rowNumber,
        field: 'CSMarks',
        message: `Computer Science mark must be a valid number between 0 and ${maxScore} (found: "${rawCs}").`,
      });
      continue;
    }
    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
      errors.push({
        row: rowNumber,
        field: 'AttendancePercent',
        message: `Attendance must be a percentage between 0 and 100 (found: "${rawAtt}").`,
      });
      continue;
    }
    if (isNaN(studyHours) || studyHours < 0 || studyHours > 24) {
      warnings.push(`Row ${rowNumber}: Daily study hours defaulted to 2.0 (found invalid value: "${rawHours}").`);
    }
    if (isNaN(prevExam) || prevExam < 0 || prevExam > 100) {
      warnings.push(`Row ${rowNumber}: Previous exam score defaulted to 70% (found invalid value: "${rawPrev}").`);
    }

    validStudents.push({
      id,
      name,
      classSemester,
      mathMarks: Math.round(math * 10) / 10,
      physicsMarks: Math.round(physics * 10) / 10,
      csMarks: Math.round(cs * 10) / 10,
      attendance: Math.round(attendance * 10) / 10,
      dailyStudyHours: isNaN(studyHours) || studyHours < 0 || studyHours > 24 ? 2.5 : Math.round(studyHours * 10) / 10,
      previousExamScore: isNaN(prevExam) || prevExam < 0 || prevExam > 100 ? 70 : Math.round(prevExam * 10) / 10,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    validStudents,
    errors,
    warnings,
  };
}

/**
 * Exports current student cohort data to CSV including analytical calculations.
 */
export function exportStudentsToCSV(
  students: Student[],
  settings: AppSettings
): void {
  const headers = [
    'Student ID',
    'Student Name',
    'Class / Semester',
    'Mathematics Marks',
    'Physics Marks',
    'Computer Science Marks',
    'Average Percentage',
    'Letter Grade',
    'Attendance %',
    'Daily Study Hours',
    'Previous Exam Score %',
    'Exam Delta %',
    'Performance Status',
    'Active Flags Count',
    'Flag Reasons',
    'Notes',
  ];

  const rows = students.map((s) => {
    const metrics = calculateStudentMetrics(s, settings, students);
    const flagReasons = metrics.supportFlags.map((f) => f.title).join('; ');

    return [
      `"${s.id}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.classSemester.replace(/"/g, '""')}"`,
      s.mathMarks,
      s.physicsMarks,
      s.csMarks,
      metrics.averageMarks,
      `"${metrics.grade}"`,
      s.attendance,
      s.dailyStudyHours,
      s.previousExamScore,
      metrics.examDelta > 0 ? `+${metrics.examDelta}` : metrics.examDelta,
      `"${metrics.performanceCategory}"`,
      metrics.supportFlags.length,
      `"${flagReasons.replace(/"/g, '""')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `student_performance_analytics_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
