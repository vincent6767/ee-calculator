import type { Planner } from '../../state/usePlanner';
import { colors, headingFont, outlineButton, selectStyle, solidButton } from '../styles';

function bar(pts: number, max: number) {
  return {
    width: Math.min(100, Math.round((pts / max) * 100)) + '%',
    height: '100%',
    background: colors.accent,
    borderRadius: 999,
    transition: 'width .4s ease',
  };
}

export function ScoreCard({ planner }: { planner: Planner }) {
  const r = planner.result;
  const coreMax = planner.affects ? 460 : 500;
  const canCalc = planner.canCalculate;
  const currentScenario = planner.scenarios.find((s) => s.id === planner.currentId);

  const breakdown = r
    ? [
        { label: 'Core human capital', pts: r.core, max: coreMax },
        { label: 'Spouse factors', pts: r.spousePts, max: 40 },
        { label: 'Skill transferability', pts: r.transfer, max: 100 },
        { label: 'Additional points', pts: r.additional, max: 600 },
      ]
    : [];

  const missingLabel = canCalc
    ? 'All set — ready to calculate'
    : planner.missing.length + (planner.missing.length === 1 ? ' answer' : ' answers') + ' still needed';

  return (
    <div style={{ flex: '1 1 300px', maxWidth: 390, position: 'sticky', top: 16 }}>
      <div style={{ background: '#fff', border: `1px solid ${colors.cardBorder}`, borderRadius: 20, padding: 26, boxShadow: '0 6px 24px rgba(60,45,25,0.07)' }}>
        {currentScenario && (
          <div style={{ display: 'inline-block', background: colors.neutralTint, color: '#6E6250', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
            Editing: {currentScenario.name}
          </div>
        )}

        {r ? (
          <div style={{ animation: 'fadeUp .35s ease' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Your CRS score
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '6px 0 4px' }}>
              <div style={{ fontFamily: headingFont, fontSize: 58, fontWeight: 800, lineHeight: 1, color: colors.text }}>{r.total}</div>
              <div style={{ fontSize: 14, color: colors.muted }}>out of 1,200</div>
            </div>

            {r.stale && (
              <div style={{ background: colors.warnBg, border: `1px solid ${colors.warnBorder}`, borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7A683F', margin: '12px 0' }}>
                Your answers changed since this score.{' '}
                <button
                  type="button"
                  onClick={planner.calculate}
                  style={{ background: 'none', border: 'none', color: colors.accentHover, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0, textDecoration: 'underline' }}
                >
                  Recalculate
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '18px 0 22px' }}>
              {breakdown.map((p) => (
                <div key={p.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ color: '#6E6250', fontWeight: 600 }}>{p.label}</span>
                    <span style={{ fontWeight: 700, color: colors.text }}>
                      {p.pts} / {p.max}
                    </span>
                  </div>
                  <div style={{ height: 8, background: colors.neutralTint, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={bar(p.pts, p.max)} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${colors.cardBorder}`, paddingTop: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#4A4234', marginBottom: 8 }}>Save this scenario</div>
              <input
                value={planner.saveName}
                onChange={(e) => planner.setSaveName(e.target.value)}
                placeholder="e.g. Current profile"
                style={{ ...selectStyle, marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn-solid" onClick={() => planner.save(false)} style={{ ...solidButton, flex: 1 }}>
                  {currentScenario ? 'Update scenario' : 'Save scenario'}
                </button>
                {currentScenario && (
                  <button type="button" className="btn-outline" onClick={() => planner.save(true)} style={outlineButton}>
                    Save as new
                  </button>
                )}
              </div>
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 10, lineHeight: 1.5 }}>
                Saved to this browser on this device only. Clearing browser data removes saved scenarios.
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: headingFont, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Your score</div>
            <div style={{ fontSize: 13.5, color: colors.muted, marginBottom: 18, lineHeight: 1.5 }}>
              Answer every section, then calculate. You'll get a full breakdown of where your points come from.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
              {planner.sections.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 18, height: 18, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 800,
                      border: s.done ? 'none' : '1.5px solid #DFD5C2', background: s.done ? colors.deltaGreen : '#fff', color: '#fff',
                    }}
                  >
                    {s.done ? '✓' : ''}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: s.done ? colors.text : '#A2957F' }}>{s.name}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: canCalc ? colors.deltaGreen : '#B98A2F', marginBottom: 12 }}>
              {missingLabel}
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn-solid"
          onClick={planner.calculate}
          disabled={!canCalc}
          style={{
            width: '100%', background: canCalc ? colors.accent : '#E2D8C6', color: canCalc ? '#fff' : '#A2957F',
            border: 'none', borderRadius: 999, padding: '14px 20px', fontWeight: 700, fontSize: 15,
            fontFamily: 'inherit', cursor: canCalc ? 'pointer' : 'not-allowed',
          }}
        >
          Calculate my score
        </button>
      </div>
    </div>
  );
}
