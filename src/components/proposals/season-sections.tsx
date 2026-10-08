import { HALFTONE_INK, HALFTONE_RED, SectionHeading, Tag } from "@/components/proposals/deck-parts";
import {
  AUDIENCE_AGE,
  AUDIENCE_KPIS,
  COPA_NAVIDAD_DATES,
  HIGH_IMPACT_FORMATS,
  LEAGUE_FACTS,
  REACH_BY_PHASE,
  SEASON_AXES,
  SEASON_TOURNAMENTS,
  WHY_INVEST,
} from "@/lib/proposals/master";
import { cn } from "@/lib/utils";

const AGE_COLORS = ["bg-brand-red", "bg-white", "bg-zinc-500", "bg-zinc-700"];

function reachLabel(millions: number) {
  return millions < 1 ? `${Math.round(millions * 1000)}K` : `${millions.toFixed(1)}M`;
}

export function SeasonSection() {
  const { participation } = LEAGUE_FACTS;
  return (
    <section
      id="temporada"
      className="proposal-sheet relative scroll-mt-24 border-t-[3px] border-zinc-950 bg-white py-12 md:py-16"
    >
      <div
        aria-hidden
        className={cn("absolute top-0 left-0 h-48 w-1/2 [mask-image:linear-gradient(135deg,black,transparent_70%)]", HALFTONE_INK)}
      />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <SectionHeading eyebrow={`Temporada ${LEAGUE_FACTS.season}`} title="Cinco torneos. Diez meses." />
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 md:text-lg">
            De octubre a julio la liga no se detiene: Copa Navidad, NextGen U, Apertura, Clausura y la Final absoluta.
            Hasta {LEAGUE_FACTS.athletesPerTournament} atletas por torneo.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SEASON_TOURNAMENTS.map((item, index) => {
            const final = item.athletes == null;
            return (
              <li
                key={item.name}
                className={cn(
                  "group relative flex flex-col border-[2.5px] border-zinc-950 p-4 shadow-[5px_5px_0_0_#09090b] transition duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_0_#C8102E]",
                  item.sponsorship === "open" ? "bg-zinc-950 text-white" : final ? "bg-[#f7d96b]" : "bg-white",
                )}
              >
                <span
                  className={cn(
                    "font-jersey absolute top-2 right-3 text-4xl leading-none",
                    item.sponsorship === "open" ? "text-white/15" : "text-zinc-950/10",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p
                  className={cn(
                    "text-[10px] font-black tracking-[0.18em] uppercase",
                    item.sponsorship === "open" ? "text-brand-red" : "text-zinc-500",
                  )}
                >
                  {item.months}
                </p>
                <h3 className="font-jersey mt-1 text-3xl leading-[0.9] uppercase">{item.name}</h3>
                <p className={cn("mt-1 text-xs font-semibold", item.sponsorship === "open" ? "text-white/60" : "text-zinc-500")}>
                  {item.note}
                </p>
                <div className="mt-auto pt-5">
                  {final ? (
                    <p className="font-jersey text-4xl leading-none">Julio</p>
                  ) : (
                    <p className="font-jersey text-4xl leading-none">
                      {item.athletes}
                      <span className="ml-1 text-sm tracking-wide uppercase">atletas</span>
                    </p>
                  )}
                  {item.sponsorship === "open" ? (
                    <span className="mt-3 inline-block bg-brand-red px-2 py-1 text-[9px] font-black tracking-[0.16em] uppercase">
                      Patrocinio disponible
                    </span>
                  ) : item.sponsorship === "soon" ? (
                    <span className="mt-3 inline-block border-2 border-zinc-950 px-2 py-0.5 text-[9px] font-black tracking-[0.16em] uppercase">
                      Paquetes en preparación
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="relative mt-10 overflow-hidden border-[3px] border-zinc-950 bg-brand-red text-white shadow-[6px_6px_0_0_#09090b]">
          <div aria-hidden className={cn("absolute inset-0 opacity-50", HALFTONE_INK)} />
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-zinc-950 bg-zinc-950 px-4 py-3">
            <p className="font-jersey text-2xl leading-none uppercase">Copa Navidad 2026</p>
            <p className="text-[10px] font-black tracking-[0.18em] text-white/60 uppercase">Calendario del torneo</p>
          </div>
          <ol className="relative flex gap-3 overflow-x-auto p-4 [scrollbar-width:none]">
            {COPA_NAVIDAD_DATES.map((item) => {
              const event = item.venue == null;
              return (
                <li
                  key={`${item.day}-${item.month}`}
                  className={cn(
                    "flex w-28 shrink-0 flex-col border-[2.5px] border-zinc-950 shadow-[3px_3px_0_0_#09090b]",
                    event ? "bg-zinc-950 text-white" : "bg-white text-zinc-950",
                  )}
                >
                  <div className="flex items-baseline gap-1 px-2.5 pt-2">
                    <span className="font-jersey text-4xl leading-none">{item.day}</span>
                    <span className="text-[10px] font-black tracking-[0.14em] text-brand-red uppercase">{item.month}</span>
                  </div>
                  <p className="px-2.5 pt-1 text-[11px] leading-tight font-black uppercase">{item.label}</p>
                  <p className={cn("px-2.5 pt-0.5 pb-2 text-[10px] font-bold", event ? "text-white/50" : "text-zinc-500")}>
                    {item.venue ?? "Liga U"}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-[2.5px] border-zinc-950 bg-zinc-100 p-5 shadow-[5px_5px_0_0_#09090b]">
            <Tag tone="ink">Participación</Tag>
            <p className="font-jersey mt-4 text-6xl leading-none text-brand-red">{participation.female}%</p>
            <p className="mt-1 text-sm font-semibold text-zinc-600">
              de las atletas son mujeres, y la temporada suma dos deportes en prueba para seguir creciendo.
            </p>
            <div className="mt-5 flex h-6 border-[2.5px] border-zinc-950">
              <span className="bg-zinc-950" style={{ width: `${participation.male}%` }} />
              <span className="bg-brand-red" style={{ width: `${participation.female}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-black tracking-[0.14em] uppercase">
              <span>Masculino {participation.male}%</span>
              <span className="text-brand-red">Femenino {participation.female}%</span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-zinc-500 uppercase">Lo nuevo de la temporada</p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-2">
              {SEASON_AXES.map((item, index) => (
                <li key={item.title} className="flex gap-3 border-b-2 border-dashed border-zinc-300 pb-3">
                  <span className="font-jersey text-3xl leading-none text-brand-red">{index + 1}</span>
                  <div>
                    <h3 className="text-sm font-black tracking-tight uppercase">{item.title}</h3>
                    <p className="mt-0.5 text-sm leading-snug text-zinc-600">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AudienceSection() {
  const peak = Math.max(...REACH_BY_PHASE.map((item) => item.value));
  return (
    <section
      id="audiencia"
      className="proposal-sheet relative isolate scroll-mt-24 overflow-hidden bg-zinc-950 py-12 text-white md:py-16"
    >
      <div aria-hidden className="absolute inset-y-0 -right-24 w-1/3 -skew-x-[14deg] bg-zinc-900" />
      <div
        aria-hidden
        className={cn("absolute inset-0 [mask-image:linear-gradient(200deg,black,transparent_50%)]", HALFTONE_RED)}
      />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <SectionHeading eyebrow="La audiencia" title="Dos millones al mes." light />
          <p className="max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Impresiones en @ligauve. La comunidad crece sola y llega a su pico cuando el torneo se define. La mayoría es público
            universitario de 18 a 24 años.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-2 border-[3px] border-white lg:grid-cols-4">
          {AUDIENCE_KPIS.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "px-4 py-5",
                index % 2 === 1 && "border-l-[3px] border-white",
                index >= 2 && "border-t-[3px] border-white lg:border-t-0",
                index === 2 && "lg:border-l-[3px]",
              )}
            >
              <dd className="font-jersey text-5xl leading-none text-white [text-shadow:3px_3px_0_#C8102E] sm:text-6xl">
                {item.value}
              </dd>
              <dt className="mt-2 text-[11px] font-black tracking-[0.16em] uppercase">{item.label}</dt>
              <p className="text-xs text-white/50">{item.detail}</p>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-[3px] border-white bg-zinc-900 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[11px] font-black tracking-[0.2em] uppercase">Alcance por fase del torneo</p>
              <p className="text-[11px] font-bold text-white/50">Impresiones al mes</p>
            </div>
            <div className="mt-6 grid h-48 grid-cols-4 items-end gap-3 sm:gap-5">
              {REACH_BY_PHASE.map((item, index) => (
                <div key={item.phase} className="flex h-full flex-col justify-end">
                  <p className="font-jersey mb-1 text-center text-2xl leading-none sm:text-3xl">{reachLabel(item.value)}</p>
                  <div
                    className={cn(
                      "border-[2.5px] border-white transition-[height] duration-700",
                      index === REACH_BY_PHASE.length - 1 ? "bg-brand-red shadow-[4px_4px_0_0_#fff]" : "bg-zinc-700",
                    )}
                    style={{ height: `${(item.value / peak) * 78}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-3 sm:gap-5">
              {REACH_BY_PHASE.map((item) => (
                <p key={item.phase} className="text-center text-[10px] font-black tracking-[0.1em] text-white/60 uppercase">
                  {item.phase}
                </p>
              ))}
            </div>
            <p className="mt-5 border-l-4 border-brand-red pl-3 text-sm text-white/75">
              Récord de <strong className="text-white">2.2M de vistas</strong> en el cierre del campeonato.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="border-[3px] border-white bg-zinc-900 p-5">
              <p className="text-[11px] font-black tracking-[0.2em] uppercase">Audiencia por edad</p>
              <div className="mt-4 flex h-7 border-[2.5px] border-white">
                {AUDIENCE_AGE.map((item, index) => (
                  <span key={item.range} className={AGE_COLORS[index]} style={{ width: `${item.share}%` }} />
                ))}
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {AUDIENCE_AGE.map((item, index) => (
                  <li key={item.range} className="flex items-center gap-2 text-xs">
                    <span className={cn("size-2.5 border border-white", AGE_COLORS[index])} />
                    <span className="flex-1 text-white/70">{item.range}</span>
                    <span className="font-jersey text-lg leading-none">{item.share}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="grid gap-2">
              {HIGH_IMPACT_FORMATS.map((item) => (
                <li key={item.title} className="flex gap-3 border-b-2 border-dashed border-white/20 pb-2">
                  <span className="mt-0.5 text-brand-red">★</span>
                  <p className="text-sm text-white/70">
                    <strong className="font-black text-white uppercase">{item.title}.</strong> {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <Tag tone="white">¿Por qué Liga U?</Tag>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_INVEST.map((item, index) => (
              <li
                key={item.title}
                className="group border-[2.5px] border-zinc-950 bg-white p-4 text-zinc-950 shadow-[5px_5px_0_0_#C8102E] transition duration-200 hover:-translate-y-1"
              >
                <span className="font-jersey text-4xl leading-none text-brand-red">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-sm font-black tracking-tight uppercase">{item.title}</h3>
                <p className="mt-1 text-sm leading-snug text-zinc-600">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
