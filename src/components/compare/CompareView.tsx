import type { Scenario } from '../../model/form';
import type { Planner } from '../../state/usePlanner';
import { affects } from '../../scoring/scoring';
import { delta, eduLabel, fmtYears, langSummary } from '../../lib/format';
import { colors, headingFont, selectStyle, solidButton } from '../styles';

interface Cell {
  text: string;
  sub?: string;
  subColor?: string;
}

function ScorePicker({ planner }: { planner: Planner }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
      {planner.scenarios.map((s: Scenario) => {
        const checked = planner.compareSel.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => planner.toggleSel(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, background: '#fff',
              border: `1.5px solid ${checked ? colors.accent : colors.cardBorder}`, borderRadius: 16,
              padding: '14px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: colors.text, width: '100%',
            }}
          >
            <span
              style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0, fontSize: 12, fontWeight: 800,
                border: checked ? 'none' : '1.5px solid #DFD5C2', background: checked ? colors.accent : '#fff', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {checked ? '✓' : ''}
            </span>
            <span style={{ flex: 1, textAlign: 'left', fontWeight: 700 }}>{s.name}</span>
            <span style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 18 }}>{s.result.total}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CompareView({ planner }: { planner: Planner }) {
  const sel = planner.compareSel.map((id) => planner.scenarios.find((s) => s.id === id)).filter((s): s is Scenario => !!s);
  const enough = sel.length >= 2;
  const baseId = sel.length && sel.some((s) => s.id === planner.baseline) ? planner.baseline! : sel[0]?.id;
  const baseScen = sel.find((s) => s.id === baseId);

  return (
    <main data-screen-label="Compare" style={{ maxWidth: 1120, width: '100%', margin: '0 auto', padding: '8px 20px 40px', flex: 1 }}>
      <h1 style={{ fontFamily: headingFont, fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Compare scenarios</h1>

      {!enough && (
        <>
          <div style={{ fontSize: 14, color: colors.muted, marginBottom: 20 }}>Pick at least two saved scenarios to see them side by side.</div>
          {!planner.hasScenarios && (
            <div style={{ background: '#fff', border: '1.5px dashed #E7DECE', borderRadius: 20, padding: '48px 30px', textAlign: 'center' }}>
              <div style={{ fontFamily: headingFont, fontSize: 19, fontWeight: 700, marginBottom: 8 }}>No scenarios to compare yet</div>
              <div style={{ fontSize: 14, color: colors.muted, marginBottom: 20 }}>Save at least two scenarios first.</div>
              <button type="button" className="btn-solid" onClick={() => planner.setView('calc')} style={{ ...solidButton, padding: '12px 24px' }}>
                Go to the calculator
              </button>
            </div>
          )}
          <ScorePicker planner={planner} />
        </>
      )}

      {enough && baseScen && (
        <CompareTable planner={planner} sel={sel} baseId={baseId!} baseScen={baseScen} />
      )}
    </main>
  );
}

function CompareTable({ planner, sel, baseId, baseScen }: { planner: Planner; sel: Scenario[]; baseId: string; baseScen: Scenario }) {
  const cols = `200px repeat(${sel.length}, minmax(150px, 1fr))`;

  const mkRow = (label: string, get: (s: Scenario) => Cell, score = false) => {
    const vals = sel.map(get);
    const differs = new Set(vals.map((v) => v.text)).size > 1;
    return { label, vals, differs, score };
  };

  const scoreRow = (label: string, key: 'core' | 'spousePts' | 'transfer' | 'additional') =>
    mkRow(
      label,
      (s) => {
        const d = delta(s.result[key], baseScen.result[key]);
        return { text: '' + s.result[key], sub: s.id === baseId ? '' : d.text, subColor: d.color };
      },
      true,
    );

  const inputRow = (label: string, get: (i: Scenario['inputs']) => string) => mkRow(label, (s) => ({ text: get(s.inputs) || '—' }));

  const rows = [
    scoreRow('Core human capital', 'core'),
    scoreRow('Spouse factors', 'spousePts'),
    scoreRow('Skill transferability', 'transfer'),
    scoreRow('Additional points', 'additional'),
    inputRow('Spouse / partner', (i) => (!i.hasSpouse ? 'No' : i.spousePR ? 'Yes — already PR/citizen' : i.spouseAcc ? 'Yes — coming along' : 'Yes — not coming')),
    inputRow('Age', (i) => (i.age === '17' ? '17 or younger' : i.age === '45' ? '45 or older' : i.age)),
    inputRow('Education', (i) => eduLabel(i.education)),
    inputRow('Education in Canada', (i) => (i.eduCanada ? (i.eduLen === 'one_two' ? 'Yes — 1–2 year credential' : 'Yes — 3+ year credential') : 'No')),
    inputRow('Canadian work experience', (i) => fmtYears(i.cdnWork, 5)),
    inputRow('Foreign work experience', (i) => fmtYears(i.foreignWork, 3)),
    inputRow('Trade certificate', (i) => (i.trade ? 'Yes' : 'No')),
    inputRow('First language', (i) => langSummary(i.l1Test, i.l1)),
    inputRow('Second language (French)', (i) => (i.l2Test && i.l2Test !== 'none' ? langSummary(i.l2Test, i.l2) : 'None')),
  ];

  if (sel.some((s) => affects(s.inputs))) {
    rows.push(
      inputRow("Partner's education", (i) => (affects(i) ? eduLabel(i.spEdu) : '—')),
      inputRow("Partner's Canadian work", (i) => (affects(i) ? fmtYears(i.spWork, 5) : '—')),
      inputRow("Partner's language", (i) => (affects(i) ? langSummary(i.spTest, i.sp) : '—')),
    );
  }

  rows.push(
    inputRow('Provincial nomination', (i) => (i.pn ? 'Yes' : 'No')),
    inputRow('Sibling in Canada', (i) => (i.sibling ? 'Yes' : 'No')),
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ fontSize: 14, color: colors.muted }}>
          Differences between scenarios are{' '}
          <span style={{ background: '#FBF0DE', borderRadius: 6, padding: '2px 8px', color: '#6E6250', fontWeight: 600 }}>highlighted</span>. Deltas
          are vs. the baseline:
        </div>
        <select value={baseId} onChange={(e) => planner.setBaseline(e.target.value)} style={{ ...selectStyle, width: 'auto', fontWeight: 600 }}>
          {sel.map((s) => (
            <option key={s.id} value={s.id}>
              Baseline: {s.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="subtle-btn"
          onClick={() => planner.setView('saved')}
          style={{ marginLeft: 'auto', background: 'none', border: '1.5px solid #E7DECE', color: '#6E6250', borderRadius: 999, padding: '8px 16px', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
        >
          Change selection
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: '#fff', border: `1px solid ${colors.cardBorder}`, borderRadius: 20, boxShadow: '0 1px 2px rgba(60,45,25,0.04)' }}>
        <div style={{ minWidth: 620 }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'start', borderBottom: `2px solid ${colors.cardBorder}` }}>
            <div style={{ padding: '18px 16px', fontSize: 12, fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Scenario
            </div>
            {sel.map((s) => {
              const isBase = s.id === baseId;
              const d = delta(s.result.total, baseScen.result.total);
              return (
                <div key={s.id} style={{ padding: '18px 14px', borderLeft: `1px solid ${colors.divider}` }}>
                  <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 26 }}>{s.result.total}</span>
                    <span
                      style={{
                        fontSize: 12, fontWeight: 700, color: isBase ? colors.muted : d.color,
                        background: isBase ? colors.neutralTint : 'transparent', borderRadius: 999, padding: isBase ? '2px 9px' : 0,
                      }}
                    >
                      {isBase ? 'baseline' : d.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {rows.map((row) => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: cols, borderTop: `1px solid ${colors.divider}`, alignItems: 'stretch' }}>
              <div style={{ padding: '12px 16px', fontSize: 13, fontWeight: row.score ? 700 : 600, color: row.score ? colors.text : colors.muted }}>
                {row.label}
              </div>
              {row.vals.map((v, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px', fontSize: row.score ? 14 : 13.5, fontWeight: row.score ? 700 : 500, color: colors.text,
                    borderLeft: `1px solid ${colors.divider}`, background: row.differs && !row.score ? '#FBF0DE' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                  }}
                >
                  {v.text}
                  {v.sub && <span style={{ fontSize: 12, fontWeight: 700, color: v.subColor || colors.faint }}>{v.sub}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
