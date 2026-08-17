import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

// Reads the source index.html (not a built dist/) — SEO-critical markup lives directly
// in this file (see CLAUDE.md). If Phase 0's env-replacement option is ever adopted for
// the canonical domain, point this at dist/index.html instead.
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

describe('index.html SEO metadata', () => {
  it('has a title under 60 characters', () => {
    const title = norm(document.querySelector('title')?.textContent);
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('has a meta description between 150 and 160 characters', () => {
    const desc = norm(document.querySelector('meta[name="description"]')?.getAttribute('content'));
    expect(desc.length).toBeGreaterThanOrEqual(150);
    expect(desc.length).toBeLessThanOrEqual(160);
  });

  it('has exactly one <h1>', () => {
    expect(document.querySelectorAll('h1').length).toBe(1);
  });

  it('has a canonical link', () => {
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toMatch(/^https:\/\//);
  });

  it('has required Open Graph tags', () => {
    for (const prop of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url']) {
      const tag = document.querySelector(`meta[property="${prop}"]`);
      expect(tag?.getAttribute('content'), `missing og tag: ${prop}`).toBeTruthy();
    }
  });

  it('has required Twitter card tags', () => {
    for (const name of ['twitter:card', 'twitter:title', 'twitter:description']) {
      const tag = document.querySelector(`meta[name="${name}"]`);
      expect(tag?.getAttribute('content'), `missing twitter tag: ${name}`).toBeTruthy();
    }
  });

  it('headings do not skip levels inside the static content (h1 -> h2 -> h3)', () => {
    const headings = Array.from(document.querySelectorAll('#seo-content h1, #seo-content h2, #seo-content h3')).map(
      (el) => Number(el.tagName[1]),
    );
    let max = 1;
    for (const level of headings) {
      expect(level).toBeLessThanOrEqual(max + 1);
      max = Math.max(max, level);
    }
  });
});

describe('index.html structured data', () => {
  const ldJson = document.querySelector('script[type="application/ld+json"]');

  it('is present and parses as valid JSON', () => {
    expect(ldJson).toBeTruthy();
    expect(() => JSON.parse(ldJson!.textContent!)).not.toThrow();
  });

  const graph: any[] = JSON.parse(ldJson!.textContent!)['@graph'];

  it('includes a WebApplication entry with the required fields', () => {
    const app = graph.find((e) => e['@type'] === 'WebApplication');
    expect(app).toBeTruthy();
    expect(app.name).toBeTruthy();
    expect(app.description).toBeTruthy();
    expect(app.url).toMatch(/^https:\/\//);
    expect(app.applicationCategory).toBe('UtilitiesApplication');
    expect(app.operatingSystem).toBe('Any');
    expect(app.offers.price).toBe('0');
    expect(app.offers.priceCurrency).toBe('CAD');
  });

  it('includes a FAQPage entry', () => {
    const faq = graph.find((e) => e['@type'] === 'FAQPage');
    expect(faq).toBeTruthy();
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(4);
    expect(faq.mainEntity.length).toBeLessThanOrEqual(6);
  });

  it('matches the visible FAQ text exactly (Task 4.3 — the two copies must not drift)', () => {
    const faq = graph.find((e) => e['@type'] === 'FAQPage');
    const visible = Array.from(document.querySelectorAll('#seo-content h3')).map((h3) => ({
      name: norm(h3.textContent),
      text: norm(h3.nextElementSibling?.tagName === 'P' ? h3.nextElementSibling.textContent : ''),
    }));

    expect(visible.length).toBe(faq.mainEntity.length);

    visible.forEach((q, i) => {
      const entry = faq.mainEntity[i];
      expect(q.name).toBe(entry.name);
      expect(q.text).toBe(norm(entry.acceptedAnswer.text));
    });
  });
});

describe('index.html disclaimer and noscript', () => {
  it('shows the legal disclaimer text statically (spec §6.4)', () => {
    const text = norm(document.body.textContent);
    expect(text).toContain('not immigration advice');
  });

  it('has a noscript block pointing to the official IRCC calculator', () => {
    const noscript = document.querySelector('noscript');
    expect(noscript).toBeTruthy();
    expect(noscript!.innerHTML).toContain('canada.ca');
  });
});
