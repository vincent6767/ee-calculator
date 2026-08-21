import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { blankForm } from './model/form';
import { compute, type Form, type ScoreResult } from './scoring/scoring';
import { SCORING_LAST_VERIFIED } from './scoring/tables';

const GUIDES_DIR = path.resolve(__dirname, '../public/guides');
const ORIGIN = 'https://crsscenarios.com';
// Deliberately wider than index.html's 150-160 (see seo.test.ts) -- seven pages of
// copy in an 11-character window produces padded, keyword-stuffed descriptions.
const DESC_MIN = 120;
const DESC_MAX = 165;

const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

const files = fs
  .readdirSync(GUIDES_DIR)
  .filter((f) => f.endsWith('.html'))
  .sort();

interface Guide {
  file: string;
  slug: string;
  isHub: boolean;
  canonicalPath: string; // '/guides/' or '/guides/<slug>'
  document: Document;
  html: string;
}

const guides: Guide[] = files.map((file) => {
  const html = fs.readFileSync(path.join(GUIDES_DIR, file), 'utf-8');
  const slug = file.replace(/\.html$/, '');
  const isHub = slug === 'index';
  return {
    file,
    slug,
    isHub,
    canonicalPath: isHub ? '/guides/' : `/guides/${slug}`,
    document: new JSDOM(html).window.document,
    html,
  };
});

describe('guide pages exist', () => {
  it('ships the shared stylesheet', () => {
    expect(fs.existsSync(path.join(GUIDES_DIR, 'guide.css'))).toBe(true);
  });
});

describe.each(guides.map((g) => [g.file, g] as const))('%s', (_file, g) => {
  const { document } = g;

  it('has a title under 60 characters', () => {
    const title = norm(document.querySelector('title')?.textContent);
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it(`has a meta description between ${DESC_MIN} and ${DESC_MAX} characters`, () => {
    const desc = norm(document.querySelector('meta[name="description"]')?.getAttribute('content'));
    expect(desc.length).toBeGreaterThanOrEqual(DESC_MIN);
    expect(desc.length).toBeLessThanOrEqual(DESC_MAX);
  });

  it('has exactly one <h1>', () => {
    expect(document.querySelectorAll('h1').length).toBe(1);
  });

  it('self-references its extensionless canonical', () => {
    const href = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(href).toBe(`${ORIGIN}${g.canonicalPath}`);
    expect(href).not.toMatch(/\.html/);
  });

  it('has OG and Twitter tags matching the canonical and title', () => {
    for (const prop of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url']) {
      expect(
        document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content'),
        `missing og tag: ${prop}`,
      ).toBeTruthy();
    }
    for (const name of ['twitter:card', 'twitter:title', 'twitter:description']) {
      expect(
        document.querySelector(`meta[name="${name}"]`)?.getAttribute('content'),
        `missing twitter tag: ${name}`,
      ).toBeTruthy();
    }
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      `${ORIGIN}${g.canonicalPath}`,
    );
    expect(norm(document.querySelector('meta[property="og:title"]')?.getAttribute('content'))).toBe(
      norm(document.querySelector('title')?.textContent),
    );
  });

  it('links the versioned shared stylesheet and no hashed app CSS', () => {
    const hrefs = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(
      (l) => l.getAttribute('href') ?? '',
    );
    expect(hrefs).toContain('/guides/guide.css?v=1');
    expect(hrefs.some((h) => /\/assets\/index-.*\.css/.test(h))).toBe(false);
  });

  it('repeats the font preconnects and the exact index.html Google Fonts URL', () => {
    expect(document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]')).toBeTruthy();
    expect(document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]')).toBeTruthy();
    const fonts = Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com/css2"]')).map((l) =>
      l.getAttribute('href'),
    );
    expect(fonts).toHaveLength(1);
    expect(fonts[0]).toContain('family=Bricolage+Grotesque:wght@500;600;700;800');
    expect(fonts[0]).toContain('family=Figtree:wght@400;500;600;700');
    expect(fonts[0]).toContain('display=swap');
  });

  it('has a favicon and a lang attribute', () => {
    expect(document.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/favicon.svg');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  // Guard against theme.css's `.js #seo-content { display: none }` hiding the page,
  // and against accidentally mounting the SPA.
  it('does not reuse #seo-content, the js-class script, or the app entry', () => {
    expect(document.querySelector('#seo-content')).toBeNull();
    expect(g.html).not.toContain("classList.add('js')");
    expect(g.html).not.toContain('/src/main.tsx');
  });

  it('ships only the JSON-LD script -- content must not depend on JS', () => {
    const scripts = Array.from(document.querySelectorAll('script'));
    expect(scripts.length).toBe(1);
    expect(scripts[0].getAttribute('type')).toBe('application/ld+json');
  });

  it('headings do not skip levels', () => {
    const levels = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map((el) => Number(el.tagName[1]));
    let max = 1;
    for (const level of levels) {
      expect(level).toBeLessThanOrEqual(max + 1);
      max = Math.max(max, level);
    }
  });

  it('carries the exact site disclaimer wording', () => {
    const text = norm(document.body.textContent);
    expect(text).toContain('not immigration advice');
    expect(text).toContain("We make our best effort to keep it accurate and current");
    expect(text).toContain('Always confirm your score using the official IRCC tools before making decisions.');
  });

  it('links back to the calculator and the guides hub with extensionless hrefs', () => {
    const hrefs = Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')!);
    expect(hrefs).toContain('/');
    if (!g.isHub) expect(hrefs).toContain('/guides/');
    for (const h of hrefs.filter((x) => x.startsWith('/'))) {
      expect(h, `internal href must be extensionless: ${h}`).not.toMatch(/\.html(\?|#|$)/);
    }
  });

  it('opens external links safely', () => {
    for (const a of Array.from(document.querySelectorAll('a[target="_blank"]'))) {
      expect(a.getAttribute('rel') ?? '').toContain('noopener');
    }
  });

  it('reports the same scoring-verified date as the engine', () => {
    const el = document.querySelector('[data-scoring-verified]');
    expect(el).toBeTruthy();
    expect(el!.getAttribute('data-scoring-verified')).toBe(SCORING_LAST_VERIFIED);
  });
});

describe('guide structured data', () => {
  it.each(guides.map((g) => [g.file, g] as const))('%s emits a valid @graph', (_f, g) => {
    const script = g.document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();
    const graph = JSON.parse(script!.textContent!)['@graph'];
    expect(Array.isArray(graph)).toBe(true);

    const crumbs = graph.find((n: any) => n['@type'] === 'BreadcrumbList');
    expect(crumbs, 'every guide needs a BreadcrumbList').toBeTruthy();
    expect(crumbs.itemListElement[0].item).toBe(`${ORIGIN}/`);
    expect(crumbs.itemListElement[1].item).toBe(`${ORIGIN}/guides/`);

    if (g.isHub) {
      expect(graph.find((n: any) => n['@type'] === 'CollectionPage')).toBeTruthy();
      const list = graph.find((n: any) => n['@type'] === 'ItemList');
      expect(list).toBeTruthy();
      expect(list.itemListElement.length).toBe(guides.length - 1);
    } else {
      const article = graph.find((n: any) => n['@type'] === 'Article');
      expect(article).toBeTruthy();
      expect(article.url).toBe(`${ORIGIN}${g.canonicalPath}`);
      expect(article.mainEntityOfPage['@id']).toBe(`${ORIGIN}${g.canonicalPath}`);
      expect(norm(article.headline)).toBe(norm(g.document.querySelector('h1')?.textContent));
      expect(article.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  // Reuses seo.test.ts's parity rule, scoped to the guide's FAQ section.
  it.each(guides.map((g) => [g.file, g] as const))(
    '%s keeps any FAQPage word-for-word identical to the visible Q&A',
    (_f, g) => {
      const graph = JSON.parse(g.document.querySelector('script[type="application/ld+json"]')!.textContent!)[
        '@graph'
      ];
      const faq = graph.find((n: any) => n['@type'] === 'FAQPage');
      if (!faq) return; // FAQPage is opportunistic -- only where a real Q&A block exists
      expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3);

      const visible = Array.from(g.document.querySelectorAll('.guide-faq h3')).map((h3) => ({
        name: norm(h3.textContent),
        text: norm(h3.nextElementSibling?.tagName === 'P' ? h3.nextElementSibling.textContent : ''),
      }));
      expect(visible.length).toBe(faq.mainEntity.length);
      visible.forEach((q, i) => {
        expect(q.name).toBe(faq.mainEntity[i].name);
        expect(q.text).toBe(norm(faq.mainEntity[i].acceptedAnswer.text));
      });
    },
  );
});

// ---------------------------------------------------------------------------
// Worked-example registry: INPUTS ONLY. The expected number lives in the HTML;
// compute() decides who is right. Adding a number to a guide without adding its
// id here fails; leaving an id here unused by any guide also fails.
// ---------------------------------------------------------------------------
// Exact with-spouse fixture from scoring.test.ts: total 446, core 348, spousePts 22, transfer 76.
const spouseExampleForm: Form = {
  ...blankForm(),
  hasSpouse: true,
  spousePR: false,
  spouseAcc: true,
  age: '32',
  education: 'bachelors',
  eduCanada: false,
  cdnWork: 1,
  foreignWork: 2,
  trade: false,
  l1Test: 'ielts',
  l1: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' },
  l2Test: 'none',
  spEdu: 'bachelors',
  spWork: 1,
  spTest: 'ielts',
  sp: { s: '6.0', l: '6.0', r: '6.0', w: '6.0' },
  pn: false,
  sibling: false,
};

const EXAMPLES: Record<string, Form> = {
  'celpip-clb9': {
    ...blankForm(),
    hasSpouse: false,
    age: '30',
    education: '',
    eduCanada: false,
    cdnWork: 0,
    foreignWork: 0,
    trade: false,
    l1Test: 'celpip',
    l1: { s: '9', l: '9', r: '9', w: '9' },
    l2Test: 'none',
    pn: false,
    sibling: false,
  },
  'ielts-clb9': {
    ...blankForm(),
    hasSpouse: false,
    age: '30',
    education: '',
    eduCanada: false,
    cdnWork: 0,
    foreignWork: 0,
    trade: false,
    l1Test: 'ielts',
    l1: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' },
    l2Test: 'none',
    pn: false,
    sibling: false,
  },
  // The design handoff's "Current profile" sample (also verified at 424 in scoring.test.ts).
  'before-pn': {
    ...blankForm(),
    hasSpouse: false,
    age: '30',
    education: 'bachelors',
    eduCanada: false,
    cdnWork: 0,
    foreignWork: 3,
    trade: false,
    l1Test: 'ielts',
    l1: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' },
    l2Test: 'none',
    pn: false,
    sibling: false,
  },
  'after-pn': {
    ...blankForm(),
    hasSpouse: false,
    age: '30',
    education: 'bachelors',
    eduCanada: false,
    cdnWork: 0,
    foreignWork: 3,
    trade: false,
    l1Test: 'ielts',
    l1: { s: '7.0', l: '8.0', r: '7.0 – 7.5', w: '7.0' },
    l2Test: 'none',
    pn: true,
    sibling: false,
  },
  // base() from scoring.test.ts's "additional points" describe block, + pn only.
  'pn-alone': {
    ...blankForm(),
    hasSpouse: false,
    age: '30',
    education: 'bachelors',
    eduCanada: false,
    cdnWork: 0,
    foreignWork: 0,
    trade: false,
    l1Test: 'ielts',
    l1: { s: '5.0', l: '5.0', r: '5.0 – 5.5', w: '5.0' },
    l2Test: 'none',
    pn: true,
    sibling: false,
  },
  // Exact fixture from scoring.test.ts: "caps additional points at 600 even when
  // PN + sibling + bonuses would exceed it".
  'pn-saturates-cap': {
    ...blankForm(),
    hasSpouse: false,
    age: '30',
    education: 'bachelors',
    eduCanada: true,
    eduLen: 'three_plus',
    cdnWork: 0,
    foreignWork: 0,
    trade: false,
    l1Test: 'tef_canada',
    l1: { s: '393 – 450', l: '316 – 360', r: '263 – 300', w: '393 – 450' },
    l2Test: 'none',
    pn: true,
    sibling: true,
  },
  // Exact with-spouse fixture from scoring.test.ts: total 446, core 348, spousePts 22, transfer 76.
  // The worked-example page shows both spousePts and total from this same profile.
  'spouse-example': spouseExampleForm,
  'spouse-example-total': spouseExampleForm,
  // Isolates the direct CDN_WORK contribution: age-only core at 0 vs 5 years Canadian work.
  'cdn-0yr': {
    ...blankForm(),
    hasSpouse: false,
    age: '30',
    education: '',
    eduCanada: false,
    cdnWork: 0,
    foreignWork: 0,
    trade: false,
    l1Test: 'ielts',
    l1: { s: '', l: '', r: '', w: '' },
    l2Test: 'none',
    pn: false,
    sibling: false,
  },
  'cdn-5yr': {
    ...blankForm(),
    hasSpouse: false,
    age: '30',
    education: '',
    eduCanada: false,
    cdnWork: 5,
    foreignWork: 0,
    trade: false,
    l1Test: 'ielts',
    l1: { s: '', l: '', r: '', w: '' },
    l2Test: 'none',
    pn: false,
    sibling: false,
  },
  'cdn-transfer-boost': {
    ...blankForm(),
    hasSpouse: false,
    age: '30',
    education: 'bachelors',
    eduCanada: false,
    cdnWork: 2,
    foreignWork: 0,
    trade: false,
    l1Test: 'ielts',
    l1: { s: '7.5 – 9.0', l: '8.5 – 9.0', r: '8.0 – 9.0', w: '7.5 – 9.0' },
    l2Test: 'none',
    pn: false,
    sibling: false,
  },
  // frenchBonus() reads English from the first-language slot only -- French entered
  // first means `en` stays null and the function can only ever return 25.
  'french-first': {
    ...blankForm(),
    hasSpouse: false,
    l1Test: 'tef_canada',
    l1: { s: '393 – 450', l: '316 – 360', r: '263 – 300', w: '393 – 450' },
    l2Test: 'none',
    pn: false,
    sibling: false,
  },
  // Exact fixture from scoring.test.ts: "is 50 when NCLC7+ in French and English CLB5+".
  'french-second': {
    ...blankForm(),
    hasSpouse: false,
    l1Test: 'ielts',
    l1: { s: '5.0', l: '5.0', r: '5.0 – 5.5', w: '5.0' },
    l2Test: 'tef_canada',
    l2: { s: '310 – 348', l: '249 – 279', r: '207 – 232', w: '310 – 348' },
    pn: false,
    sibling: false,
  },
};

describe('worked examples match the scoring engine', () => {
  const used = new Set<string>();

  it.each(guides.map((g) => [g.file, g] as const))('%s', (_f, g) => {
    for (const el of Array.from(g.document.querySelectorAll('[data-crs-example]'))) {
      const id = el.getAttribute('data-crs-example')!;
      used.add(id);

      const form = EXAMPLES[id];
      expect(form, `unknown data-crs-example id "${id}" in ${g.file}`).toBeTruthy();

      const raw = norm(el.textContent);
      expect(raw, `${g.file}#${id} must wrap digits only, got "${raw}"`).toMatch(/^\d{1,4}$/);

      const field = (el.getAttribute('data-crs-field') ?? 'total') as keyof ScoreResult;
      expect(Number(raw), `${g.file}#${id} (${field}) drifted from compute()`).toBe(compute(form)[field]);
    }
  });

  it('has no unused registry entries', () => {
    expect(Object.keys(EXAMPLES).filter((id) => !used.has(id))).toEqual([]);
  });
});

describe('sitemap covers the guides', () => {
  const sitemap = fs.readFileSync(path.resolve(__dirname, '../public/sitemap.xml'), 'utf-8');
  const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);

  it.each(guides.map((g) => [g.file, g] as const))('%s is listed at its canonical URL', (_f, g) => {
    expect(locs).toContain(`${ORIGIN}${g.canonicalPath}`);
  });

  it('lists no .html URLs', () => {
    expect(locs.filter((l) => l.includes('.html'))).toEqual([]);
  });

  it("matches each Article.dateModified to its <lastmod>", () => {
    const entries = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)).map(
      (m) => [m[1], m[2]] as const,
    );
    for (const g of guides) {
      if (g.isHub) continue;
      const graph = JSON.parse(g.document.querySelector('script[type="application/ld+json"]')!.textContent!)[
        '@graph'
      ];
      const article = graph.find((n: any) => n['@type'] === 'Article');
      const lastmod = entries.find(([loc]) => loc === `${ORIGIN}${g.canonicalPath}`)?.[1];
      expect(article.dateModified, `${g.file} dateModified vs sitemap lastmod`).toBe(lastmod);
    }
  });
});
