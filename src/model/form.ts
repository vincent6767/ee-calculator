// Ported verbatim from `class Component` (dc.html lines 459-464).
import type { Form } from '../scoring/scoring';

export { EDU, TESTS, TESTNAME, SKILLS, BANDS, SCORING_LAST_VERIFIED } from '../scoring/tables';
export type { EduKey, TestKey, Skill } from '../scoring/tables';
export type { Form, ScoreResult, BandGroup } from '../scoring/scoring';

export function blankForm(): Form {
  return {
    hasSpouse: null, spousePR: null, spouseAcc: null, age: '', education: '', eduCanada: null, eduLen: null,
    cdnWork: null, foreignWork: null, trade: null, l1Test: 'ielts', l1: { s: '', l: '', r: '', w: '' },
    l2Test: null, l2: { s: '', l: '', r: '', w: '' }, spEdu: '', spWork: null, spTest: 'ielts',
    sp: { s: '', l: '', r: '', w: '' }, pn: null, sibling: null,
  };
}

export interface Scenario {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  inputs: Form;
  result: import('../scoring/scoring').ScoreResult;
}
