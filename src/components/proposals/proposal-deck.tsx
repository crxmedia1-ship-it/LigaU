import { LigaULogo } from "@/components/public/brand";
import { Marquee } from "@/components/magic/marquee";
import { formatProposalMoney } from "@/lib/proposals/format";
import { PROPOSAL_SPORTS, PROPOSAL_UNIVERSITIES } from "@/lib/proposals/master";
import type { ProposalDeckData } from "@/lib/proposals/types";
import { universityLogoUrl } from "@/lib/public/university-marks";
import { cloudinaryLogo } from "@/lib/public/media";
import { cn } from "@/lib/utils";

const HALFTONE_RED = "[background-image:radial-gradient(rgba(200,16,46,0.55)_1.2px,transparent_1.6px)] [background-size:9px_9px]";
const HALFTONE_INK = "[background-image:radial-gradient(rgba(9,9,11,0.16)_1.2px,transparent_1.6px)] [background-size:9px_9px]";
function Tag({ children, tone = "red" }: { children: React.ReactNode; tone?: "red" | "ink" | "white" }) {
  return (
    <span
      className={cn(
        "inline-block -skew-x-12 px-3 py-1",
        tone === "red" && "bg-brand-red text-white",
        tone === "ink" && "bg-zinc-950 text-white",
        tone === "white" && "bg-white text-zinc-950",
      )}
    >
      <span className="inline-block skew-x-12 text-[11px] font-black tracking-[0.22em] uppercase">{children}</span>
    </span>
  );
}

function SectionHeading({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div>
      <Tag tone={light ? "white" : "red"}>{eyebrow}</Tag>
      <h2
        className={cn(
          "font-jersey mt-3 text-5xl leading-[0.85] uppercase sm:text-6xl",
          light ? "text-white [text-shadow:3px_3px_0_#C8102E]" : "text-zinc-950 [text-shadow:3px_3px_0_rgba(200,16,46,0.28)]",
        )}
      >
        {title}
      </h2>
    </div>
  );
}

export function ProposalDeck({ proposal }: { proposal: ProposalDeckData }) {
  const logo = cloudinaryLogo(proposal.logoUrl, 280) ?? proposal.logoUrl;
  const total =
    proposal.includeUpass && proposal.upassPriceAmount != null
      ? proposal.priceAmount + proposal.upassPriceAmount
      : null;
  const nav = [
    { href: "#liga", label: "La liga" },
    { href: "#marca", label: "La marca" },
    { href: "#inversion", label: "Inversión" },
    ...(proposal.includeUpass ? [{ href: "#upass", label: "U Pass" }] : []),
    { href: "#cierre", label: "Cierre" },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-zinc-100 text-zinc-950">
      <style>{`
        .ligau-canvas{visibility:hidden}
        @keyframes proposal-punch {
          0% { opacity: 0; transform: scale(1.18) skewX(-8deg); }
          60% { opacity: 1; transform: scale(0.97) skewX(0); }
          100% { transform: scale(1); }
        }
        @keyframes proposal-slide {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes proposal-pulse {
          0%, 100% { transform: rotate(-8deg) scale(1); }
          50% { transform: rotate(-8deg) scale(1.08); }
        }
        .proposal-punch { animation: proposal-punch 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .proposal-slide { animation: proposal-slide 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .proposal-pulse { animation: proposal-pulse 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .proposal-punch, .proposal-slide, .proposal-pulse, .ligau-marquee-track { animation: none !important; }
        }
        @media print {
          .proposal-chrome { display: none !important; }
          .proposal-sheet { break-inside: avoid; }
        }
      `}</style>

      <header className="proposal-chrome sticky top-0 z-30 border-b-4 border-brand-red bg-zinc-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2.5">
          <LigaULogo className="h-8 shrink-0" />
          <p className="min-w-0 flex-1 truncate text-[11px] font-black tracking-[0.2em] text-white/85 uppercase">
            Propuesta <span className="text-white/40">· {proposal.companyName}</span>
          </p>
          <nav className="hidden gap-1 md:flex" aria-label="Secciones de la propuesta">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="-skew-x-12 px-3 py-1.5 text-[11px] font-black tracking-[0.14em] text-white/70 uppercase transition hover:bg-brand-red hover:text-white"
              >
                <span className="inline-block skew-x-12">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden" aria-label="Secciones de la propuesta">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 px-2.5 py-1 text-[10px] font-black tracking-[0.14em] text-white/70 uppercase"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <div aria-hidden className="absolute inset-y-0 -right-24 w-[58%] -skew-x-[14deg] bg-brand-red sm:-right-10" />
        <div aria-hidden className="absolute inset-y-0 right-[44%] hidden w-6 -skew-x-[14deg] bg-zinc-700 sm:block" />
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 [mask-image:linear-gradient(110deg,transparent_25%,black_70%)]",
            "[background-image:radial-gradient(rgba(9,9,11,0.45)_1.4px,transparent_1.8px)] [background-size:10px_10px]",
          )}
        />

        <span
          aria-hidden
          className="font-jersey absolute bottom-[-0.1em] left-[62%] hidden text-[17rem] leading-none text-transparent select-none [-webkit-text-stroke:3px_rgba(255,255,255,0.55)] md:block xl:left-[64%] xl:text-[21rem]"
        >
          26
        </span>

        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-8 md:pt-14 md:pb-10">
          <div className="proposal-slide">
            <Tag>Propuesta oficial · {proposal.priceCaption}</Tag>
          </div>

          <div className="proposal-slide mt-6 flex items-center gap-3 [animation-delay:120ms]">
            <span className="grid size-16 place-items-center border-[2.5px] border-zinc-950 bg-white p-2 shadow-[4px_4px_0_0_#C8102E] sm:size-20">
              <LigaULogo className="h-11 sm:h-14" />
            </span>
            <span className="proposal-pulse font-jersey grid size-11 place-items-center rounded-full border-[2.5px] border-zinc-950 bg-white text-2xl text-brand-red">
              ×
            </span>
            <span className="grid size-16 place-items-center border-[2.5px] border-zinc-950 bg-white p-2 shadow-[4px_4px_0_0_#09090b] sm:size-20">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="max-h-11 max-w-13 object-contain sm:max-h-14 sm:max-w-16" />
              ) : (
                <span className="font-jersey text-4xl text-zinc-950">{proposal.companyName.slice(0, 1)}</span>
              )}
            </span>
          </div>

          <h1 className="proposal-punch font-jersey mt-6 max-w-4xl text-[4.25rem] leading-[0.8] uppercase [animation-delay:200ms] [text-shadow:5px_5px_0_#C8102E] sm:text-8xl md:text-[8rem]">
            {proposal.companyName}
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-snug font-semibold text-white/80 sm:text-xl">
            Una alianza con Liga U para la temporada universitaria de Caracas.
          </p>

          {proposal.note ? (
            <div className="relative mt-6 max-w-xl">
              <p className="relative z-10 border-[2.5px] border-zinc-950 bg-white px-4 py-3 text-[15px] leading-relaxed font-medium text-zinc-900 shadow-[4px_4px_0_0_#09090b]">
                {proposal.note}
              </p>
              <span
                aria-hidden
                className="absolute -bottom-2.5 left-8 size-5 rotate-45 border-r-[2.5px] border-b-[2.5px] border-zinc-950 bg-white"
              />
            </div>
          ) : null}

          <p className="mt-7 text-[11px] font-black tracking-[0.2em] text-white/55 uppercase">
            {proposal.contactName ? `A la atención de ${proposal.contactName}` : `Preparada para ${proposal.companyName}`}
          </p>

          <dl className="mt-8 grid max-w-xl grid-cols-3 border-[2.5px] border-zinc-950 bg-white text-zinc-950 shadow-[5px_5px_0_0_#09090b]">
            {[
              ["8", "Universidades"],
              ["9", "Deportes"],
              ["1", "Temporada"],
            ].map(([value, label], index) => (
              <div key={label} className={cn("flex flex-col items-center px-2 py-3", index > 0 && "border-l-[2.5px] border-zinc-950")}>
                <dd className="font-jersey text-5xl leading-none text-brand-red">{value}</dd>
                <dt className="mt-1 text-[9px] font-black tracking-[0.12em] text-zinc-500 uppercase sm:text-[10px]">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="liga" className="proposal-sheet relative scroll-mt-24 py-12 md:py-16">
        <div aria-hidden className={cn("absolute top-0 right-0 h-56 w-1/2 [mask-image:linear-gradient(225deg,black,transparent_70%)]", HALFTONE_INK)} />
        <div className="relative mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-[1fr_1fr] md:items-end">
          <SectionHeading eyebrow="La liga" title="Ocho universidades. Un calendario." />
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 md:text-lg">
            Liga U es el torneo universitario de Caracas. Ocho universidades, nueve deportes y un sitio donde se
            consulta el partido, la tabla y la noticia. La atención de la comunidad está en un solo lugar.
          </p>
        </div>

        <div className="relative mt-10 -rotate-[1.5deg] border-y-[3px] border-zinc-950 bg-brand-red py-4">
          <div aria-hidden className={cn("absolute inset-0 opacity-60", "[background-image:radial-gradient(rgba(9,9,11,0.35)_1.2px,transparent_1.6px)] [background-size:9px_9px]")} />
          <Marquee duration="38s" className="relative [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            {PROPOSAL_UNIVERSITIES.map((short) => {
              const mark = universityLogoUrl(short);
              return (
                <div key={short} className="flex shrink-0 items-center gap-3 pr-4">
                  <span className="grid size-16 place-items-center rounded-full border-[2.5px] border-zinc-950 bg-white shadow-[3px_3px_0_0_#09090b] transition duration-300 hover:-rotate-6 hover:scale-110 sm:size-20">
                    {mark ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mark} alt={short} className="size-11 object-contain sm:size-14" />
                    ) : null}
                  </span>
                  <span className="font-jersey text-3xl leading-none text-white [text-shadow:2px_2px_0_#09090b] sm:text-4xl">
                    {short}
                  </span>
                </div>
              );
            })}
          </Marquee>
        </div>

        <div className="relative z-10 mt-1 rotate-[1deg] border-y-[3px] border-zinc-950 bg-zinc-950 py-2.5">
          <Marquee duration="28s" reverse pauseOnHover={false}>
            {PROPOSAL_SPORTS.map((sport) => (
              <span key={sport} className="flex shrink-0 items-center gap-6">
                <span className="font-jersey text-2xl leading-none tracking-wide text-white uppercase">{sport}</span>
                <span aria-hidden className="text-lg text-brand-red">★</span>
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      <section id="marca" className="proposal-sheet relative scroll-mt-24 border-t-[3px] border-zinc-950 bg-white py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <div className="md:sticky md:top-24">
            <SectionHeading eyebrow={proposal.packageEyebrow} title={proposal.packageName} />
            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600">{proposal.packagePitch}</p>

            <div className="relative mt-6 overflow-hidden border-[3px] border-zinc-950 bg-zinc-950 text-white shadow-[6px_6px_0_0_#C8102E]">
              <div aria-hidden className="absolute inset-y-0 -right-10 w-1/2 -skew-x-[14deg] bg-brand-red" />
              <div aria-hidden className={cn("absolute inset-0 [mask-image:linear-gradient(270deg,black,transparent_60%)]", HALFTONE_INK)} />
              <div className="relative flex items-center gap-4 p-4">
                <span className="grid size-14 shrink-0 place-items-center border-[2.5px] border-zinc-950 bg-white p-1.5">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="max-h-10 max-w-11 object-contain" />
                  ) : (
                    <span className="font-jersey text-3xl text-zinc-950">{proposal.companyName.slice(0, 1)}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black tracking-[0.2em] text-white/55 uppercase">Alineación</p>
                  <p className="font-jersey truncate text-3xl leading-none uppercase">{proposal.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="font-jersey text-5xl leading-none [text-shadow:3px_3px_0_#09090b]">
                    {proposal.deliverables.length}
                  </p>
                  <p className="text-[10px] font-black tracking-[0.16em] uppercase">Entregables</p>
                </div>
              </div>
            </div>
          </div>

          <ol className="border-[3px] border-zinc-950 bg-white shadow-[6px_6px_0_0_#09090b]">
            {proposal.deliverables.map((item, index) => (
              <li
                key={item.title}
                className="group relative grid grid-cols-[3.25rem_1fr] items-center gap-3 border-b-2 border-zinc-200 px-4 py-3 transition-colors duration-200 last:border-b-0 hover:bg-zinc-950"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1.5 origin-bottom scale-y-0 bg-brand-red transition-transform duration-200 group-hover:scale-y-100"
                />
                <span className="font-jersey text-4xl leading-none text-brand-red">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-zinc-950 uppercase transition-colors group-hover:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-snug text-zinc-500 transition-colors group-hover:text-white/65">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="inversion" className="proposal-sheet relative isolate scroll-mt-24 overflow-hidden bg-zinc-950 py-12 text-white md:py-16">
        <div aria-hidden className="absolute inset-y-0 -left-20 w-1/3 -skew-x-[14deg] bg-zinc-800" />
        <div aria-hidden className={cn("absolute inset-0 [mask-image:linear-gradient(290deg,black,transparent_55%)]", HALFTONE_RED)} />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <Tag tone="white">Inversión</Tag>
            <br />
            <div className="mt-5 inline-block -rotate-2 border-[3px] border-zinc-950 bg-white px-5 py-4 text-zinc-950 shadow-[7px_7px_0_0_#C8102E]">
              <p className="text-[11px] font-black tracking-[0.2em] text-zinc-500 uppercase">{proposal.packageName}</p>
              <p className="font-jersey mt-1 text-6xl leading-none sm:text-8xl">{formatProposalMoney(proposal.priceAmount)}</p>
              <p className="mt-1 text-xs font-bold tracking-[0.14em] text-brand-red uppercase">{proposal.priceCaption}</p>
            </div>
          </div>

          {proposal.includeUpass && proposal.upassPriceAmount != null ? (
            <dl className="grid gap-3">
              {[
                ["Patrocinio", proposal.priceAmount],
                ["Liga U Pass", proposal.upassPriceAmount],
              ].map(([label, amount]) => (
                <div key={label} className="flex items-baseline justify-between border-b-2 border-dashed border-white/20 pb-2">
                  <dt className="text-xs font-black tracking-[0.18em] text-white/60 uppercase">{label}</dt>
                  <dd className="font-jersey text-3xl leading-none">{formatProposalMoney(Number(amount))}</dd>
                </div>
              ))}
              <div className="flex -skew-x-6 items-baseline justify-between bg-brand-red px-4 py-3">
                <dt className="skew-x-6 text-xs font-black tracking-[0.18em] uppercase">Total</dt>
                <dd className="font-jersey skew-x-6 text-4xl leading-none">{formatProposalMoney(total ?? 0)}</dd>
              </div>
            </dl>
          ) : proposal.includeUpass ? (
            <p className="justify-self-start border-[2.5px] border-white px-4 py-3 text-sm font-black tracking-[0.12em] uppercase md:justify-self-end">
              <span className="text-brand-red">★</span> Incluye la alianza Liga U Pass
            </p>
          ) : null}
        </div>
      </section>

      {proposal.includeUpass ? (
        <section id="upass" className="proposal-sheet relative scroll-mt-24 overflow-hidden border-b-[3px] border-zinc-950 bg-zinc-200 py-12 md:py-16">
          <div aria-hidden className={cn("absolute inset-0 [mask-image:linear-gradient(160deg,black,transparent_60%)]", HALFTONE_INK)} />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[1fr_1fr] md:items-center">
            <div>
              <SectionHeading eyebrow="Liga U Pass" title="La marca sigue en el bolsillo" />
              <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600">
                Liga U Pass es la membresía de la comunidad universitaria: estudiantes, profesores y atletas de las
                ocho universidades. {proposal.companyName} puede vivir ahí con un beneficio real, validado con la
                credencial CarnetX, abierto entre jornada y jornada.
              </p>

              <div className="mt-8 max-w-sm -rotate-3 transition duration-300 hover:rotate-0">
                <div className="relative aspect-[1.6] overflow-hidden border-[3px] border-zinc-950 bg-zinc-950 text-white shadow-[7px_7px_0_0_#C8102E]">
                  <div aria-hidden className="absolute inset-y-0 right-[18%] w-10 -skew-x-[14deg] bg-brand-red" />
                  <div aria-hidden className="absolute inset-y-0 right-[8%] w-3 -skew-x-[14deg] bg-zinc-600" />
                  <div aria-hidden className={cn("absolute inset-0 opacity-50 [mask-image:linear-gradient(120deg,transparent_40%,black)]", HALFTONE_RED)} />
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/15 animate-ligau-shine" />
                  <div className="relative flex h-full flex-col justify-between p-4">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 place-items-center bg-white p-1">
                        <LigaULogo className="h-6" />
                      </span>
                      <p className="font-jersey text-2xl leading-none tracking-wide">Liga U Pass</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-[0.2em] text-white/55 uppercase">Beneficio exclusivo</p>
                      <p className="font-jersey truncate text-4xl leading-none uppercase [text-shadow:3px_3px_0_#C8102E]">
                        {proposal.companyName}
                      </p>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-[10px] font-black tracking-[0.16em] uppercase">Válido con CarnetX</p>
                      <span
                        aria-hidden
                        className="h-7 w-24 bg-[repeating-linear-gradient(90deg,#fff_0_2px,transparent_2px_4px,#fff_4px_5px,transparent_5px_8px)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ol className="relative">
              <span aria-hidden className="absolute top-4 bottom-4 left-[1.3rem] border-l-[3px] border-dashed border-zinc-950/40" />
              {proposal.upassPoints.map((item, index) => (
                <li key={item.title} className="group relative grid grid-cols-[2.75rem_1fr] gap-4 pb-6 last:pb-0">
                  <span className="font-jersey relative grid size-11 place-items-center rounded-full border-[2.5px] border-zinc-950 bg-brand-red text-2xl leading-none text-white shadow-[3px_3px_0_0_#09090b] transition duration-200 group-hover:scale-110 group-hover:-rotate-6">
                    {index + 1}
                  </span>
                  <div className="border-[2.5px] border-zinc-950 bg-white px-4 py-3 shadow-[4px_4px_0_0_#09090b] transition duration-200 group-hover:translate-x-1 group-hover:shadow-[4px_4px_0_0_#C8102E]">
                    <h3 className="text-sm font-black tracking-tight uppercase">{item.title}</h3>
                    <p className="mt-0.5 text-sm leading-snug text-zinc-600">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section id="cierre" className="proposal-sheet relative isolate scroll-mt-24 overflow-hidden bg-brand-red py-12 text-white md:py-16">
        <div aria-hidden className={cn("absolute inset-0 opacity-70 [mask-image:linear-gradient(200deg,black,transparent_65%)]", "[background-image:radial-gradient(rgba(9,9,11,0.4)_1.4px,transparent_1.8px)] [background-size:10px_10px]")} />
        <div aria-hidden className="absolute inset-y-0 -right-16 w-1/4 -skew-x-[14deg] bg-zinc-950" />
        <div className="relative mx-auto max-w-6xl px-5">
          <Tag tone="ink">Siguiente paso</Tag>
          <h2 className="font-jersey mt-3 max-w-3xl text-6xl leading-[0.82] uppercase [text-shadow:4px_4px_0_#09090b] sm:text-7xl">
            Dejemos esta alianza en firme.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed font-semibold text-white/85 md:text-lg">
            {proposal.companyName} entra a la temporada con este alcance y esta inversión. El siguiente paso es
            confirmarlo juntos.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t-[3px] border-zinc-950/60 pt-6">
            <div className="flex items-center gap-4">
              <span className="grid size-16 place-items-center border-[2.5px] border-zinc-950 bg-white p-2 shadow-[4px_4px_0_0_#09090b]">
                <LigaULogo className="h-11" />
              </span>
              <p className="text-xs font-black tracking-[0.16em] uppercase">
                @ligauve
                <span className="block text-white/70">Temporada 2026 · Caracas</span>
              </p>
            </div>
            {proposal.validUntilLabel ? <Tag tone="ink">Válida hasta el {proposal.validUntilLabel}</Tag> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
