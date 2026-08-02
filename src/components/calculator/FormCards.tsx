import type { ReactNode } from 'react';
import type { Planner } from '../../state/usePlanner';
import { EDU, TESTS } from '../../model/form';
import type { TestKey } from '../../model/form';
import { studyBonus, frenchBonus } from '../../scoring/scoring';
import { PillGroup, YES_NO } from './Pill';
import { BandSelectGrid } from './BandSelect';
import { card, cardHeading, colors, helperText, numberChip, questionLabel, selectStyle } from '../styles';

const ageOptions = [
  { v: '17', label: '17 or younger' },
  ...Array.from({ length: 44 - 18 + 1 }, (_, i) => {
    const a = 18 + i;
    return { v: '' + a, label: '' + a };
  }),
  { v: '45', label: '45 or older' },
];

function nYears(max: number) {
  return Array.from({ length: max + 1 }, (_, i) => ({
    v: i,
    label: i >= max ? max + '+' : '' + i + (i === 1 ? ' year' : i === 0 ? ' — none' : ' years'),
  }));
}

function CardShell({ num, title, tag, children }: { num: number | string; title: string; tag?: string; children: ReactNode }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={numberChip}>{num}</div>
        <h2 style={cardHeading}>{title}</h2>
        {tag && (
          <span style={{ fontSize: 12, color: colors.muted, background: '#F5EFE5', borderRadius: 999, padding: '3px 10px' }}>
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function FamilyCard({ planner }: { planner: Planner }) {
  const f = planner.form;
  return (
    <CardShell num={1} title="Your family situation">
      <div style={questionLabel}>Do you have a spouse or common-law partner?</div>
      <PillGroup options={YES_NO} value={f.hasSpouse} onSelect={(v) => planner.sf({ hasSpouse: v, spousePR: null, spouseAcc: null })} />

      {f.hasSpouse === true && (
        <div style={{ marginTop: 20 }}>
          <div style={questionLabel}>Is your partner already a Canadian citizen or permanent resident?</div>
          <PillGroup options={YES_NO} value={f.spousePR} onSelect={(v) => planner.sf({ spousePR: v, spouseAcc: null })} />
        </div>
      )}

      {f.hasSpouse === true && f.spousePR === true && (
        <div style={{ marginTop: 16, background: colors.successBg, border: `1px solid ${colors.successBorder}`, borderRadius: 14, padding: '12px 16px', fontSize: 13.5, color: colors.successText, lineHeight: 1.5 }}>
          Good news — since your partner is already a citizen or PR, you're scored with the higher{' '}
          <strong>single-applicant</strong> tables, and we can skip all the partner questions.
        </div>
      )}

      {f.hasSpouse === true && f.spousePR === false && (
        <div style={{ marginTop: 20 }}>
          <div style={questionLabel}>Will your partner come with you to Canada?</div>
          <PillGroup options={YES_NO} value={f.spouseAcc} onSelect={(v) => planner.sf({ spouseAcc: v })} />
        </div>
      )}
    </CardShell>
  );
}

export function AboutCard({ planner }: { planner: Planner }) {
  const f = planner.form;
  return (
    <CardShell num={2} title="About you">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginBottom: 20 }}>
        <label style={{ display: 'block' }}>
          <div style={questionLabel}>How old are you?</div>
          <select value={f.age} onChange={(e) => planner.sf({ age: e.target.value })} style={selectStyle}>
            <option value="">Select your age…</option>
            {ageOptions.map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'block' }}>
          <div style={questionLabel}>Highest level of education</div>
          <select value={f.education} onChange={(e) => planner.sf({ education: e.target.value as typeof f.education })} style={selectStyle}>
            <option value="">Select education level…</option>
            {EDU.map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={questionLabel}>Was any of that education earned in Canada?</div>
      <div style={helperText}>This doesn't change your core education points — it only unlocks the "study in Canada" bonus.</div>
      <PillGroup options={YES_NO} value={f.eduCanada} onSelect={(v) => planner.sf({ eduCanada: v, eduLen: null })} />
      {f.eduCanada === true && (
        <div style={{ marginTop: 18 }}>
          <div style={questionLabel}>How long was that Canadian credential?</div>
          <PillGroup
            options={[
              { v: 'one_two', label: '1 or 2 years' },
              { v: 'three_plus', label: '3 years or longer' },
            ]}
            value={f.eduLen}
            onSelect={(v) => planner.sf({ eduLen: v })}
          />
        </div>
      )}
    </CardShell>
  );
}

export function WorkCard({ planner }: { planner: Planner }) {
  const f = planner.form;
  return (
    <CardShell num={3} title="Work experience">
      <div style={questionLabel}>Years of skilled work experience in Canada</div>
      <PillGroup options={nYears(5)} value={f.cdnWork} onSelect={(v) => planner.sf({ cdnWork: v })} style={{ marginBottom: 20 }} />
      <div style={questionLabel}>Years of skilled work experience outside Canada</div>
      <PillGroup options={nYears(3)} value={f.foreignWork} onSelect={(v) => planner.sf({ foreignWork: v })} style={{ marginBottom: 20 }} />
      <div style={questionLabel}>Do you have a certificate of qualification in a trade from a Canadian province or territory?</div>
      <PillGroup options={YES_NO} value={f.trade} onSelect={(v) => planner.sf({ trade: v })} />
    </CardShell>
  );
}

export function LanguageCard({ planner }: { planner: Planner }) {
  const f = planner.form;
  return (
    <CardShell num={4} title="Language">
      <label style={{ display: 'block', maxWidth: 340, marginBottom: 16 }}>
        <div style={questionLabel}>First official language — which test did you take?</div>
        <select
          value={f.l1Test}
          onChange={(e) => planner.sf({ l1Test: e.target.value as TestKey, l1: { s: '', l: '', r: '', w: '' } })}
          style={selectStyle}
        >
          {TESTS.map((t) => (
            <option key={t.v} value={t.v}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <div style={helperText}>Pick the score band you got for each ability — these are {f.l1Test.toUpperCase()} bands, not CLB levels.</div>
      <BandSelectGrid test={f.l1Test} group={f.l1} onChange={(skill, value) => planner.sfBand('l1', skill, value)} />

      <div style={{ borderTop: `1px dashed ${colors.dividerDashed}`, margin: '20px 0' }} />

      <div style={questionLabel}>Second official language (French)</div>
      <div style={helperText}>Only a French test counts as a second language — it adds core points plus a French-skills bonus.</div>
      <PillGroup
        options={[
          { v: 'tef_canada', label: 'TEF Canada' },
          { v: 'tcf', label: 'TCF Canada' },
          { v: 'none', label: 'Not applicable' },
        ]}
        value={f.l2Test}
        onSelect={(v) => planner.sf({ l2Test: v, l2: { s: '', l: '', r: '', w: '' } })}
      />
      {f.l2Test != null && f.l2Test !== 'none' && (
        <div style={{ marginTop: 16 }}>
          <BandSelectGrid test={f.l2Test} group={f.l2} onChange={(skill, value) => planner.sfBand('l2', skill, value)} />
        </div>
      )}
    </CardShell>
  );
}

export function PartnerCard({ planner }: { planner: Planner }) {
  const f = planner.form;
  if (!planner.affects) return null;
  return (
    <CardShell num={5} title="Your partner" tag="up to 40 points">
      <label style={{ display: 'block', maxWidth: 340, marginBottom: 20 }}>
        <div style={questionLabel}>Partner's highest level of education</div>
        <select value={f.spEdu} onChange={(e) => planner.sf({ spEdu: e.target.value as typeof f.spEdu })} style={selectStyle}>
          <option value="">Select education level…</option>
          {EDU.map((o) => (
            <option key={o.v} value={o.v}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div style={questionLabel}>Partner's years of skilled work in Canada</div>
      <PillGroup options={nYears(5)} value={f.spWork} onSelect={(v) => planner.sf({ spWork: v })} style={{ marginBottom: 20 }} />
      <label style={{ display: 'block', maxWidth: 340, marginBottom: 16 }}>
        <div style={questionLabel}>Partner's language test</div>
        <select
          value={f.spTest}
          onChange={(e) => planner.sf({ spTest: e.target.value as TestKey, sp: { s: '', l: '', r: '', w: '' } })}
          style={selectStyle}
        >
          {TESTS.map((t) => (
            <option key={t.v} value={t.v}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <BandSelectGrid test={f.spTest} group={f.sp} onChange={(skill, value) => planner.sfBand('sp', skill, value)} />
    </CardShell>
  );
}

export function ExtraCard({ planner }: { planner: Planner }) {
  const f = planner.form;
  const study = studyBonus(f);
  const french = frenchBonus(f);
  const studyLabel =
    f.eduCanada == null
      ? 'answer above to find out'
      : study
        ? '+' + study + ' points'
        : f.eduCanada && !f.eduLen
          ? 'pick a credential length above'
          : 'not earned (no Canadian credential)';
  const frenchLabel = french ? '+' + french + ' points' : 'not earned — needs NCLC 7+ in all four French abilities';

  return (
    <CardShell num={planner.affects ? 6 : 5} title="Extra points">
      <div style={questionLabel}>Do you have a provincial or territorial nomination?</div>
      <PillGroup options={YES_NO} value={f.pn} onSelect={(v) => planner.sf({ pn: v })} style={{ marginBottom: 20 }} />
      <div style={questionLabel}>Do you have a sibling in Canada who is a citizen or PR (18 or older)?</div>
      <PillGroup options={YES_NO} value={f.sibling} onSelect={(v) => planner.sf({ sibling: v })} style={{ marginBottom: 20 }} />
      <div style={{ background: '#F9F5EC', border: '1px solid #EFE7DA', borderRadius: 14, padding: '14px 16px', fontSize: 13.5, color: '#6E6250', lineHeight: 1.7 }}>
        <div style={{ fontWeight: 700, color: '#5C5142', marginBottom: 4 }}>Applied automatically from your answers above</div>
        <div>
          Study in Canada: <strong>{studyLabel}</strong>
        </div>
        <div>
          French-language bonus: <strong>{frenchLabel}</strong>
        </div>
      </div>
    </CardShell>
  );
}

export function FormCards({ planner }: { planner: Planner }) {
  return (
    <div style={{ flex: '1 1 540px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <FamilyCard planner={planner} />
      <AboutCard planner={planner} />
      <WorkCard planner={planner} />
      <LanguageCard planner={planner} />
      <PartnerCard planner={planner} />
      <ExtraCard planner={planner} />
    </div>
  );
}
