/**
 * Plan dates are calendar days, not instants. Everything here works on
 * "YYYY-MM-DD" strings in the cook's own timezone -- going through Date
 * arithmetic in UTC is how a Sunday dinner ends up filed under Monday.
 */
export type IsoDate = string;

export function toIsoDate(d: Date): IsoDate {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIso(): IsoDate {
  return toIsoDate(new Date());
}

/** Parses "YYYY-MM-DD" as local midnight, not UTC. */
export function fromIsoDate(iso: IsoDate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const d = fromIsoDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/**
 * The seven days starting today rather than a fixed Sun–Sat week: on a
 * Thursday you care about the next seven dinners, not the three days left
 * in this calendar week.
 */
export function weekFrom(startIso: IsoDate, length = 7): IsoDate[] {
  return Array.from({ length }, (_, i) => addDays(startIso, i));
}

export function dayLabel(iso: IsoDate, todayRef: IsoDate = todayIso()): string {
  if (iso === todayRef) return "Today";
  if (iso === addDays(todayRef, 1)) return "Tomorrow";
  return fromIsoDate(iso).toLocaleDateString(undefined, { weekday: "long" });
}

export function shortDate(iso: IsoDate): string {
  return fromIsoDate(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
