type KLineItem = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
  tone?: 'up' | 'down' | 'flat';
  note?: string;
};

export default function KLineChart(props: {
  items: KLineItem[];
  min?: number;
  max?: number;
}) {
  const { items, min = 0, max = 100 } = props;
  const width = 900;
  const height = 220;
  const padding = { top: 18, right: 10, bottom: 34, left: 10 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const y = (v: number) => {
    const vv = clamp(v);
    const t = (vv - min) / (max - min || 1);
    return padding.top + (1 - t) * plotH;
  };

  const n = Math.max(1, items.length);
  const step = plotW / n;
  const candleW = Math.max(6, Math.min(18, step * 0.42));

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="K line chart"
      >
        {/* background grid */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(v)}
              y2={y(v)}
              stroke="rgba(0,0,0,0.06)"
              strokeDasharray="3 6"
            />
            <text
              x={width - padding.right}
              y={y(v) - 6}
              textAnchor="end"
              fontSize="10"
              fill="rgba(0,0,0,0.28)"
              fontWeight="700"
            >
              {v}
            </text>
          </g>
        ))}

        {/* candles */}
        {items.map((it, i) => {
          const cx = padding.left + step * i + step / 2;
          const open = clamp(it.open);
          const close = clamp(it.close);
          const high = clamp(it.high);
          const low = clamp(it.low);

          const isUp = close > open;
          const isFlat = close === open;
          const tone = it.tone ?? (isFlat ? 'flat' : isUp ? 'up' : 'down');

          const color =
            tone === 'up'
              ? '#FF6F61'
              : tone === 'down'
                ? '#64748B'
                : '#94A3B8';
          const wickColor = tone === 'down' ? 'rgba(100,116,139,0.65)' : 'rgba(255,111,97,0.55)';

          const yHigh = y(high);
          const yLow = y(low);
          const yOpen = y(open);
          const yClose = y(close);
          const rectY = Math.min(yOpen, yClose);
          const rectH = Math.max(2, Math.abs(yOpen - yClose));

          return (
            <g key={`${it.label}-${i}`}>
              <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={wickColor} strokeWidth="2" />
              <rect
                x={cx - candleW / 2}
                y={rectY}
                width={candleW}
                height={rectH}
                rx="6"
                fill={isFlat ? 'transparent' : color}
                stroke={color}
                strokeWidth={isFlat ? 2 : 0}
                opacity={0.95}
              />

              {/* x labels (show every other to avoid crowding) */}
              {i % 2 === 0 && (
                <text
                  x={cx}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(0,0,0,0.35)"
                  fontWeight="700"
                >
                  {it.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}


