import type { Planner } from '../../state/usePlanner';
import { colors, headingFont, solidButton } from '../styles';
import { ScenarioCard } from './ScenarioCard';

export function ScenarioListView({ planner }: { planner: Planner }) {
  const compareReady = planner.compareSel.length >= 2;

  return (
    <main data-screen-label="My scenarios" style={{ maxWidth: 1120, width: '100%', margin: '0 auto', padding: '8px 20px 40px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        <h1 style={{ fontFamily: headingFont, fontSize: 26, fontWeight: 800, margin: 0, flex: 1 }}>My scenarios</h1>
        <button type="button" className="btn-solid" onClick={planner.newScenario} style={{ ...solidButton, padding: '10px 20px', fontSize: 13.5 }}>
          + New scenario
        </button>
        {planner.hasScenarios && (
          <button
            type="button"
            className="danger-hover"
            onClick={planner.openClearAll}
            style={{ background: 'none', border: '1.5px solid #E7DECE', color: colors.muted, borderRadius: 999, padding: '10px 18px', fontWeight: 600, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            Clear all
          </button>
        )}
      </div>

      {planner.clearOpen && (
        <div style={{ background: '#FDF1EE', border: '1px solid #EBC7BF', borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#A34335', marginBottom: 6 }}>Delete all saved scenarios?</div>
          <div style={{ fontSize: 13.5, color: '#8A6258', marginBottom: 12 }}>
            This can't be undone. Type <strong>delete</strong> to confirm.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={planner.clearText}
              onChange={(e) => planner.setClearText(e.target.value)}
              placeholder="Type delete"
              style={{ padding: '9px 12px', borderRadius: 12, border: '1.5px solid #EBC7BF', fontSize: 14, fontFamily: 'inherit' }}
            />
            {(() => {
              const ready = planner.clearText.trim().toLowerCase() === 'delete';
              return (
                <button
                  type="button"
                  onClick={planner.confirmClearAll}
                  disabled={!ready}
                  style={{
                    background: ready ? colors.deltaRed : '#E9D5D0', color: ready ? '#fff' : '#B08D85', border: 'none',
                    borderRadius: 999, padding: '9px 18px', fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit',
                    cursor: ready ? 'pointer' : 'not-allowed',
                  }}
                >
                  Delete everything
                </button>
              );
            })()}
            <button
              type="button"
              onClick={planner.cancelClearAll}
              style={{ background: 'none', border: 'none', color: colors.muted, fontWeight: 600, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!planner.hasScenarios && (
        <div style={{ background: '#fff', border: '1.5px dashed #E7DECE', borderRadius: 20, padding: '56px 30px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, background: colors.accentTint, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: headingFont, fontWeight: 800, color: colors.accentHover, fontSize: 20 }}>
            ?
          </div>
          <div style={{ fontFamily: headingFont, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Nothing saved yet</div>
          <div style={{ fontSize: 14, color: colors.muted, maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.6 }}>
            Calculate a score, save it with a name, and it will be waiting here next time — no retyping.
          </div>
          <button type="button" className="btn-solid" onClick={() => planner.setView('calc')} style={{ ...solidButton, padding: '12px 24px' }}>
            Go to the calculator
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
        {planner.scenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} planner={planner} />
        ))}
      </div>

      {compareReady && (
        <div style={{ position: 'sticky', bottom: 16, marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="dark-btn"
            onClick={() => planner.setView('compare')}
            style={{ background: colors.toastBg, color: '#fff', border: 'none', borderRadius: 999, padding: '14px 28px', fontWeight: 700, fontSize: 14.5, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 8px 24px rgba(40,30,15,0.25)' }}
          >
            Compare {planner.compareSel.length} scenarios →
          </button>
        </div>
      )}
    </main>
  );
}
