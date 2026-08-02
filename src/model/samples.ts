// Ported verbatim from `class Component.samples()` (dc.html lines 624-636).
import { compute } from '../scoring/scoring';
import { blankForm } from './form';
import type { Form, Scenario } from './form';

export function samples(): Scenario[] {
  const mk = (name: string, patch: Partial<Form>, daysAgo: number): Scenario => {
    const f = { ...blankForm(), ...patch };
    const now = Date.now() - daysAgo * 86400000;
    return {
      id: 'sample-' + name.replace(/\W/g, ''),
      name,
      createdAt: now,
      updatedAt: now,
      inputs: f,
      result: compute(f),
    };
  };
  const base: Partial<Form> = {
    hasSpouse: false, age: '30', education: 'bachelors', eduCanada: false, cdnWork: 0, foreignWork: 3,
    trade: false, l1Test: 'ielts', l1: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' }, l2Test: 'none',
    pn: false, sibling: false,
  };
  return [
    mk('Current profile', base, 12),
    mk('Retake IELTS (CLB 10)', { ...base, l1: { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' } }, 5),
    mk("Finish Master's", { ...base, education: 'masters', age: '32' }, 1),
  ];
}
