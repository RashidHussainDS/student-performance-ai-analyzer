import React, { useState } from 'react';

interface GradeItem {
  grade: string;
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  color: string;
}

interface DistributionHistogramProps {
  distribution: GradeItem[];
  totalStudents: number;
}

export const DistributionHistogram: React.FC<DistributionHistogramProps> = ({
  distribution,
  totalStudents,
}) => {
  const [hoveredGrade, setHoveredGrade] = useState<GradeItem | null>(null);

  if (!distribution || distribution.length === 0 || totalStudents === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No distribution data available.
      </div>
    );
  }

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);
  const height = 220;
  const paddingBottom = 40;
  const chartHeight = height - paddingBottom;
  const barWidth = 38;
  const totalWidth = 380;
  const startX = 40;
  const stepX = (totalWidth - startX) / distribution.length;

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Frequency Distribution (Grades)
        </span>
        <span>Total Evaluated: {totalStudents}</span>
      </div>

      <div className="relative h-60 w-full">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 220" preserveAspectRatio="none">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const countVal = Math.round(ratio * maxCount);
            const y = chartHeight - ratio * chartHeight;
            return (
              <g key={ratio}>
                <line x1="36" y1={y} x2="390" y2={y} stroke="rgba(51, 65, 85, 0.3)" strokeDasharray="3 3" />
                <text x="28" y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">
                  {countVal}
                </text>
              </g>
            );
          })}

          {/* Histogram Bars */}
          {distribution.map((item, idx) => {
            const x = startX + idx * stepX + (stepX - barWidth) / 2;
            const barH = Math.max(3, (item.count / maxCount) * chartHeight);
            const y = chartHeight - barH;

            return (
              <g
                key={item.grade}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredGrade(item)}
                onMouseLeave={() => setHoveredGrade(null)}
              >
                {hoveredGrade?.grade === item.grade && (
                  <rect
                    x={x - 6}
                    y={0}
                    width={barWidth + 12}
                    height={chartHeight}
                    fill="rgba(59, 130, 246, 0.08)"
                    rx="4"
                  />
                )}

                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={item.color}
                  opacity={hoveredGrade && hoveredGrade.grade !== item.grade ? 0.45 : 0.85}
                  rx="4"
                  className="transition-all duration-200"
                />

                {/* Count label above bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight="600"
                >
                  {item.count}
                </text>

                {/* Grade label on X axis */}
                <text
                  x={x + barWidth / 2}
                  y={height - 22}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="600"
                >
                  {item.grade}
                </text>

                {/* Percentage label under grade */}
                <text
                  x={x + barWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                >
                  {item.percentage}%
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredGrade && (
          <div className="absolute top-2 right-4 bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs z-10 backdrop-blur pointer-events-none min-w-[150px]">
            <p className="font-semibold text-white mb-1 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>Grade {hoveredGrade.grade}</span>
              <span className="font-mono text-cyan-400">{hoveredGrade.label}</span>
            </p>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Count:</span>
                <span className="font-mono font-bold text-white">{hoveredGrade.count} students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Class Share:</span>
                <span className="font-mono text-cyan-300">{hoveredGrade.percentage}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
