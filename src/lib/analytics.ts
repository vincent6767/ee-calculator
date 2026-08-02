// Privacy-friendly analytics wrapper (spec §6.6 / §9 M3). Fires named funnel
// events only — never form inputs, scores, or language results. The concrete
// provider (Plausible/Fathom/Umami/etc.) is a launch-time config decision;
// this stays a no-op until `window.plausible` (or similar) is wired in.
export type AnalyticsEvent = 'page_view' | 'calculated' | 'saved' | 'compared' | 'donate_clicked';

export function track(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  const plausible = (window as unknown as { plausible?: (event: string) => void }).plausible;
  if (typeof plausible === 'function') plausible(event);
}
