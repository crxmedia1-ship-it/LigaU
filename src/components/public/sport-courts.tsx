const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  vectorEffect: "non-scaling-stroke" as const,
};

function Court({
  label,
  x,
  y,
  width,
  ratio,
  className = "text-zinc-500/80",
  showLabel = true,
  children,
}: {
  label: string;
  x: number;
  y: number;
  width: number;
  ratio: number;
  className?: string;
  showLabel?: boolean;
  children: (box: { w: number; h: number }) => React.ReactNode;
}) {
  const w = 1000;
  const h = 1000 / ratio;
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute overflow-visible ${className}`}
      style={{ left: `${x}vw`, top: `${y}vh`, width: `${width}vw`, height: `${width / ratio}vw` }}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
    >
      {showLabel ? (
        <text
          x={28}
          y={58}
          fill="currentColor"
          fontSize={42}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          letterSpacing="5"
        >
          {label}
        </text>
      ) : null}
      {children({ w, h })}
    </svg>
  );
}

/** Courts behind the home. Fixed to the screen so the lines stay visible through the glass grids. */
export function HomeFieldBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#f8fafc]">
      <Court label="Fútbol" x={-22} y={6} width={146} ratio={105 / 68} className="text-zinc-600" showLabel={false}>
        {({ w, h }) => <Football w={w} h={h} />}
      </Court>
      <Court label="Baloncesto" x={18} y={46} width={108} ratio={1.87} className="text-zinc-600" showLabel={false}>
        {({ w, h }) => <Basketball w={w} h={h} />}
      </Court>
      <Court label="Voleibol" x={-28} y={68} width={96} ratio={2} className="text-zinc-600" showLabel={false}>
        {({ w, h }) => <Volleyball w={w} h={h} />}
      </Court>
      <Court label="Tenis" x={58} y={74} width={52} ratio={1.7} className="text-zinc-600" showLabel={false}>
        {({ w, h }) => <Tennis w={w} h={h} />}
      </Court>
    </div>
  );
}

/** One chalk court per Liga U sport, in true proportion, laid on the tactical plane. */
export function SportCourts() {
  return (
    <>
      <Court label="Fútbol" x={4} y={6} width={148} ratio={105 / 68}>
        {({ w, h }) => <Football w={w} h={h} />}
      </Court>
      <Court label="Futsal" x={4} y={108} width={72} ratio={1.6}>
        {({ w, h }) => <Futsal w={w} h={h} />}
      </Court>
      <Court label="Baloncesto" x={158} y={38} width={120} ratio={1.87}>
        {({ w, h }) => <Basketball w={w} h={h} />}
      </Court>
      <Court label="Vóley playa" x={8} y={155} width={58} ratio={1.5}>
        {({ w, h }) => <Beach w={w} h={h} />}
      </Court>
      <Court label="Tenis" x={200} y={132} width={96} ratio={1.7}>
        {({ w, h }) => <Tennis w={w} h={h} />}
      </Court>
      <Court label="Voleibol" x={48} y={162} width={118} ratio={2}>
        {({ w, h }) => <Volleyball w={w} h={h} />}
      </Court>
      <Court label="Rugby" x={-4} y={228} width={130} ratio={1.5}>
        {({ w, h }) => <Rugby w={w} h={h} />}
      </Court>
      <Court label="Tenis de mesa" x={168} y={232} width={64} ratio={1.75}>
        {({ w, h }) => <TableTennis w={w} h={h} />}
      </Court>
      <Court label="Ajedrez" x={250} y={168} width={42} ratio={1}>
        {({ w, h }) => <Chess w={w} h={h} />}
      </Court>
    </>
  );
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
      <path d={`M ${inset} ${mid - arc} A ${arc} ${arc} 0 0 0 ${inset} ${mid + arc}`} />
      <path d={`M ${w - inset} ${mid - arc} A ${arc} ${arc} 0 0 1 ${w - inset} ${mid + arc}`} />
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
