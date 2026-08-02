// Ported verbatim from `class Component` (dc.html lines 520-578).
// Do not re-derive — see CLAUDE.md "Critical constraints".
import { clbs } from './bands';
import { CDN_WORK, EDU_PTS, SP_EDU_PTS, SP_WORK, type EduKey, type Skill, type TestKey } from './tables';

export interface BandGroup extends Record<Skill, string> {}

export interface Form {
  hasSpouse: boolean | null;
  spousePR: boolean | null;
  spouseAcc: boolean | null;
  age: string;
  education: EduKey | '';
  eduCanada: boolean | null;
  eduLen: 'one_two' | 'three_plus' | null;
  cdnWork: number | null;
  foreignWork: number | null;
  trade: boolean | null;
  l1Test: TestKey;
  l1: BandGroup;
  l2Test: TestKey | 'none' | null;
  l2: BandGroup;
  spEdu: EduKey | '';
  spWork: number | null;
  spTest: TestKey;
  sp: BandGroup;
  pn: boolean | null;
  sibling: boolean | null;
}

export interface ScoreResult {
  total: number;
  core: number;
  spousePts: number;
  transfer: number;
  additional: number;
}

export function affects(f: Form): boolean {
  return f.hasSpouse === true && f.spousePR === false && f.spouseAcc === true;
}

export function isFrench(test: TestKey | 'none' | null): boolean {
  return test === 'tef_canada' || test === 'tcf';
}

const AGE_TABLE: Record<number, [number, number]> = {
  18: [99, 90], 19: [105, 95], 30: [105, 95], 31: [99, 90], 32: [94, 85], 33: [88, 80],
  34: [83, 75], 35: [77, 70], 36: [72, 65], 37: [66, 60], 38: [61, 55], 39: [55, 50],
  40: [50, 45], 41: [39, 35], 42: [28, 25], 43: [17, 15], 44: [6, 5],
};

export function agePts(age: string, w: boolean): number {
  const a = parseInt(age, 10);
  if (!a || a <= 17 || a >= 45) return 0;
  if (a >= 20 && a <= 29) return w ? 100 : 110;
  const t = AGE_TABLE[a];
  return t ? t[w ? 1 : 0] : 0;
}

export function l1Ability(clb: number, w: boolean): number {
  if (clb >= 10) return w ? 32 : 34;
  if (clb === 9) return w ? 29 : 31;
  if (clb === 8) return w ? 22 : 23;
  if (clb === 7) return w ? 16 : 17;
  if (clb === 6) return w ? 8 : 9;
  if (clb >= 4) return 6;
  return 0;
}

export function studyBonus(f: Form): number {
  return f.eduCanada ? (f.eduLen === 'one_two' ? 15 : f.eduLen === 'three_plus' ? 30 : 0) : 0;
}

export function frenchBonus(f: Form): number {
  let fr: number[] | null = null;
  let en: number[] | null = null;
  if (isFrench(f.l1Test)) {
    fr = clbs(f.l1Test, f.l1);
  } else {
    en = clbs(f.l1Test, f.l1);
    if (f.l2Test && f.l2Test !== 'none') fr = clbs(f.l2Test, f.l2);
  }
  if (!fr || Math.min(...fr) < 7) return 0;
  return en && Math.min(...en) >= 5 ? 50 : 25;
}

export function compute(f: Form): ScoreResult {
  const w = affects(f);
  const l1c = clbs(f.l1Test, f.l1);
  const minL1 = Math.min(...l1c);
  const age = agePts(f.age, w);
  const edu = (f.education ? EDU_PTS[f.education] : [0, 0])[w ? 1 : 0];
  const l1 = l1c.reduce((s, c) => s + l1Ability(c, w), 0);
  let l2 = 0;
  if (f.l2Test && f.l2Test !== 'none') {
    l2 = clbs(f.l2Test, f.l2).reduce((s, c) => s + (c >= 9 ? 6 : c >= 7 ? 3 : c >= 5 ? 1 : 0), 0);
    l2 = Math.min(l2, w ? 22 : 24);
  }
  const cdn = CDN_WORK[Math.min(f.cdnWork || 0, 5)][w ? 1 : 0];
  const core = age + edu + l1 + l2 + cdn;

  let spousePts = 0;
  if (w) {
    spousePts += (f.spEdu ? SP_EDU_PTS[f.spEdu] : 0) || 0;
    spousePts += Math.min(
      clbs(f.spTest, f.sp).reduce((s, c) => s + (c >= 9 ? 5 : c >= 7 ? 3 : c >= 5 ? 1 : 0), 0),
      20,
    );
    spousePts += SP_WORK[Math.min(f.spWork || 0, 5)];
  }

  const oneCred = f.education === 'one_year' || f.education === 'two_year' || f.education === 'bachelors';
  const twoCred = f.education === 'two_plus' || f.education === 'masters' || f.education === 'phd';
  const eduLang = minL1 >= 9 ? (twoCred ? 50 : oneCred ? 25 : 0) : minL1 >= 7 ? (twoCred ? 25 : oneCred ? 13 : 0) : 0;
  const eduWork = (f.cdnWork ?? 0) >= 2 ? (twoCred ? 50 : oneCred ? 25 : 0) : (f.cdnWork ?? 0) >= 1 ? (twoCred ? 25 : oneCred ? 13 : 0) : 0;
  const fwLang = (f.foreignWork ?? 0) >= 3 ? (minL1 >= 9 ? 50 : minL1 >= 7 ? 25 : 0) : (f.foreignWork ?? 0) >= 1 ? (minL1 >= 9 ? 25 : minL1 >= 7 ? 13 : 0) : 0;
  const fwCdn = (f.foreignWork ?? 0) >= 3 ? ((f.cdnWork ?? 0) >= 2 ? 50 : (f.cdnWork ?? 0) >= 1 ? 25 : 0) : (f.foreignWork ?? 0) >= 1 ? ((f.cdnWork ?? 0) >= 2 ? 25 : (f.cdnWork ?? 0) >= 1 ? 13 : 0) : 0;
  const cert = f.trade ? (minL1 >= 7 ? 50 : minL1 >= 5 ? 25 : 0) : 0;
  const transfer = Math.min(Math.min(eduLang + eduWork, 50) + Math.min(fwLang + fwCdn, 50) + Math.min(cert, 50), 100);

  let additional = 0;
  if (f.pn) additional += 600;
  if (f.sibling) additional += 15;
  additional += studyBonus(f);
  additional += frenchBonus(f);
  additional = Math.min(additional, 600);

  const total = Math.min(core + spousePts + transfer + additional, 1200);
  return { total, core, spousePts, transfer, additional };
}
