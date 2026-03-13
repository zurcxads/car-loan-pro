// Simple SVG charts — Stripe Dashboard style, no external libraries
// All charts are responsive, clean, minimal

// Line Chart
interface LineChartData {
  label: string;
  value: number;
}

export function LineChart({ data, height = 240, color = '#3B82F6' }: { data: LineChartData[]; height?: number; color?: string }) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = 100; // percentage
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((d.value - minValue) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * ratio;
          return (
            <line
              key={i}
              x1={padding.left / 100 * 100}
              y1={y}
              x2={100 - padding.right}
              y2={y}
              stroke="rgba(0,0,0,0.06)"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Line path */}
        <polyline
          points={points.split(' ').map((p) => {
            const [x, y] = p.split(',').map(Number);
            return `${padding.left / 100 * 100 + x},${padding.top + y}`;
          }).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />

        {/* Data points */}
        {points.split(' ').map((p, index) => {
          const [x, y] = p.split(',').map(Number);
          return (
            <circle
              key={index}
              cx={padding.left / 100 * 100 + x}
              cy={padding.top + y}
              r="3"
              fill={color}
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-12 pb-2">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-gray-500">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// Bar Chart
interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({ data, height = 240, showValues = false }: { data: BarChartData[]; height?: number; showValues?: boolean }) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="relative w-full" style={{ height }}>
      <div className="flex items-end justify-around h-full pb-8 pt-4">
        {data.map((d, i) => {
          const heightPercent = (d.value / maxValue) * 100;
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
              <div className="w-full flex flex-col items-center">
                {showValues && <span className="text-[10px] text-gray-500 mb-1">{d.value}</span>}
                <div
                  className="w-full rounded-t-md transition-all duration-300"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: d.color || '#3B82F6',
                    minHeight: '4px'
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-500 text-center">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Stacked Bar Chart
interface StackedBarData {
  label: string;
  values: { name: string; value: number; color: string }[];
}

export function StackedBarChart({ data, height = 240 }: { data: StackedBarData[]; height?: number }) {
  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map(d => d.values.reduce((sum, v) => sum + v.value, 0)));

  return (
    <div className="relative w-full" style={{ height }}>
      <div className="flex items-end justify-around h-full pb-8 pt-4">
        {data.map((d, i) => {
          const total = d.values.reduce((sum, v) => sum + v.value, 0);
          const heightPercent = (total / maxTotal) * 100;

          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[60px]">
              <div
                className="w-full flex flex-col-reverse rounded-t-md overflow-hidden transition-all duration-300"
                style={{ height: `${heightPercent}%`, minHeight: '4px' }}
              >
                {d.values.map((v, vi) => {
                  const segmentHeight = (v.value / total) * 100;
                  return (
                    <div
                      key={vi}
                      style={{
                        height: `${segmentHeight}%`,
                        backgroundColor: v.color
                      }}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] text-gray-500 text-center">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Donut Chart
interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ data, size = 200 }: { data: DonutChartData[]; size?: number }) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 80;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />

        {data.map((d, i) => {
          const percentage = d.value / total;
          const angle = percentage * 360;
          const dashArray = `${(percentage * circumference)} ${circumference}`;
          const rotation = currentAngle;
          currentAngle += angle;

          return (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              transform={`rotate(${rotation} 100 100)`}
              className="transition-all duration-300"
            />
          );
        })}

        <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-semibold fill-gray-900">
          {total}
        </text>
      </svg>

      <div className="flex flex-wrap gap-3 justify-center">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-gray-600">{d.label} ({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Area Chart
export function AreaChart({ data, height = 240, color = '#3B82F6' }: { data: LineChartData[]; height?: number; color?: string }) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = 100;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((d.value - minValue) / range) * chartHeight;
    return { x, y };
  });

  const pathData = [
    `M ${padding.left / 100 * 100 + points[0].x} ${padding.top + points[0].y}`,
    ...points.slice(1).map(p => `L ${padding.left / 100 * 100 + p.x} ${padding.top + p.y}`),
    `L ${padding.left / 100 * 100 + points[points.length - 1].x} ${padding.top + chartHeight}`,
    `L ${padding.left / 100 * 100 + points[0].x} ${padding.top + chartHeight}`,
    'Z'
  ].join(' ');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Area fill */}
        <path
          d={pathData}
          fill={color}
          fillOpacity="0.1"
        />

        {/* Line */}
        <polyline
          points={points.map(p => `${padding.left / 100 * 100 + p.x},${padding.top + p.y}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-12 pb-2">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-gray-500">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// Trend Indicator
export function TrendIndicator({ value, deltaPercent }: { value: string | number; deltaPercent?: number }) {
  if (!deltaPercent) return <span className="text-2xl font-semibold text-gray-900">{value}</span>;

  const isPositive = deltaPercent > 0;
  const absPercent = Math.abs(deltaPercent);

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-semibold text-gray-900">{value}</span>
      <div className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          {isPositive ? (
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          )}
        </svg>
        <span>{absPercent.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// Simple distribution bars (horizontal)
export function DistributionBars({ data }: { data: { label: string; value: number; color: string }[] }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const widthPercent = (d.value / maxValue) * 100;
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">{d.label}</span>
              <span className="font-medium text-gray-900">{d.value}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${widthPercent}%`, backgroundColor: d.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
