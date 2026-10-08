const MONEY = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 0 });

export function formatProposalMoney(amount: number) {
  return `USD ${MONEY.format(amount)}`;
}

export function formatProposalDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

const AMOUNT = /^\d{1,8}$/;

/** Whole USD amounts typed in the admin. Empty string is an absent optional price. */
export function parseProposalAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!AMOUNT.test(trimmed)) return null;
  const amount = Number(trimmed);
  if (amount > 10_000_000) return null;
  return amount;
}
