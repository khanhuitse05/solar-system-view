import { useMemo } from 'react';
import type { AltitudePoint } from '../types';

type Props = {
  data: AltitudePoint[];
  currentTimeMs: number;
};

export function VisibilityChart({ data, currentTimeMs }: Props) {
  const points = useMemo(() => {
    if (data.length === 0) return '';
    const startTime = data[0].timeMs;
    const endTime = data[data.length - 1].timeMs;
    const duration = endTime - startTime;

    return data
      .map((d) => {
        const x = ((d.timeMs - startTime) / duration) * 300;
        // Map altitude -90 to +90 into Y 150 to 0
        const y = 150 - ((d.altitudeDeg + 90) / 180) * 150;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data]);

  const fillPoints = useMemo(() => {
    if (!points || data.length === 0) return '';
    return `${points} 300,150 0,150`;
  }, [points, data]);

  if (data.length === 0) return null;

  const startTime = data[0].timeMs;
  const endTime = data[data.length - 1].timeMs;
  const duration = endTime - startTime;

  // "Now" line X coordinate
  const nowX = Math.max(0, Math.min(300, ((currentTimeMs - startTime) / duration) * 300));

  // Helper to calculate X for a specific hour relative to start
  const getHourX = (hourOffset: number) => {
    const totalHours = duration / (3600 * 1000);
    return (hourOffset / totalHours) * 300;
  };

  const startHour = new Date(startTime).getHours();
  // Find intervals of 6 hours for grid lines
  const gridLinesX = [];
  for (let i = 0; i <= 24; i += 6) {
    gridLinesX.push({
      x: getHourX(i),
      label: `${(startHour + i) % 24}:00`.padStart(5, '0'),
    });
  }

  // Y = 150 - ((alt + 90) / 180) * 150
  const y90 = 150 - ((90 + 90) / 180) * 150;   // 0
  const y15 = 150 - ((15 + 90) / 180) * 150;   // 62.5
  const y0 = 150 - ((0 + 90) / 180) * 150;     // 75
  const yMinus60 = 150 - ((-60 + 90) / 180) * 150; // 125

  return (
    <div className="w-full font-mono text-[10px] text-slate-400">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
        <svg 
          viewBox="0 -10 320 180" 
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
        >
          {/* Chart Background */}
          <rect x="25" y="0" width="295" height="150" fill="#0f172a" fillOpacity="0.4" />

          {/* Grid Lines - Horizontal */}
          <line x1="25" y1={y90} x2="320" y2={y90} stroke="#334155" strokeWidth="0.5" />
          <line x1="25" y1={y15} x2="320" y2={y15} stroke="#334155" strokeWidth="0.5" />
          <line x1="25" y1={yMinus60} x2="320" y2={yMinus60} stroke="#334155" strokeWidth="0.5" />

          {/* Horizon Line (0 deg) */}
          <line x1="25" y1={y0} x2="320" y2={y0} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

          {/* Grid Lines - Vertical & X-axis Labels */}
          {gridLinesX.map((line, idx) => (
            <g key={idx}>
              <line x1={25 + line.x * (295/300)} y1="0" x2={25 + line.x * (295/300)} y2="150" stroke="#334155" strokeWidth="0.5" />
              <text x={25 + line.x * (295/300)} y="165" fill="#94a3b8" textAnchor="middle" dominantBaseline="hanging">
                {line.label}
              </text>
            </g>
          ))}

          {/* Y-axis Labels */}
          <text x="20" y={y90} fill="#94a3b8" textAnchor="end" dominantBaseline="middle">+90°</text>
          <text x="20" y={y15} fill="#94a3b8" textAnchor="end" dominantBaseline="middle">+15°</text>
          <text x="20" y={yMinus60} fill="#94a3b8" textAnchor="end" dominantBaseline="middle">-60°</text>

          {/* Data Curve Area */}
          <polygon points={fillPoints.split(' ').map(p => { const [x,y] = p.split(','); return `${Number(x)*(295/300)+25},${y}`; }).join(' ')} fill="url(#gradient-cyan)" opacity="0.2" />

          {/* Data Curve Line */}
          <polyline points={points.split(' ').map(p => { const [x,y] = p.split(','); return `${Number(x)*(295/300)+25},${y}`; }).join(' ')} fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinejoin="round" />

          {/* "Now" Marker */}
          {nowX >= 0 && nowX <= 300 && (
            <g transform={`translate(${25 + nowX * (295/300)}, 0)`}>
              <line x1="0" y1="0" x2="0" y2="150" stroke="#f8fafc" strokeWidth="1" />
              <text x="4" y="8" fill="#f8fafc" fontSize="10" transform="rotate(90, 4, 8)">
                Now
              </text>
            </g>
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient-cyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
