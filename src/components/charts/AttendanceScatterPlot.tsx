import React, { useState } from 'react';
import { Student, AppSettings } from '../../types';
import { calculateStudentMetrics } from '../../utils/analytics';

interface AttendanceScatterPlotProps {
  students: Student[];
  settings: AppSettings;
  correlation: number;
  onSelectStudent?: (student: Student) => void;
}

export const AttendanceScatterPlot: React.FC<AttendanceScatterPlotProps> = ({
  students,
  settings,
  correlation,
  onSelectStudent,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    student: Student;
    avg: number;
    x: number;
    y: number;
  } | null>(null);

  if (!students || students.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No student data available.
      </div>
    );
  }

  const width = 460;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Domain for attendance: 50% to 100%
  const minAtt = 50;
  const maxAtt = 100;
  // Domain for scores: 30% to 100%
  const minScore = 30;
  const maxScore = 100;

  const getX = (attendance: number) => {
    const clamped = Math.max(minAtt, Math.min(maxAtt, attendance));
    return paddingLeft + ((clamped - minAtt) / (maxAtt - minAtt)) * chartW;
  };

  const getY = (score: number) => {
    const clamped = Math.max(minScore, Math.min(maxScore, score));
    return paddingTop + chartH - ((clamped - minScore) / (maxScore - minScore)) * chartH;
  };

  // Compute linear regression line (y = mx + b)
  const studentPoints = students.map((s) => {
    const metrics = calculateStudentMetrics(s, settings);
    return {
      student: s,
      xVal: s.attendance,
      yVal: metrics.averageMarks,
      px: getX(s.attendance),
      py: getY(metrics.averageMarks),
      metrics,
    };
  });

  const n = studentPoints.length;
  let lineX1 = getX(minAtt);
  let lineY1 = getY(minScore);
  let lineX2 = getX(maxAtt);
  let lineY2 = getY(maxScore);

  if (n > 1) {
    const sumX = studentPoints.reduce((acc, p) => acc + p.xVal, 0);
    const sumY = studentPoints.reduce((acc, p) => acc + p.yVal, 0);
    const sumXY = studentPoints.reduce((acc, p) => acc + p.xVal * p.yVal, 0);
    const sumX2 = studentPoints.reduce((acc, p) => acc + p.xVal * p.xVal, 0);

    const denom = n * sumX2 - sumX * sumX;
    if (denom !== 0) {
      const slope = (n * sumXY - sumX * sumY) / denom;
      const intercept = (sumY - slope * sumX) / n;

      const predY1 = slope * minAtt + intercept;
      const predY2 = slope * maxAtt + intercept;

      lineY1 = getY(predY1);
      lineY2 = getY(predY2);
    }
  }

  return (
    <div className="relative w-full">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mb-2 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Student Mark
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-indigo-400"></span> Regression Line
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-medium border border-slate-700">
            r = {correlation > 0 ? `+${correlation}` : correlation}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ({correlation >= 0.5 ? 'Moderate/Strong' : 'Weak'} association)
          </span>
        </div>
      </div>

      <div className="relative h-64 w-full">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          {/* Y Axis Grid lines */}
          {[40, 60, 80, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.3)"
                  strokeDasharray="3 3"
                />
                <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="10">
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* X Axis Grid lines */}
          {[50, 60, 70, 80, 90, 100].map((tick) => {
            const x = getX(tick);
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke="rgba(51, 65, 85, 0.2)"
                  strokeDasharray="2 2"
                />
                <text x={x} y={height - paddingBottom + 16} textAnchor="middle" fill="#64748b" fontSize="10">
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={paddingLeft + chartW / 2}
            y={height - 6}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
            fontWeight="500"
          >
            Attendance Rate (%)
          </text>
          <text
            x={14}
            y={paddingTop + chartH / 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
            fontWeight="500"
            transform={`rotate(-90 14 ${paddingTop + chartH / 2})`}
          >
            Score (%)
          </text>

          {/* Linear Trend Line */}
          <line
            x1={lineX1}
            y1={lineY1}
            x2={lineX2}
            y2={lineY2}
            stroke="#818cf8"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity="0.85"
          />

          {/* Data Points */}
          {studentPoints.map((pt) => {
            const isHovered = hoveredPoint?.student.id === pt.student.id;
            let pointColor = '#38bdf8'; // sky
            if (pt.metrics.averageMarks >= 80) pointColor = '#34d399'; // green
            else if (pt.metrics.averageMarks < 50) pointColor = '#f87171'; // red

            return (
              <g
                key={pt.student.id}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() =>
                  setHoveredPoint({
                    student: pt.student,
                    avg: pt.metrics.averageMarks,
                    x: pt.px,
                    y: pt.py,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => onSelectStudent && onSelectStudent(pt.student)}
              >
                {isHovered && (
                  <circle
                    cx={pt.px}
                    cy={pt.py}
                    r="12"
                    fill={pointColor}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={pt.px}
                  cy={pt.py}
                  r={isHovered ? 7 : 5}
                  fill={pointColor}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-transform duration-200"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs z-10 backdrop-blur pointer-events-none min-w-[170px]">
            <p className="font-semibold text-white border-b border-slate-800 pb-1 mb-1">
              {hoveredPoint.student.name}
            </p>
            <div className="space-y-0.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">ID:</span>
                <span className="font-mono text-cyan-300">{hoveredPoint.student.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Score:</span>
                <span className="font-mono font-bold text-white">{hoveredPoint.avg}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attendance:</span>
                <span className="font-mono text-emerald-400">{hoveredPoint.student.attendance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Study Hours:</span>
                <span className="font-mono text-amber-300">{hoveredPoint.student.dailyStudyHours} hrs/d</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 italic">Click point to view profile</p>
          </div>
        )}
      </div>
    </div>
  );
};
