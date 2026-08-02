import { describe, expect, it } from 'vitest';
import { blankForm } from './form';
import { missing, sectionsDone } from './validation';

describe('missing()', () => {
  it('lists everything for a blank form, starting with spouse/partner', () => {
    const m = missing(blankForm());
    expect(m[0]).toBe('Spouse or partner');
    expect(m).toContain('Age');
    expect(m).toContain('Education level');
    expect(m).toContain('First-language score bands');
    expect(m).toContain('Second language (or "not applicable")');
    expect(m).toContain('Provincial nomination');
    expect(m).toContain('Sibling in Canada');
  });

  it('no-spouse branch: does not ask partner questions', () => {
    const f = { ...blankForm(), hasSpouse: false };
    const m = missing(f);
    expect(m).not.toContain('Partner PR/citizen status');
    expect(m).not.toContain('Is your partner coming?');
    expect(m).not.toContain("Partner's education");
  });

  it('spouse-PR branch: asks PR status but not "coming along" or partner fields', () => {
    const f1 = { ...blankForm(), hasSpouse: true };
    expect(missing(f1)).toContain('Partner PR/citizen status');

    const f2 = { ...blankForm(), hasSpouse: true, spousePR: true };
    const m2 = missing(f2);
    expect(m2).not.toContain('Is your partner coming?');
    expect(m2).not.toContain("Partner's education");
  });

  it('spouse-accompanying branch: asks "is partner coming" then partner fields once accompanying', () => {
    const f1 = { ...blankForm(), hasSpouse: true, spousePR: false };
    expect(missing(f1)).toContain('Is your partner coming?');

    const f2 = { ...blankForm(), hasSpouse: true, spousePR: false, spouseAcc: true };
    const m2 = missing(f2);
    expect(m2).toContain("Partner's education");
    expect(m2).toContain("Partner's Canadian work");
    expect(m2).toContain("Partner's score bands");
  });

  it('education-in-Canada branch: only asks credential length when eduCanada is true', () => {
    const noCanada = { ...blankForm(), eduCanada: false };
    expect(missing(noCanada)).not.toContain('Canadian credential length');

    const yesCanadaNoLen = { ...blankForm(), eduCanada: true };
    expect(missing(yesCanadaNoLen)).toContain('Canadian credential length');

    const yesCanadaWithLen = { ...blankForm(), eduCanada: true, eduLen: 'one_two' as const };
    expect(missing(yesCanadaWithLen)).not.toContain('Canadian credential length');
  });

  it('L2 branch: "not applicable" needs no bands, any real test needs bands', () => {
    const notApplicable = { ...blankForm(), l2Test: 'none' as const };
    expect(missing(notApplicable)).not.toContain('French score bands');

    const noBands = { ...blankForm(), l2Test: 'tef_canada' as const };
    expect(missing(noBands)).toContain('French score bands');

    const withBands = {
      ...blankForm(), l2Test: 'tef_canada' as const,
      l2: { s: '310 – 348', l: '249 – 279', r: '207 – 232', w: '310 – 348' },
    };
    expect(missing(withBands)).not.toContain('French score bands');
  });

  it('a fully filled-in single-applicant form has nothing missing', () => {
    const f = {
      ...blankForm(), hasSpouse: false, age: '30', education: 'bachelors' as const, eduCanada: false,
      cdnWork: 0, foreignWork: 0, trade: false, l1Test: 'ielts' as const,
      l1: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' }, l2Test: 'none' as const, pn: false, sibling: false,
    };
    expect(missing(f)).toEqual([]);
  });
});

describe('sectionsDone()', () => {
  it('toggles "Your family situation" through the branches', () => {
    const done = (f: Parameters<typeof sectionsDone>[0]) =>
      sectionsDone(f).find((s) => s.name === 'Your family situation')!.done;

    expect(done({ ...blankForm(), hasSpouse: null })).toBe(false);
    expect(done({ ...blankForm(), hasSpouse: false })).toBe(true);
    expect(done({ ...blankForm(), hasSpouse: true, spousePR: null })).toBe(false);
    expect(done({ ...blankForm(), hasSpouse: true, spousePR: true })).toBe(true);
    expect(done({ ...blankForm(), hasSpouse: true, spousePR: false, spouseAcc: null })).toBe(false);
    expect(done({ ...blankForm(), hasSpouse: true, spousePR: false, spouseAcc: false })).toBe(true);
  });

  it('only includes "Your partner" section when affects() is true', () => {
    const noSpouse = sectionsDone({ ...blankForm(), hasSpouse: false });
    expect(noSpouse.some((s) => s.name === 'Your partner')).toBe(false);

    const spousePR = sectionsDone({ ...blankForm(), hasSpouse: true, spousePR: true });
    expect(spousePR.some((s) => s.name === 'Your partner')).toBe(false);

    const affecting = sectionsDone({ ...blankForm(), hasSpouse: true, spousePR: false, spouseAcc: true });
    expect(affecting.some((s) => s.name === 'Your partner')).toBe(true);
  });

  it('"Extra points" is always the last section', () => {
    const list = sectionsDone(blankForm());
    expect(list[list.length - 1].name).toBe('Extra points');
  });
});
