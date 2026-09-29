import { cn } from "@/lib/utils";

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

const CRIMSON = "#C8102E";
const EASE = "0.45 0 0.25 1";
const LOOP = "indefinite";

function splines(keyTimes: string) {
  return keyTimes
    .split(";")
    .slice(1)
    .map(() => EASE)
    .join(";");
}

/** A tactic-board piece: solid for the side with the ball, a ring for the other. */
function Piece({
  x,
  y,
  side,
  dur,
  values,
  keyTimes,
}: {
  x: number;
  y: number;
  side: "home" | "away";
  dur: string;
  values: string;
  keyTimes: string;
}) {
  const motion = (
    <animateMotion
      dur={dur}
      repeatCount={LOOP}
      values={values}
      keyTimes={keyTimes}
      calcMode="spline"
      keySplines={splines(keyTimes)}
    />
  );
  return side === "home" ? (
    <circle cx={x} cy={y} r={15} fill="currentColor">
      {motion}
    </circle>
  ) : (
    <circle cx={x} cy={y} r={14} fill="#F8FAFC" stroke="currentColor" strokeWidth={4} strokeOpacity={0.55}>
      {motion}
    </circle>
  );
}

/** The ball: crimson core with a soft halo, riding the play's path. */
function Ball({
  path,
  keyPoints,
  keyTimes,
  dur,
  loops = false,
  lift,
}: {
  path: string;
  keyPoints: string;
  keyTimes: string;
  dur: string;
  loops?: boolean;
  lift?: { values: string; keyTimes: string };
}) {
  return (
    <g>
      <animateMotion
        dur={dur}
        repeatCount={LOOP}
        path={path}
        keyPoints={keyPoints}
        keyTimes={keyTimes}
        calcMode="spline"
        keySplines={splines(keyTimes)}
      />
      {loops ? null : (
        <animate attributeName="opacity" dur={dur} repeatCount={LOOP} values="0;1;1;0" keyTimes="0;0.04;0.93;1" />
      )}
      <circle r={24} fill={CRIMSON} opacity={0.16} />
      <circle r={9} fill={CRIMSON}>
        {lift ? (
          <animate attributeName="r" dur={dur} repeatCount={LOOP} values={lift.values} keyTimes={lift.keyTimes} />
        ) : null}
      </circle>
    </g>
  );
}

/** The pass drawn in behind the ball, then wiped at the end of the loop. */
function Trail({
  path,
  keyPoints,
  keyTimes,
  dur,
}: {
  path: string;
  keyPoints: string;
  keyTimes: string;
  dur: string;
}) {
  const offsets = keyPoints
    .split(";")
    .map((point) => String(1 - Number(point)))
    .join(";");
  return (
    <path
      d={path}
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1}
      stroke={CRIMSON}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
      opacity={0.5}
    >
      <animate
        attributeName="stroke-dashoffset"
        dur={dur}
        repeatCount={LOOP}
        values={offsets}
        keyTimes={keyTimes}
        calcMode="spline"
        keySplines={splines(keyTimes)}
      />
      <animate attributeName="opacity" dur={dur} repeatCount={LOOP} values="0.5;0.5;0" keyTimes="0;0.9;1" />
    </path>
  );
}

/** A landing or bounce: a crimson ring that opens and fades. */
function Ripple({ x, y, at, dur }: { x: number; y: number; at: number; dur: string }) {
  const end = Math.min(at + 0.14, 0.99);
  return (
    <circle cx={x} cy={y} r={4} fill="none" stroke={CRIMSON} strokeWidth={3} opacity={0}>
      <animate attributeName="r" dur={dur} repeatCount={LOOP} values="4;4;52;52" keyTimes={`0;${at};${end};1`} />
      <animate
        attributeName="opacity"
        dur={dur}
        repeatCount={LOOP}
        values="0;0;0.7;0;0"
        keyTimes={`0;${at};${at + 0.01};${end};1`}
      />
    </circle>
  );
}

type Pt = readonly [number, number];
/** Joints relative to the hip: head, neck, then elbow/hand and knee/foot, near side before far side. */
type Pose = readonly [Pt, Pt, Pt, Pt, Pt, Pt, Pt, Pt, Pt, Pt];

function pose(...n: number[]): Pose {
  const pts: Pt[] = [];
  for (let i = 0; i < n.length; i += 2) pts.push([n[i], n[i + 1]]);
  return pts as unknown as Pose;
}

const STAND = pose(-2, -66, 0, -50, -10, -30, -14, -12, 10, -30, 14, -12, -6, 24, -8, 50, 6, 24, 8, 50);
const CHEER = pose(0, -66, 0, -50, -14, -64, -22, -84, 14, -64, 22, -84, -6, 24, -10, 50, 6, 24, 10, 50);
const RUN_A = pose(4, -66, 2, -50, 14, -32, 24, -42, -12, -32, -20, -18, 16, 20, 10, 46, -10, 22, -26, 40);
const RUN_B = pose(4, -66, 2, -50, -12, -32, -20, -18, 14, -32, 24, -42, -10, 22, -26, 40, 16, 20, 10, 46);

const FIGURE_SCALE = 1.5;
const GROUND = 470;
const FRAMES_DUR = "20s";

/** A pictogram athlete: thick limbs, far side dimmed for depth. */
function Figure({ joints }: { joints: Pose }) {
  const [head, neck, eN, hN, eF, hF, kN, fN, kF, fF] = joints;
  const limb = (a: Pt, b: Pt, c: Pt) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}`;
  const hip: Pt = [0, 0];
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <g strokeWidth={9} opacity={0.4}>
        <path d={limb(neck, eF, hF)} />
        <path d={limb(hip, kF, fF)} />
      </g>
      <path d={`M${neck[0]} ${neck[1]}L0 0`} strokeWidth={15} />
      <g strokeWidth={9}>
        <path d={limb(hip, kN, fN)} />
        <path d={limb(neck, eN, hN)} />
      </g>
      <circle cx={head[0]} cy={head[1]} r={10} fill="currentColor" stroke="none" />
    </g>
  );
}

/** Discrete opacity steps; later points win when two share a time. */
function steps(points: [number, number][]) {
  const kept = points.filter(([t], i) => t < 1 && (i === points.length - 1 || points[i + 1][0] > t));
  return { values: kept.map(([, v]) => v).join(";"), keyTimes: kept.map(([t]) => t).join(";") };
}

type Frame = { at: number; x: number; y: number; joints: Pose };

/** Flip-book: each frame holds, then lingers one beat as a ghost before it clears. */
function FrameSequence({ frames, end }: { frames: Frame[]; end: number }) {
  return (
    <>
      {frames.map((frame, i) => {
        const next = frames[i + 1]?.at ?? end;
        const after = Math.min(frames[i + 2]?.at ?? end, next + 0.04, end);
        const points: [number, number][] = [[0, 0], [frame.at, 1], [next, 0.14], [after, 0]];
        const { values, keyTimes } = steps(points);
        const lift = GROUND - (frame.y + 50 * FIGURE_SCALE);
        return (
          <g key={i} opacity={0}>
            <animate
              attributeName="opacity"
              dur={FRAMES_DUR}
              repeatCount={LOOP}
              calcMode="discrete"
              values={values}
              keyTimes={keyTimes}
            />
            <ellipse
              cx={frame.x}
              cy={GROUND + 4}
              rx={Math.max(16, 40 - lift * 0.25)}
              ry={6}
              fill="currentColor"
              opacity={0.12}
            />
            <g transform={`translate(${frame.x} ${frame.y}) scale(${FIGURE_SCALE})`}>
              <Figure joints={frame.joints} />
            </g>
          </g>
        );
      })}
    </>
  );
}

type Stop = { t: number; at: Pt; via?: Pt };

/** Keyframes for a ball that flies in straight hops or quadratic arcs between stops. */
function track(stops: Stop[]) {
  const values: string[] = [`${stops[0].at[0]},${stops[0].at[1]}`];
  const keyTimes: number[] = [stops[0].t];
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1];
    const { t, at, via } = stops[i];
    const samples = via ? 10 : 1;
    for (let s = 1; s <= samples; s++) {
      const u = s / samples;
      const [x, y] = via
        ? [
            (1 - u) ** 2 * from.at[0] + 2 * (1 - u) * u * via[0] + u ** 2 * at[0],
            (1 - u) ** 2 * from.at[1] + 2 * (1 - u) * u * via[1] + u ** 2 * at[1],
          ]
        : at;
      values.push(`${Math.round(x)},${Math.round(y)}`);
      keyTimes.push(Number((from.t + (t - from.t) * u).toFixed(4)));
    }
  }
  return { values: values.join(";"), keyTimes: keyTimes.join(";") };
}

const CHILENA: Frame[] = [
  { at: 0, x: 700, y: 395, joints: STAND },
  { at: 0.13, x: 702, y: 407, joints: pose(4, -62, 4, -46, 14, -30, 24, -18, 10, -32, 20, -20, -16, 18, -4, 38, -10, 20, 8, 38) },
  { at: 0.18, x: 706, y: 392, joints: pose(28, -58, 22, -44, 2, -54, -12, -66, 34, -30, 46, -20, -26, -8, -46, -28, -2, 26, 8, 52) },
  { at: 0.215, x: 712, y: 352, joints: pose(62, 6, 48, 4, 40, 24, 52, 40, 44, -14, 56, -28, -22, -20, -26, -48, -24, 8, -48, 4) },
  { at: 0.25, x: 716, y: 345, joints: pose(56, 30, 44, 22, 40, 44, 54, 56, 50, 0, 66, -6, -8, -28, 4, -56, -24, -4, -44, 12) },
  { at: 0.29, x: 722, y: 372, joints: pose(34, 52, 26, 40, 46, 50, 60, 60, 12, 58, 4, 70, 22, -22, 48, -34, -16, -14, -32, -38) },
  { at: 0.34, x: 730, y: 455, joints: pose(64, -4, 50, -4, 40, 8, 30, 10, 56, 8, 68, 10, -24, -8, -48, 2, -22, -14, -46, -8) },
  { at: 0.42, x: 730, y: 395, joints: CHEER },
];

const CABEZAZO: Frame[] = [
  { at: 0.5, x: 560, y: 399, joints: RUN_A },
  { at: 0.55, x: 590, y: 399, joints: RUN_B },
  { at: 0.6, x: 620, y: 399, joints: RUN_A },
  { at: 0.645, x: 645, y: 399, joints: RUN_B },
  { at: 0.685, x: 662, y: 410, joints: pose(10, -62, 8, -46, -8, -34, -20, -24, -4, -32, -16, -22, 16, 16, 4, 40, 6, 18, -8, 40) },
  { at: 0.715, x: 678, y: 368, joints: pose(4, -66, 2, -50, -10, -62, -6, -80, 16, -60, 24, -76, 10, 22, 4, 48, -6, 20, -22, 36) },
  { at: 0.74, x: 690, y: 340, joints: pose(16, -62, 10, -48, -12, -58, -26, -66, -10, -54, -24, -48, -10, 20, -30, 34, -18, 16, -40, 24) },
  { at: 0.765, x: 700, y: 336, joints: pose(22, -60, 12, -46, 10, -30, 22, -22, -16, -40, -30, -36, 4, 22, -8, 46, -10, 20, -26, 38) },
  { at: 0.8, x: 715, y: 395, joints: pose(6, -64, 4, -48, 18, -34, 28, -22, -12, -34, -20, -22, 10, 24, 10, 50, -8, 22, -12, 50) },
  { at: 0.86, x: 720, y: 395, joints: CHEER },
];

/** Stop-motion finishes on loop: a bicycle kick, then a diving-in header. */
function FootballFrames() {
  const dur = FRAMES_DUR;
  const ball = track([
    { t: 0, at: [250, 110] },
    { t: 0.02, at: [250, 110] },
    { t: 0.25, at: [724, 246], via: [560, -40] },
    { t: 0.28, at: [724, 246] },
    { t: 0.32, at: [990, 305] },
    { t: 0.44, at: [990, 305] },
    { t: 0.52, at: [300, 80] },
    { t: 0.765, at: [755, 242], via: [580, -10] },
    { t: 0.8, at: [990, 340] },
    { t: 1, at: [990, 340] },
  ]);
  const label = (text: string, shown: [number, number][]) => {
    const { values, keyTimes } = steps(shown);
    return (
      <text
        x={30}
        y={52}
        fill={CRIMSON}
        fontSize={26}
        fontWeight={700}
        letterSpacing={6}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        opacity={0}
      >
        <animate attributeName="opacity" dur={dur} repeatCount={LOOP} calcMode="discrete" values={values} keyTimes={keyTimes} />
        {text}
      </text>
    );
  };
  return (
    <>
      <rect x={948} y={237} width={52} height={174} fill={CRIMSON} opacity={0}>
        <animate
          attributeName="opacity"
          dur={dur}
          repeatCount={LOOP}
          values="0;0;0.35;0;0;0.35;0;0"
          keyTimes="0;0.32;0.33;0.42;0.8;0.81;0.9;1"
        />
      </rect>
      {label("CHILENA", [[0, 1], [0.5, 0]])}
      {label("CABEZAZO", [[0, 0], [0.5, 1]])}
      <FrameSequence frames={CHILENA} end={0.5} />
      <FrameSequence frames={CABEZAZO} end={1} />
      <g>
        <animateMotion
          dur={dur}
          repeatCount={LOOP}
          calcMode="linear"
          values={ball.values}
          keyTimes={ball.keyTimes}
        />
        <animate
          attributeName="opacity"
          dur={dur}
          repeatCount={LOOP}
          values="0;0;1;1;0;0;1;1;0;0"
          keyTimes="0;0.02;0.04;0.4;0.44;0.52;0.54;0.92;0.96;1"
        />
        <circle r={22} fill={CRIMSON} opacity={0.16} />
        <circle r={9} fill={CRIMSON} />
      </g>
    </>
  );
}

/** Swing it to the wing, skip to the top, pull-up three that drops. */
function BasketballPlay() {
  const dur = "13s";
  const path = "M430 110 L640 440 L720 180 Q840 -60 940 267";
  const keyTimes = "0;0.1;0.25;0.33;0.45;0.55;0.78;1";
  const keyPoints = "0;0;0.361;0.361;0.612;0.612;1;1";
  return (
    <>
      <g stroke="currentColor" strokeWidth={4} fill="none" opacity={0.45}>
        <line x1={968} y1={225} x2={968} y2={309} />
        <circle cx={940} cy={267} r={16} />
      </g>
      <circle cx={940} cy={267} r={22} fill="none" stroke={CRIMSON} strokeWidth={4} opacity={0}>
        <animate attributeName="opacity" dur={dur} repeatCount={LOOP} values="0;0;0.8;0;0" keyTimes="0;0.77;0.79;0.9;1" />
      </circle>
      <Trail path={path} keyPoints={keyPoints} keyTimes={keyTimes} dur={dur} />
      <Piece side="away" x={500} y={160} dur={dur} values="0,0;60,120;20,40;0,0" keyTimes="0;0.28;0.5;1" />
      <Piece side="away" x={700} y={400} dur={dur} values="0,0;-40,10;0,-140;0,0" keyTimes="0;0.25;0.52;1" />
      <Piece side="away" x={820} y={230} dur={dur} values="0,0;-20,30;0,0" keyTimes="0;0.5;1" />
      <Piece side="away" x={880} y={360} dur={dur} values="0,0;-10,-40;0,0" keyTimes="0;0.6;1" />
      <Piece side="away" x={380} y={300} dur={dur} values="0,0;-40,40;0,0" keyTimes="0;0.5;1" />
      <Piece side="home" x={430} y={110} dur={dur} values="0,0;0,0;-30,30;0,0" keyTimes="0;0.1;0.5;1" />
      <Piece side="home" x={640} y={440} dur={dur} values="40,20;0,0;0,0;-20,0;40,20" keyTimes="0;0.22;0.33;0.6;1" />
      <Piece
        side="home"
        x={720}
        y={180}
        dur={dur}
        values="-40,80;-40,80;0,0;0,0;0,-26;0,0;-40,80"
        keyTimes="0;0.3;0.45;0.52;0.58;0.68;1"
      />
      <Piece side="home" x={300} y={380} dur={dur} values="0,0;50,-30;0,0" keyTimes="0;0.5;1" />
      <Piece side="home" x={860} y={120} dur={dur} values="0,0;-20,40;0,0" keyTimes="0;0.5;1" />
      <Ball
        path={path}
        keyPoints={keyPoints}
        keyTimes={keyTimes}
        dur={dur}
        lift={{ values: "9;9;14;9;9", keyTimes: "0;0.55;0.665;0.78;1" }}
      />
    </>
  );
}

/** Serve received, set to the outside, spike down the line. */
function VolleyballPlay() {
  const dur = "12s";
  const path = "M850 90 Q520 -40 180 320 Q300 60 430 230 Q420 90 450 105 L790 410";
  const keyTimes = "0;0.25;0.3;0.42;0.46;0.55;0.6;0.68;1";
  const keyPoints = "0;0.47;0.47;0.664;0.664;0.747;0.747;1;1";
  return (
    <>
      <Ripple x={790} y={410} at={0.68} dur={dur} />
      <Trail path={path} keyPoints={keyPoints} keyTimes={keyTimes} dur={dur} />
      <Piece side="away" x={600} y={160} dur={dur} values="0,0;0,0;0,-20;0,0;0,0" keyTimes="0;0.52;0.6;0.68;1" />
      <Piece side="away" x={640} y={360} dur={dur} values="0,0;60,20;0,0" keyTimes="0;0.62;1" />
      <Piece side="away" x={860} y={250} dur={dur} values="0,0;-40,80;0,0" keyTimes="0;0.66;1" />
      <Piece side="away" x={820} y={90} dur={dur} values="0,0;-20,10;0,0" keyTimes="0;0.5;1" />
      <Piece side="home" x={180} y={340} dur={dur} values="30,-40;0,0;0,0;30,-40" keyTimes="0;0.22;0.4;1" />
      <Piece side="home" x={430} y={250} dur={dur} values="40,60;0,0;0,0;40,60" keyTimes="0;0.35;0.6;1" />
      <Piece
        side="home"
        x={455}
        y={150}
        dur={dur}
        values="-80,60;-80,60;0,30;0,-10;0,30;-80,60"
        keyTimes="0;0.4;0.52;0.6;0.7;1"
      />
      <Piece side="home" x={230} y={160} dur={dur} values="0,0;20,30;0,0" keyTimes="0;0.5;1" />
      <Ball path={path} keyPoints={keyPoints} keyTimes={keyTimes} dur={dur} />
    </>
  );
}

/** Cross-court rally that never ends: hit, bounce, return, bounce. */
function TennisPlay() {
  const dur = "10s";
  const path = "M380 60 Q560 180 700 440 L660 530 Q480 400 330 150 L380 60";
  const keyTimes = "0;0.4;0.5;0.9;1";
  const keyPoints = "0;0.422;0.494;0.916;1";
  return (
    <>
      <Ripple x={700} y={440} at={0.4} dur={dur} />
      <Ripple x={330} y={150} at={0.84} dur={dur} />
      <Trail path={path} keyPoints={keyPoints} keyTimes={keyTimes} dur={dur} />
      <Piece side="home" x={380} y={40} dur={dur} values="0,0;40,0;-40,0;0,0" keyTimes="0;0.3;0.7;1" />
      <Piece side="away" x={660} y={550} dur={dur} values="-60,0;0,0;-40,0;-60,0" keyTimes="0;0.5;0.8;1" />
      <Ball
        path={path}
        keyPoints={keyPoints}
        keyTimes={keyTimes}
        dur={dur}
        loops
        lift={{ values: "9;13;9;9;13;9;9", keyTimes: "0;0.2;0.4;0.5;0.7;0.9;1" }}
      />
    </>
  );
}

function StackCourt({
  ratio,
  className,
  court,
  play,
}: {
  ratio: number;
  className?: string;
  court: (box: { w: number; h: number }) => React.ReactNode;
  play?: React.ReactNode;
}) {
  const w = 1000;
  const h = 1000 / ratio;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`block h-auto w-full shrink-0 overflow-visible ${className ?? ""}`}
      fill="none"
    >
      <g className="text-zinc-300">{court({ w, h })}</g>
      {play ? <g className="ligau-tactics text-zinc-400 opacity-35">{play}</g> : null}
    </svg>
  );
}

/**
 * The whole home laid out as one upright pitch, drawn in hairlines just darker than the page.
 * Boxes hang off the top and bottom edges; the halfway line sits mid-page.
 */
export function HomePitchLines() {
  const line = "border-zinc-900/[0.07]";
  const box = (edge: "top" | "bottom") => (
    <div className={cn("absolute inset-x-0 flex justify-center", edge === "top" ? "top-0" : "bottom-0 rotate-180")}>
      <div className={cn("relative h-32 w-[64%] max-w-xl border-x border-b sm:h-44", line)}>
        <div className={cn("absolute top-0 left-1/2 h-12 w-[46%] -translate-x-1/2 border-x border-b sm:h-16", line)} />
        <div className="absolute top-full left-1/2 h-10 w-28 -translate-x-1/2 overflow-hidden sm:h-12 sm:w-36">
          <div className={cn("absolute bottom-0 left-0 size-28 rounded-full border sm:size-36", line)} />
        </div>
      </div>
    </div>
  );
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-2.5 top-2.5 bottom-2.5 z-0 sm:inset-x-4 lg:inset-x-8"
    >
      <div className={cn("absolute inset-0 rounded-[1.75rem] border", line)} />
      {box("top")}
      <div className={cn("absolute inset-x-0 top-1/2 border-t", line)} />
      <div
        className={cn(
          "absolute top-1/2 left-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full border sm:size-64",
          line,
        )}
      />
      <div className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8102E]/40" />
      {box("bottom")}
    </div>
  );
}

/** Flat wash so the site graph paper does not show through the home. */
export function HomeFieldBackdrop() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#f8fafc]" />;
}

const BACKDROP_COURTS: {
  label: string;
  ratio: number;
  court: (box: { w: number; h: number }) => React.ReactNode;
  play?: React.ReactNode;
}[] = [
  { label: "Fútbol", ratio: 105 / 68, court: (b) => <Football {...b} />, play: <FootballFrames /> },
  { label: "Baloncesto", ratio: 1.87, court: (b) => <Basketball {...b} />, play: <BasketballPlay /> },
  { label: "Voleibol", ratio: 2, court: (b) => <Volleyball {...b} />, play: <VolleyballPlay /> },
  { label: "Tenis", ratio: 1.7, court: (b) => <Tennis {...b} />, play: <TennisPlay /> },
  { label: "Futsal", ratio: 1.6, court: (b) => <Futsal {...b} /> },
  { label: "Rugby", ratio: 1.5, court: (b) => <Rugby {...b} /> },
  { label: "Vóley playa", ratio: 1.5, court: (b) => <Beach {...b} /> },
  { label: "Tenis de mesa", ratio: 1.75, court: (b) => <TableTennis {...b} /> },
  { label: "Ajedrez", ratio: 1, court: (b) => <Chess {...b} /> },
];

/**
 * The home's backdrop: one court per sport, stacked down the whole page behind the content.
 * On desktop they zigzag left and right so the column reads as a path, not a list.
 */
export function CourtBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden px-4 pt-6 sm:px-6 lg:px-12 xl:px-20 2xl:px-28"
    >
      <div className="flex flex-col gap-12 lg:gap-20">
        {BACKDROP_COURTS.map((c, i) => (
          <StackCourt
            key={c.label}
            ratio={c.ratio}
            className={`lg:w-[62%] ${c.ratio === 1 ? "max-w-sm lg:max-w-md" : ""} ${i % 2 ? "self-end" : ""}`}
            court={c.court}
            play={c.play}
          />
        ))}
      </div>
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
