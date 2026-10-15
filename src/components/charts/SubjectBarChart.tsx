import React, { useState } from 'react';
import { SubjectAnalytics } from '../../types';

interface SubjectBarChartProps {
  subjects: SubjectAnalytics[];
  classAverage: number;
}

export const SubjectBarChart: React.FC<SubjectBarChartProps> = ({
  subjects,
  classAverage,
}) => {
  const [hoveredSubject, setHoveredSubject] = useState<SubjectAnalytics | null>(null);

  if (!subjects || subjects.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No subject data available.
      </div>
    );
  }

  const height = 220;
  const paddingBottom = 40;
  const chartHeight = height - paddingBottom;

  const colors = [
    { bg: 'from-blue-600 to-cyan-500', bar: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
    { bg: 'from-indigo-600 to-blue-500', bar: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
    { bg: 'from-teal-600 to-emerald-500', bar: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)' },
  ];

  return (
    <div className="relative w-full">
      {/* Legend & Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Subject Average
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-amber-400"></span> Class Avg ({classAverage}%)
          </span>
        </div>
        <span className="text-slate-400 hidden sm:inline">Benchmark Target: 70%</span>
      </div>

      <div className="relative h-60 w-full">
        {/* SVG Chart */}
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gridLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.6" />
            </linearGradient>
            {colors.map((c, idx) => (
              <linearGradient key={idx} id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.bar} stopOpacity="0.9" />
                <stop offset="100%" stopColor={c.bar} stopOpacity="0.4" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines (20%, 40%, 60%, 80%, 100%) */}
          {[20, 40, 60, 80, 100].map((tick) => {
            const y = chartHeight - (tick / 100) * chartHeight;
            return (
              <g key={tick}>
                <line x1="40" y1={y} x2="390" y2={y} stroke="rgba(51, 65, 85, 0.3)" strokeDasharray="3 3" />
                <text x="32" y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="sans-serif">
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Class Average Reference Line */}
          {classAverage > 0 && (
            <g>
              <line
                x1="40"
                y1={chartHeight - (classAverage / 100) * chartHeight}
                x2="390"
                y2={chartHeight - (classAverage / 100) * chartHeight}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </g>
          )}

          {/* Subject Bars */}
          {subjects.map((sub, idx) => {
            const barWidth = 52;
            const groupWidth = (390 - 40) / subjects.length;
            const x = 40 + idx * groupWidth + (groupWidth - barWidth) / 2;
            const barHeight = Math.max(4, (sub.average / 100) * chartHeight);
            const y = chartHeight - barHeight;
            const color = colors[idx % colors.length];

            return (
              <g
                key={sub.subject}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredSubject(sub)}
                onMouseLeave={() => setHoveredSubject(null)}
              >
                {/* Background column highlight on hover */}
                {hoveredSubject?.subject === sub.subject && (
                  <rect
                    x={x - 10}
                    y={0}
                    width={barWidth + 20}
                    height={chartHeight}
                    fill="rgba(56, 189, 248, 0.06)"
                    rx="6"
                  />
                )}

                {/* The Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={`url(#barGrad-${idx})`}
                  stroke={color.bar}
                  strokeWidth="1.5"
                  rx="6"
                  className="transition-all duration-300 hover:brightness-125"
                />

                {/* Score text on top */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="12"
                  fontWeight="600"
                >
                  {sub.average}%
                </text>

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 14}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="500"
                >
                  {sub.subject.length > 12 ? sub.code : sub.subject}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredSubject && (
          <div className="absolute top-2 right-4 bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs z-10 backdrop-blur pointer-events-none min-w-[160px]">
            <p className="font-semibold text-white mb-1 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>{hoveredSubject.subject}</span>
              <span className="text-cyan-400 font-mono">{hoveredSubject.average}%</span>
            </p>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Median:</span>
                <span className="font-mono text-white">{hoveredSubject.median}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Highest:</span>
                <span className="font-mono text-emerald-400">{hoveredSubject.highest}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lowest:</span>
                <span className="font-mono text-rose-400">{hoveredSubject.lowest}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Passing Rate:</span>
                <span className="font-mono text-cyan-300">{hoveredSubject.passingRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Std Deviation:</span>
                <span className="font-mono text-slate-300">±{hoveredSubject.stdDev}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
