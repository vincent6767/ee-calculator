// Ported verbatim from the design handoff `CRS Scenario Planner.dc.html`
// (class Component statics, lines 466-515). Do not re-derive these values —
// see CLAUDE.md "Critical constraints".
//
// Point tables modeled on the official CRS tables (flow doc §6) — approximate,
// cross-checked against the official calculator (single-applicant: 511; with-spouse ✓).
export const SCORING_LAST_VERIFIED = '2026-07-23';

export type EduKey =
  | 'less'
  | 'secondary'
  | 'one_year'
  | 'two_year'
  | 'bachelors'
  | 'two_plus'
  | 'masters'
  | 'phd';

export const EDU: { v: EduKey; label: string }[] = [
  { v: 'less', label: 'Less than high school' },
  { v: 'secondary', label: 'High school diploma' },
  { v: 'one_year', label: 'One-year credential' },
  { v: 'two_year', label: 'Two-year credential' },
  { v: 'bachelors', label: "Bachelor's degree (3+ years)" },
  { v: 'two_plus', label: 'Two or more credentials (one 3+ yrs)' },
  { v: 'masters', label: "Master's or professional degree" },
  { v: 'phd', label: 'Doctoral degree (PhD)' },
];

// [without spouse, with spouse]
export const EDU_PTS: Record<EduKey, [number, number]> = {
  less: [0, 0],
  secondary: [30, 28],
  one_year: [90, 84],
  two_year: [98, 91],
  bachelors: [120, 112],
  two_plus: [128, 119],
  masters: [135, 126],
  phd: [150, 140],
};

export const SP_EDU_PTS: Record<EduKey, number> = {
  less: 0,
  secondary: 2,
  one_year: 6,
  two_year: 7,
  bachelors: 8,
  two_plus: 9,
  masters: 10,
  phd: 10,
};

// indexed by years of Canadian work experience (0-5), [without spouse, with spouse]
export const CDN_WORK: [number, number][] = [
  [0, 0],
  [40, 35],
  [53, 46],
  [64, 56],
  [72, 63],
  [80, 70],
];

// indexed by spouse's years of Canadian work experience (0-5)
export const SP_WORK: number[] = [0, 5, 7, 8, 9, 10];

export type TestKey = 'celpip' | 'ielts' | 'pte' | 'tef_canada' | 'tcf';

export const TESTS: { v: TestKey; label: string }[] = [
  { v: 'celpip', label: 'CELPIP-G' },
  { v: 'ielts', label: 'IELTS General Training' },
  { v: 'pte', label: 'PTE Core' },
  { v: 'tef_canada', label: 'TEF Canada (French)' },
  { v: 'tcf', label: 'TCF Canada (French)' },
];

export const TESTNAME: Record<TestKey, string> = {
  celpip: 'CELPIP-G',
  ielts: 'IELTS',
  pte: 'PTE Core',
  tef_canada: 'TEF Canada',
  tcf: 'TCF Canada',
};

export type Skill = 's' | 'l' | 'r' | 'w';
export type BandTable = Record<Skill, [string, number][]>;

// per-test band-label -> CLB/NCLC lookup (official IRCC equivalencies)
export const BANDS: Record<TestKey, BandTable> = {
  celpip: {
    s: [['10 – 12', 10], ['9', 9], ['8', 8], ['7', 7], ['6', 6], ['5', 5], ['4', 4], ['3 or less', 0]],
    l: [['10 – 12', 10], ['9', 9], ['8', 8], ['7', 7], ['6', 6], ['5', 5], ['4', 4], ['3 or less', 0]],
    r: [['10 – 12', 10], ['9', 9], ['8', 8], ['7', 7], ['6', 6], ['5', 5], ['4', 4], ['3 or less', 0]],
    w: [['10 – 12', 10], ['9', 9], ['8', 8], ['7', 7], ['6', 6], ['5', 5], ['4', 4], ['3 or less', 0]],
  },
  pte: {
    s: [['89 – 90', 10], ['84 – 88', 9], ['76 – 83', 8], ['68 – 75', 7], ['59 – 67', 6], ['51 – 58', 5], ['42 – 50', 4], ['Below 42', 0]],
    l: [['89 – 90', 10], ['82 – 88', 9], ['71 – 81', 8], ['60 – 70', 7], ['50 – 59', 6], ['39 – 49', 5], ['28 – 38', 4], ['Below 28', 0]],
    r: [['88 – 90', 10], ['78 – 87', 9], ['69 – 77', 8], ['60 – 68', 7], ['51 – 59', 6], ['42 – 50', 5], ['33 – 41', 4], ['Below 33', 0]],
    w: [['90', 10], ['88 – 89', 9], ['79 – 87', 8], ['69 – 78', 7], ['60 – 68', 6], ['51 – 59', 5], ['41 – 50', 4], ['Below 41', 0]],
  },
  ielts: {
    s: [['7.5 – 9.0', 10], ['7.0', 9], ['6.5', 8], ['6.0', 7], ['5.5', 6], ['5.0', 5], ['4.0 – 4.5', 4], ['Below 4.0', 0]],
    l: [['8.5 – 9.0', 10], ['8.0', 9], ['7.5', 8], ['6.0 – 7.0', 7], ['5.5', 6], ['5.0', 5], ['4.5', 4], ['Below 4.5', 0]],
    r: [['8.0 – 9.0', 10], ['7.0 – 7.5', 9], ['6.5', 8], ['6.0', 7], ['5.0 – 5.5', 6], ['4.0 – 4.5', 5], ['3.5', 4], ['Below 3.5', 0]],
    w: [['7.5 – 9.0', 10], ['7.0', 9], ['6.5', 8], ['6.0', 7], ['5.5', 6], ['5.0', 5], ['4.0 – 4.5', 4], ['Below 4.0', 0]],
  },
  tef_canada: {
    s: [['393 – 450', 10], ['371 – 392', 9], ['349 – 370', 8], ['310 – 348', 7], ['271 – 309', 6], ['226 – 270', 5], ['181 – 225', 4], ['Below 181', 0]],
    l: [['316 – 360', 10], ['298 – 315', 9], ['280 – 297', 8], ['249 – 279', 7], ['217 – 248', 6], ['181 – 216', 5], ['145 – 180', 4], ['Below 145', 0]],
    r: [['263 – 300', 10], ['248 – 262', 9], ['233 – 247', 8], ['207 – 232', 7], ['181 – 206', 6], ['151 – 180', 5], ['121 – 150', 4], ['Below 121', 0]],
    w: [['393 – 450', 10], ['371 – 392', 9], ['349 – 370', 8], ['310 – 348', 7], ['271 – 309', 6], ['226 – 270', 5], ['181 – 225', 4], ['Below 181', 0]],
  },
  tcf: {
    s: [['16 – 20', 10], ['14 – 15', 9], ['12 – 13', 8], ['10 – 11', 7], ['7 – 9', 6], ['6', 5], ['4 – 5', 4], ['Below 4', 0]],
    l: [['549 – 699', 10], ['523 – 548', 9], ['503 – 522', 8], ['458 – 502', 7], ['398 – 457', 6], ['369 – 397', 5], ['331 – 368', 4], ['Below 331', 0]],
    r: [['549 – 699', 10], ['524 – 548', 9], ['499 – 523', 8], ['453 – 498', 7], ['406 – 452', 6], ['375 – 405', 5], ['342 – 374', 4], ['Below 342', 0]],
    w: [['16 – 20', 10], ['14 – 15', 9], ['12 – 13', 8], ['10 – 11', 7], ['7 – 9', 6], ['6', 5], ['4 – 5', 4], ['Below 4', 0]],
  },
};

export const SKILLS: [Skill, string][] = [
  ['s', 'Speaking'],
  ['l', 'Listening'],
  ['r', 'Reading'],
  ['w', 'Writing'],
];
