// Ported verbatim from `class Component` (dc.html lines 580-617).
import { affects } from '../scoring/scoring';
import { SKILLS } from '../scoring/tables';
import type { BandGroup, Form } from '../scoring/scoring';

const skillKeys = SKILLS.map(([k]) => k);
const bandDone = (g: BandGroup) => skillKeys.every((k) => g[k]);

export function missing(f: Form): string[] {
  const m: string[] = [];
  if (f.hasSpouse == null) m.push('Spouse or partner');
  if (f.hasSpouse) {
    if (f.spousePR == null) m.push('Partner PR/citizen status');
    else if (f.spousePR === false && f.spouseAcc == null) m.push('Is your partner coming?');
  }
  if (!f.age) m.push('Age');
  if (!f.education) m.push('Education level');
  if (f.eduCanada == null) m.push('Education in Canada');
  else if (f.eduCanada && !f.eduLen) m.push('Canadian credential length');
  if (f.cdnWork == null) m.push('Canadian work experience');
  if (f.foreignWork == null) m.push('Foreign work experience');
  if (f.trade == null) m.push('Trade certificate');
  if (skillKeys.some((k) => !f.l1[k])) m.push('First-language score bands');
  if (f.l2Test == null) m.push('Second language (or "not applicable")');
  else if (f.l2Test !== 'none' && skillKeys.some((k) => !f.l2[k])) m.push('French score bands');
  if (affects(f)) {
    if (!f.spEdu) m.push("Partner's education");
    if (f.spWork == null) m.push("Partner's Canadian work");
    if (skillKeys.some((k) => !f.sp[k])) m.push("Partner's score bands");
  }
  if (f.pn == null) m.push('Provincial nomination');
  if (f.sibling == null) m.push('Sibling in Canada');
  return m;
}

export interface SectionStatus {
  name: string;
  done: boolean;
}

export function sectionsDone(f: Form): SectionStatus[] {
  const list: SectionStatus[] = [
    {
      name: 'Your family situation',
      done: f.hasSpouse === false || (f.hasSpouse === true && (f.spousePR === true || (f.spousePR === false && f.spouseAcc != null))),
    },
    {
      name: 'About you',
      done: !!f.age && !!f.education && (f.eduCanada === false || (f.eduCanada === true && !!f.eduLen)),
    },
    { name: 'Work experience', done: f.cdnWork != null && f.foreignWork != null && f.trade != null },
    { name: 'Language', done: bandDone(f.l1) && (f.l2Test === 'none' || (!!f.l2Test && bandDone(f.l2))) },
  ];
  if (affects(f)) list.push({ name: 'Your partner', done: !!f.spEdu && f.spWork != null && bandDone(f.sp) });
  list.push({ name: 'Extra points', done: f.pn != null && f.sibling != null });
  return list;
}
