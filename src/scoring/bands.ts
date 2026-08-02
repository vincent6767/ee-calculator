// Ported verbatim from `class Component` (dc.html lines 517-519).
import { BANDS, type Skill, type TestKey } from './tables';

export function bandsFor(test: TestKey) {
  return BANDS[test] || BANDS.ielts;
}

export function clbOf(test: TestKey, skill: Skill, label: string): number {
  const b = bandsFor(test)[skill].find((x) => x[0] === label);
  return b ? b[1] : 0;
}

export function clbs(test: TestKey, group: Record<Skill, string>): number[] {
  return (['s', 'l', 'r', 'w'] as Skill[]).map((k) => clbOf(test, k, group[k]));
}
