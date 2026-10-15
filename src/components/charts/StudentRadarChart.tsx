import React from 'react';
import { Student, ClassAnalytics } from '../../types';

interface StudentRadarChartProps {
  student: Student;
  classAnalytics: ClassAnalytics;
}

export const StudentRadarChart: React.FC<StudentRadarChartProps> = ({
  student,
  classAnalytics,
}) => {
  const size = 260;
  const center = size / 2;
  const radius = 95;

  // 5 dimensions: Math, Physics, Computer Science, Attendance, Study Consistency
  const studyHoursScore = Math.min(100, (student.dailyStudyHours / 5) * 100);
  const classStudyScore = Math.min(100, (classAnalytics.averageStudyHours / 5) * 100);

  const axes = [
    { label: 'Math', studentVal: student.mathMarks, classVal: classAnalytics.subjectAverages[0]?.average || 70 },
    { label: 'Physics', studentVal: student.physicsMarks, classVal: classAnalytics.subjectAverages[1]?.average || 70 },
    { label: 'Comp Sci', studentVal: student.csMarks, classVal: classAnalytics.subjectAverages[2]?.average || 70 },
    { label: 'Attendance', studentVal: student.attendance, classVal: classAnalytics.averageAttendance || 80 },
    { label: 'Study Hab.', studentVal: studyHoursScore, classVal: classStudyScore || 60 },
  ];

  const totalAxes = axes.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (Math.max(10, Math.min(100, value)) / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const studentPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(axis.studentVal, i);
      return `${x},${y}`;
    })
    .join(' ');

  const classPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(axis.classVal, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4 text-xs mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-400"></span> Student Profile
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400"></span> Class Average
        </span>
      </div>

      <svg width={size} height={size} className="overflow-visible">
        {/* Background Concentric Polygons */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => {
          const points = axes
            .map((_, i) => {
              const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
              const r = radius * level;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={level === 1.0 ? 'none' : '2 2'}
              opacity="0.6"
            />
          );
        })}

        {/* Axis Spokes & Labels */}
        {axes.map((axis, i) => {
          const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
          const endX = center + radius * Math.cos(angle);
          const endY = center + radius * Math.sin(angle);

          const labelDist = radius + 22;
          const labelX = center + labelDist * Math.cos(angle);
          const labelY = center + labelDist * Math.sin(angle);

          return (
            <g key={axis.label}>
              <line x1={center} y1={center} x2={endX} y2={endY} stroke="#334155" strokeWidth="1" />
              <text
                x={labelX}
                y={labelY + 4}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="600"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Class Average Polygon */}
        <polygon
          points={classPoints}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.75"
        />

        {/* Student Polygon */}
        <polygon
          points={studentPoints}
          fill="rgba(6, 182, 212, 0.25)"
          stroke="#06b6d4"
          strokeWidth="2.5"
        />

        {/* Student Data Markers */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(axis.studentVal, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#06b6d4"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
};
