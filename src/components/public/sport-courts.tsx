const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  vectorEffect: "non-scaling-stroke" as const,
};

const MARKS: { match: string[]; ratio: number; draw: (box: { w: number; h: number }) => React.ReactNode }[] = [
  { match: ["futsal", "sala"], ratio: 1.6, draw: (b) => <Futsal {...b} /> },
  { match: ["balonc", "basket"], ratio: 1.87, draw: (b) => <Basketball {...b} /> },
  { match: ["playa", "beach"], ratio: 1.5, draw: (b) => <Beach {...b} /> },
  { match: ["voleib", "voley"], ratio: 2, draw: (b) => <Volleyball {...b} /> },
  { match: ["mesa", "ping"], ratio: 1.75, draw: (b) => <TableTennis {...b} /> },
  { match: ["tenis", "tennis"], ratio: 1.7, draw: (b) => <Tennis {...b} /> },
  { match: ["rugby"], ratio: 1.5, draw: (b) => <Rugby {...b} /> },
  { match: ["ajedrez", "chess"], ratio: 1, draw: (b) => <Chess {...b} /> },
  { match: ["fútbol", "futbol"], ratio: 105 / 68, draw: (b) => <Football {...b} /> },
];

/** The court or board for a sport, by name, drawn in hairlines of the current color. */
export function CourtMark({ sport, className }: { sport: string; className?: string }) {
  const name = sport.toLowerCase();
  const mark = MARKS.find((m) => m.match.some((key) => name.includes(key))) ?? MARKS[MARKS.length - 1];
  const w = 1000;
  const h = w / mark.ratio;
  return (
    <svg aria-hidden viewBox={`0 0 ${w} ${h}`} className={className} fill="none">
      {mark.draw({ w, h })}
    </svg>
  );
}

/** Flat wash so the site graph paper does not show through the home. */
export function HomeFieldBackdrop() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#f8fafc]" />;
}

function Football({ w, h }: { w: number; h: number }) {
  const mid = h / 2;
  const boxD = w * 0.157;
  const boxH = h * 0.593;
  const goalD = w * 0.052;
  const goalH = h * 0.269;
  const radius = w * 0.087;
  const corner = w * 0.014;
  return (
    <g {...stroke}>
      <rect width={w} height={h} />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} />
      <circle cx={w / 2} cy={mid} r={radius} />
      <circle cx={w / 2} cy={mid} r="4" fill="currentColor" />
      <rect y={mid - boxH / 2} width={boxD} height={boxH} />
      <rect x={w - boxD} y={mid - boxH / 2} width={boxD} height={boxH} />
      <rect y={mid - goalH / 2} width={goalD} height={goalH} />
      <rect x={w - goalD} y={mid - goalH / 2} width={goalD} height={goalH} />
      <path d={`M ${boxD} ${mid - radius * 0.55} A ${radius} ${radius} 0 0 1 ${boxD} ${mid + radius * 0.55}`} />
      <path d={`M ${w - boxD} ${mid - radius * 0.55} A ${radius} ${radius} 0 0 0 ${w - boxD} ${mid + radius * 0.55}`} />
      <path d={`M 0 ${corner} A ${corner} ${corner} 0 0 1 ${corner} 0`} />
      <path d={`M ${w} ${corner} A ${corner} ${corner} 0 0 0 ${w - corner} 0`} />
      <path d={`M 0 ${h - corner} A ${corner} ${corner} 0 0 0 ${corner} ${h}`} />
      <path d={`M ${w} ${h - corner} A ${corner} ${corner} 0 0 1 ${w - corner} ${h}`} />
    </g>
  );
}

function Futsal({ w, h }: { w: number; h: number }) {
  const mid = h / 2;
  const boxD = w * 0.16;
  const boxH = h * 0.55;
  const radius = w * 0.11;
  return (
    <g {...stroke}>
      <rect width={w} height={h} />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} />
      <circle cx={w / 2} cy={mid} r={radius} />
      <rect y={mid - boxH / 2} width={boxD} height={boxH} />
      <rect x={w - boxD} y={mid - boxH / 2} width={boxD} height={boxH} />
    </g>
  );
}

function Basketball({ w, h }: { w: number; h: number }) {
  const mid = h / 2;
  const keyD = w * 0.19;
  const keyH = h * 0.32;
  const ft = keyH / 2;
  const arc = h * 0.42;
  const inset = w * 0.07;
  return (
    <g {...stroke}>
      <rect width={w} height={h} />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} />
      <circle cx={w / 2} cy={mid} r={h * 0.12} />
      <rect y={mid - keyH / 2} width={keyD} height={keyH} />
      <rect x={w - keyD} y={mid - keyH / 2} width={keyD} height={keyH} />
      <path d={`M ${keyD} ${mid - ft} A ${ft} ${ft} 0 0 1 ${keyD} ${mid + ft}`} />
      <path d={`M ${w - keyD} ${mid - ft} A ${ft} ${ft} 0 0 0 ${w - keyD} ${mid + ft}`} />
      <path d={`M 0 ${mid - arc} H ${inset} A ${arc} ${arc} 0 0 1 ${inset} ${mid + arc} H 0`} />
      <path d={`M ${w} ${mid - arc} H ${w - inset} A ${arc} ${arc} 0 0 0 ${w - inset} ${mid + arc} H ${w}`} />
    </g>
  );
}

function Volleyball({ w, h }: { w: number; h: number }) {
  const attack = w * 0.167;
  return (
    <g {...stroke}>
      <rect width={w} height={h} />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} />
      <line x1={w / 2 - attack} y1={0} x2={w / 2 - attack} y2={h} />
      <line x1={w / 2 + attack} y1={0} x2={w / 2 + attack} y2={h} />
    </g>
  );
}

function Beach({ w, h }: { w: number; h: number }) {
  return (
    <g {...stroke}>
      <rect width={w} height={h} />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} />
    </g>
  );
}

function Rugby({ w, h }: { w: number; h: number }) {
  const inGoal = w * 0.08;
  const twentyTwo = inGoal + (w - inGoal * 2) * 0.22;
  const ten = w * 0.1;
  return (
    <g {...stroke}>
      <rect width={w} height={h} />
      <line x1={inGoal} y1={0} x2={inGoal} y2={h} />
      <line x1={w - inGoal} y1={0} x2={w - inGoal} y2={h} />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} />
      <line x1={twentyTwo} y1={0} x2={twentyTwo} y2={h} strokeDasharray="10 8" />
      <line x1={w - twentyTwo} y1={0} x2={w - twentyTwo} y2={h} strokeDasharray="10 8" />
      <line x1={w / 2 - ten} y1={0} x2={w / 2 - ten} y2={h} strokeDasharray="6 8" />
      <line x1={w / 2 + ten} y1={0} x2={w / 2 + ten} y2={h} strokeDasharray="6 8" />
    </g>
  );
}

function Tennis({ w, h }: { w: number; h: number }) {
  const alley = w * 0.12;
  const baseline = h * 0.1;
  const service = h * 0.21;
  return (
    <g {...stroke}>
      <rect width={w} height={h} />
      <rect x={alley} y={baseline} width={w - alley * 2} height={h - baseline * 2} />
      <line x1={w / 2} y1={baseline} x2={w / 2} y2={h - baseline} />
      <line x1={alley} y1={h / 2 - service} x2={w - alley} y2={h / 2 - service} />
      <line x1={alley} y1={h / 2 + service} x2={w - alley} y2={h / 2 + service} />
      <line x1={0} y1={h / 2} x2={w} y2={h / 2} strokeWidth="3" />
    </g>
  );
}

function TableTennis({ w, h }: { w: number; h: number }) {
  return (
    <g {...stroke}>
      <rect width={w} height={h} />
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} strokeWidth="3" />
      <line x1={0} y1={h / 2} x2={w} y2={h / 2} />
    </g>
  );
}

function Chess({ w, h }: { w: number; h: number }) {
  const cell = w / 8;
  return (
    <g {...stroke}>
      <rect width={w} height={h} />
      {Array.from({ length: 7 }, (_, index) => (
        <line key={`c-${index}`} x1={(index + 1) * cell} y1={0} x2={(index + 1) * cell} y2={h} />
      ))}
      {Array.from({ length: 7 }, (_, index) => (
        <line key={`r-${index}`} x1={0} y1={(index + 1) * cell} x2={w} y2={(index + 1) * cell} />
      ))}
    </g>
  );
}
