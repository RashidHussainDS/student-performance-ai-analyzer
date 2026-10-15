import React from 'react';
import { Student, AppSettings } from '../../types';
import { calculateStudentMetrics } from '../../utils/analytics';

interface ExamTrendChartProps {
  students: Student[];
  settings: AppSettings;
}

export const ExamTrendChart: React.FC<ExamTrendChartProps> = ({
  students,
  settings,
}) => {
  if (!students || students.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No examination trend data available.
      </div>
    );
  }

  // Group students by Class/Semester
  const classMap = new Map<
    string,
    { prevTotal: number; currTotal: number; count: number }
  >();

  for (const s of students) {
    const cls = s.classSemester || 'General';
    const metrics = calculateStudentMetrics(s, settings);
    const existing = classMap.get(cls) || { prevTotal: 0, currTotal: 0, count: 0 };
    existing.prevTotal += s.previousExamScore;
    existing.currTotal += metrics.averageMarks;
    existing.count += 1;
    classMap.set(cls, existing);
  }

  const cohorts = Array.from(classMap.entries()).map(([name, data]) => ({
    name,
    prevAvg: Number((data.prevTotal / data.count).toFixed(1)),
    currAvg: Number((data.currTotal / data.count).toFixed(1)),
    delta: Number(((data.currTotal - data.prevTotal) / data.count).toFixed(1)),
    count: data.count,
  }));

  const height = 220;
  const paddingBottom = 45;
  const chartHeight = height - paddingBottom;
  const startX = 50;
  const chartWidth = 380;
  const stepX = cohorts.length > 0 ? (chartWidth - startX) / cohorts.length : 100;
  const barW = 24;

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-500"></span> Previous Exam
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400"></span> Current Exam ({settings.examName.split(' ')[0]})
          </span>
        </div>
        <span className="text-slate-400 hidden sm:inline">Cohort Trajectory</span>
      </div>

      <div className="relative h-60 w-full">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 220" preserveAspectRatio="none">
          {/* Horizontal lines */}
          {[20, 40, 60, 80, 100].map((tick) => {
            const y = chartHeight - (tick / 100) * chartHeight;
            return (
              <g key={tick}>
                <line x1="40" y1={y} x2="390" y2={y} stroke="rgba(51, 65, 85, 0.3)" strokeDasharray="3 3" />
                <text x="32" y={y + 3} textAnchor="end" fill="#64748b" fontSize="10">
                  {tick}%
                </text>
              </g>
            );
          })}

          {cohorts.map((cohort, idx) => {
            const center = startX + idx * stepX + stepX / 2;
            const xPrev = center - barW - 2;
            const xCurr = center + 2;

            const hPrev = (cohort.prevAvg / 100) * chartHeight;
            const yPrev = chartHeight - hPrev;

            const hCurr = (cohort.currAvg / 100) * chartHeight;
            const yCurr = chartHeight - hCurr;

            const isPositive = cohort.delta >= 0;

            return (
              <g key={cohort.name} className="group">
                {/* Previous bar */}
                <rect
                  x={xPrev}
                  y={yPrev}
                  width={barW}
                  height={hPrev}
                  fill="#475569"
                  rx="4"
                  className="transition-all duration-300 group-hover:brightness-110"
                />
                <text
                  x={xPrev + barW / 2}
                  y={yPrev - 6}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="500"
                >
                  {cohort.prevAvg}%
                </text>

                {/* Current bar */}
                <rect
                  x={xCurr}
                  y={yCurr}
                  width={barW}
                  height={hCurr}
                  fill="#06b6d4"
                  rx="4"
                  className="transition-all duration-300 group-hover:brightness-125"
                />
                <text
                  x={xCurr + barW / 2}
                  y={yCurr - 6}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="700"
                >
                  {cohort.currAvg}%
                </text>

                {/* Delta badge */}
                <rect
                  x={center - 16}
                  y={Math.min(yPrev, yCurr) - 22}
                  width="32"
                  height="14"
                  rx="7"
                  fill={isPositive ? '#065f46' : '#881337'}
                  opacity="0.9"
                />
                <text
                  x={center}
                  y={Math.min(yPrev, yCurr) - 12}
                  textAnchor="middle"
                  fill={isPositive ? '#34d399' : '#f87171'}
                  fontSize="9"
                  fontWeight="600"
                >
                  {isPositive ? `+${cohort.delta}` : cohort.delta}
                </text>

                {/* Cohort Name */}
                <text
                  x={center}
                  y={height - 18}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight="500"
                >
                  {cohort.name.length > 14 ? cohort.name.slice(0, 12) + '...' : cohort.name}
                </text>
                <text
                  x={center}
                  y={height - 6}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                >
                  ({cohort.count} students)
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
