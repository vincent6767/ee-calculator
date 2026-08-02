// Ported verbatim from `class Component` (dc.html lines 676-682).
import { EDU, TESTNAME, type BandGroup, type TestKey } from '../model/form';

export function fmtDate(t: number): string {
  return new Date(t).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtYears(n: number | null | undefined, max: number): string {
  if (n == null) return '';
  const s = n >= max ? n + '+' : '' + n;
  return s + (n === 1 ? ' year' : ' years');
}

export function eduLabel(v: string): string {
  const e = EDU.find((x) => x.v === v);
  return e ? e.label : '';
}

export function langSummary(test: TestKey, g: BandGroup): string {
  return TESTNAME[test] + ' · S ' + g.s + ' · L ' + g.l + ' · R ' + g.r + ' · W ' + g.w;
}

export interface Delta {
  text: string;
  color: string;
}

export function delta(v: number, base: number): Delta {
  const d = v - base;
  return {
    text: d === 0 ? '±0' : d > 0 ? '+' + d : '−' + Math.abs(d),
    color: d === 0 ? '#B7AB99' : d > 0 ? '#3E8E5F' : '#C05B4D',
  };
}
