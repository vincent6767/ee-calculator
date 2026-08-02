import { describe, expect, it } from 'vitest';
import { bandsFor, clbOf, clbs } from './bands';
import { EDU_PTS } from './tables';
import {
  affects,
  agePts,
  compute,
  frenchBonus,
  isFrench,
  l1Ability,
  studyBonus,
  type Form,
} from './scoring';

function blankForm(): Form {
  return {
    hasSpouse: null, spousePR: null, spouseAcc: null, age: '', education: '', eduCanada: null, eduLen: null,
    cdnWork: null, foreignWork: null, trade: null, l1Test: 'ielts', l1: { s: '', l: '', r: '', w: '' },
    l2Test: null, l2: { s: '', l: '', r: '', w: '' }, spEdu: '', spWork: null, spTest: 'ielts',
    sp: { s: '', l: '', r: '', w: '' }, pn: null, sibling: null,
  };
}

describe('bands', () => {
  it('maps a band label to its CLB', () => {
    expect(clbOf('ielts', 'r', '7.0 – 7.5')).toBe(9);
    expect(clbOf('celpip', 's', '9')).toBe(9);
    expect(clbOf('tef_canada', 'w', '349 – 370')).toBe(8);
  });

  it('returns 0 for an unknown label', () => {
    expect(clbOf('ielts', 's', 'not a real band')).toBe(0);
  });

  it('falls back to ielts bands for an unknown test', () => {
    // @ts-expect-error - intentionally passing an invalid test key
    expect(bandsFor('made_up')).toBe(bandsFor('ielts'));
  });

  it('clbs() maps a full s/l/r/w group in order', () => {
    expect(clbs('ielts', { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' })).toEqual([9, 9, 9, 9]);
  });
});

describe('agePts', () => {
  it('is 0 at and below 17, and at and above 45', () => {
    expect(agePts('17', false)).toBe(0);
    expect(agePts('45', false)).toBe(0);
    expect(agePts('', false)).toBe(0);
  });

  it('is 110 (single) / 100 (spouse) for the 20-29 plateau', () => {
    expect(agePts('20', false)).toBe(110);
    expect(agePts('29', false)).toBe(110);
    expect(agePts('20', true)).toBe(100);
    expect(agePts('29', true)).toBe(100);
  });

  it('spot-checks boundary ages 18, 30, 44 for both variants', () => {
    expect(agePts('18', false)).toBe(99);
    expect(agePts('18', true)).toBe(90);
    expect(agePts('30', false)).toBe(105);
    expect(agePts('30', true)).toBe(95);
    expect(agePts('44', false)).toBe(6);
    expect(agePts('44', true)).toBe(5);
  });
});

describe('l1Ability', () => {
  it('scores each CLB tier for both variants', () => {
    expect(l1Ability(10, false)).toBe(34);
    expect(l1Ability(10, true)).toBe(32);
    expect(l1Ability(9, false)).toBe(31);
    expect(l1Ability(9, true)).toBe(29);
    expect(l1Ability(8, false)).toBe(23);
    expect(l1Ability(8, true)).toBe(22);
    expect(l1Ability(7, false)).toBe(17);
    expect(l1Ability(7, true)).toBe(16);
    expect(l1Ability(6, false)).toBe(9);
    expect(l1Ability(6, true)).toBe(8);
    expect(l1Ability(4, false)).toBe(6);
    expect(l1Ability(5, true)).toBe(6);
    expect(l1Ability(3, false)).toBe(0);
  });
});

describe('EDU_PTS', () => {
  it('PhD scores 150 single / 140 with spouse', () => {
    expect(EDU_PTS.phd).toEqual([150, 140]);
  });
  it('less than high school scores 0 either way', () => {
    expect(EDU_PTS.less).toEqual([0, 0]);
  });
});

describe('affects()', () => {
  it('is true only when spouse exists, is not PR/citizen, and is accompanying', () => {
    expect(affects({ ...blankForm(), hasSpouse: false })).toBe(false);
    expect(affects({ ...blankForm(), hasSpouse: true, spousePR: true, spouseAcc: true })).toBe(false);
    expect(affects({ ...blankForm(), hasSpouse: true, spousePR: false, spouseAcc: false })).toBe(false);
    expect(affects({ ...blankForm(), hasSpouse: true, spousePR: false, spouseAcc: true })).toBe(true);
  });
});

describe('isFrench', () => {
  it('is true only for the two French tests', () => {
    expect(isFrench('tef_canada')).toBe(true);
    expect(isFrench('tcf')).toBe(true);
    expect(isFrench('ielts')).toBe(false);
    expect(isFrench(null)).toBe(false);
  });
});

describe('studyBonus', () => {
  it('is 0 when no Canadian education', () => {
    expect(studyBonus({ ...blankForm(), eduCanada: false })).toBe(0);
    expect(studyBonus({ ...blankForm(), eduCanada: null })).toBe(0);
  });
  it('is 15 for a 1-2 year credential, 30 for 3+ years', () => {
    expect(studyBonus({ ...blankForm(), eduCanada: true, eduLen: 'one_two' })).toBe(15);
    expect(studyBonus({ ...blankForm(), eduCanada: true, eduLen: 'three_plus' })).toBe(30);
  });
});

describe('frenchBonus', () => {
  it('is 0 when French is below NCLC 7', () => {
    const f = { ...blankForm(), l1Test: 'tef_canada' as const, l1: { s: '271 – 309', l: '217 – 248', r: '181 – 206', w: '271 – 309' } };
    expect(frenchBonus(f)).toBe(0);
  });
  it('is 25 when NCLC7+ in French but English below CLB5', () => {
    const f = { ...blankForm(), l1Test: 'tef_canada' as const, l1: { s: '310 – 348', l: '249 – 279', r: '207 – 232', w: '310 – 348' } };
    expect(frenchBonus(f)).toBe(25);
  });
  it('is 50 when NCLC7+ in French and English CLB5+', () => {
    const f = {
      ...blankForm(),
      l1Test: 'ielts' as const, l1: { s: '5.0', l: '5.0', r: '5.0 – 5.5', w: '5.0' },
      l2Test: 'tef_canada' as const, l2: { s: '310 – 348', l: '249 – 279', r: '207 – 232', w: '310 – 348' },
    };
    expect(frenchBonus(f)).toBe(50);
  });
});

describe('compute() - transferability', () => {
  const base = () => ({
    ...blankForm(), hasSpouse: false, age: '30', education: 'bachelors' as const, eduCanada: false,
    cdnWork: 0, foreignWork: 0, trade: false, l1Test: 'ielts' as const,
    l1: { s: '5.0', l: '5.0', r: '5.0 – 5.5', w: '5.0' }, l2Test: 'none' as const, pn: false, sibling: false,
  });

  it('caps education x language + education x work at 50', () => {
    const f = { ...base(), education: 'phd' as const, cdnWork: 5, l1: { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' } };
    expect(compute(f).transfer).toBe(50);
  });

  it('gates on foreignWork >= 3 vs >= 1 thresholds', () => {
    // base() already contributes 25 from education x language (bachelors + top-band CLB10);
    // these deltas isolate the foreign-work x language / foreign-work x Canadian-work steps.
    const strong = { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' };
    const under1 = { ...base(), foreignWork: 0, l1: strong };
    const oneToTwo = { ...base(), foreignWork: 1, l1: strong };
    const threePlus = { ...base(), foreignWork: 3, l1: strong };
    expect(compute(under1).transfer).toBe(25);
    expect(compute(oneToTwo).transfer).toBe(50);
    expect(compute(threePlus).transfer).toBe(75);
  });

  it('caps the overall transferability score at 100', () => {
    const f = {
      ...base(), education: 'phd' as const, cdnWork: 5, foreignWork: 3, trade: true,
      l1: { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' },
    };
    expect(compute(f).transfer).toBe(100);
  });
});

describe('compute() - additional points', () => {
  const base = () => ({
    ...blankForm(), hasSpouse: false, age: '30', education: 'bachelors' as const, eduCanada: false,
    cdnWork: 0, foreignWork: 0, trade: false, l1Test: 'ielts' as const,
    l1: { s: '5.0', l: '5.0', r: '5.0 – 5.5', w: '5.0' }, l2Test: 'none' as const, pn: false, sibling: false,
  });

  it('provincial nomination is worth 600', () => {
    expect(compute({ ...base(), pn: true }).additional).toBe(600);
  });
  it('sibling in Canada is worth 15', () => {
    expect(compute({ ...base(), sibling: true }).additional).toBe(15);
  });
  it('caps additional points at 600 even when PN + sibling + bonuses would exceed it', () => {
    const f = {
      ...base(), pn: true, sibling: true, eduCanada: true, eduLen: 'three_plus' as const,
      l1Test: 'tef_canada' as const, l1: { s: '393 – 450', l: '316 – 360', r: '263 – 300', w: '393 – 450' },
    };
    expect(compute(f).additional).toBe(600);
  });
});

describe('compute() - spouse block', () => {
  it('is all zero when affects() is false, even if spouse fields are filled in', () => {
    const f = {
      ...blankForm(), hasSpouse: true, spousePR: true, spouseAcc: true,
      age: '30', education: 'bachelors' as const, eduCanada: false, cdnWork: 0, foreignWork: 0, trade: false,
      l1Test: 'ielts' as const, l1: { s: '5.0', l: '5.0', r: '5.0 – 5.5', w: '5.0' }, l2Test: 'none' as const,
      spEdu: 'phd' as const, spWork: 5, spTest: 'ielts' as const, sp: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' },
      pn: false, sibling: false,
    };
    expect(compute(f).spousePts).toBe(0);
    // uses the higher single-applicant education table since spouse doesn't affect scoring
    expect(compute(f).core).toBe(compute({ ...f, spEdu: '', spWork: null, sp: { s: '', l: '', r: '', w: '' } }).core);
  });

  it('caps spouse language points at 20', () => {
    const f = {
      ...blankForm(), hasSpouse: true, spousePR: false, spouseAcc: true,
      age: '30', education: 'bachelors' as const, eduCanada: false, cdnWork: 0, foreignWork: 0, trade: false,
      l1Test: 'ielts' as const, l1: { s: '5.0', l: '5.0', r: '5.0 – 5.5', w: '5.0' }, l2Test: 'none' as const,
      spEdu: 'less' as const, spWork: 0, spTest: 'ielts' as const,
      sp: { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' },
      pn: false, sibling: false,
    };
    expect(compute(f).spousePts).toBe(20);
  });
});

describe('compute() - total cap', () => {
  it('a maxed-out with-spouse profile reaches exactly the 1200 ceiling', () => {
    // core max (460, with spouse) + spousePts max (40) + transfer max (100) + additional max (600) = 1200.
    const f: Form = {
      ...blankForm(), hasSpouse: true, spousePR: false, spouseAcc: true,
      age: '25', education: 'phd', eduCanada: true, eduLen: 'three_plus',
      cdnWork: 5, foreignWork: 3, trade: true,
      l1Test: 'ielts', l1: { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' },
      l2Test: 'tef_canada', l2: { s: '393 – 450', l: '316 – 360', r: '263 – 300', w: '393 – 450' },
      spEdu: 'phd', spWork: 5, spTest: 'ielts', sp: { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' },
      pn: true, sibling: true,
    };
    expect(compute(f)).toEqual({ total: 1200, core: 460, spousePts: 40, transfer: 100, additional: 600 });
  });
});

describe('compute() - integration fixtures', () => {
  // The samples() base profile from the design handoff (dc.html lines 624-636).
  const sampleBase: Form = {
    ...blankForm(), hasSpouse: false, age: '30', education: 'bachelors', eduCanada: false,
    cdnWork: 0, foreignWork: 3, trade: false, l1Test: 'ielts',
    l1: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' }, l2Test: 'none', pn: false, sibling: false,
  };

  it('"Current profile" sample scores 424 (core 349, transfer 75)', () => {
    expect(compute(sampleBase)).toEqual({ total: 424, core: 349, spousePts: 0, transfer: 75, additional: 0 });
  });

  it('"Retake IELTS (CLB 10)" sample scores 436', () => {
    const f = { ...sampleBase, l1: { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' } };
    expect(compute(f)).toEqual({ total: 436, core: 361, spousePts: 0, transfer: 75, additional: 0 });
  });

  it('"Finish Master\'s" sample scores 453', () => {
    const f = { ...sampleBase, education: 'masters' as const, age: '32' };
    expect(compute(f)).toEqual({ total: 453, core: 353, spousePts: 0, transfer: 100, additional: 0 });
  });

  it('a with-spouse profile exercises the spouse tables and 460 core max context', () => {
    const f: Form = {
      ...blankForm(), hasSpouse: true, spousePR: false, spouseAcc: true,
      age: '32', education: 'bachelors', eduCanada: false, cdnWork: 1, foreignWork: 2, trade: false,
      l1Test: 'ielts', l1: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' }, l2Test: 'none',
      spEdu: 'bachelors', spWork: 1, spTest: 'ielts', sp: { s: '6.0', l: '6.0', r: '6.0', w: '6.0' },
      pn: false, sibling: false,
    };
    expect(compute(f)).toEqual({ total: 446, core: 348, spousePts: 22, transfer: 76, additional: 0 });
  });

  // Spec §6.1's cited regression fixture: "a 30-year-old single applicant with a
  // Bachelor's and top-band IELTS scores nets exactly 386."
  it('the spec-cited single-applicant regression case nets exactly 386', () => {
    const f: Form = {
      ...blankForm(), hasSpouse: false, age: '30', education: 'bachelors', eduCanada: false,
      cdnWork: 0, foreignWork: 0, trade: false, l1Test: 'ielts',
      l1: { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' }, l2Test: 'none',
      pn: false, sibling: false,
    };
    expect(compute(f).total).toBe(386);
  });
});
