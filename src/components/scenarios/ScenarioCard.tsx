import type { Scenario } from '../../model/form';
import type { Planner } from '../../state/usePlanner';
import { fmtDate } from '../../lib/format';
import { colors, headingFont } from '../styles';

export function ScenarioCard({ scenario, planner }: { scenario: Scenario; planner: Planner }) {
  const checked = planner.compareSel.includes(scenario.id);
  const confirming = planner.confirmDelete === scenario.id;
  const editing = planner.editName === scenario.id;

  return (
    <div style={{ background: '#fff', border: `1px solid ${colors.cardBorder}`, borderRadius: 20, padding: 22, boxShadow: '0 1px 2px rgba(60,45,25,0.04)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button
          type="button"
          onClick={() => planner.toggleSel(scenario.id)}
          aria-label="Select for comparison"
          style={{
            width: 24, height: 24, borderRadius: 8, flexShrink: 0, cursor: 'pointer', fontSize: 13, fontWeight: 800,
            border: checked ? 'none' : '1.5px solid #DFD5C2', background: checked ? colors.accent : '#fff', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {checked ? '✓' : ''}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                autoFocus
                value={planner.editNameVal}
                onChange={(e) => planner.setEditNameVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') planner.commitName(scenario.id);
                }}
                style={{ flex: 1, minWidth: 0, padding: '7px 10px', borderRadius: 10, border: `1.5px solid ${colors.accent}`, fontSize: 14, fontFamily: 'inherit', fontWeight: 600 }}
              />
              <button
                type="button"
                onClick={() => planner.commitName(scenario.id)}
                style={{ background: colors.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '0 12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
              >
                ✓
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 16.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scenario.name}
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => planner.startRename(scenario.id, scenario.name)}
                aria-label="Rename"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.faint, fontSize: 13, padding: 2 }}
              >
                ✎
              </button>
            </div>
          )}
          <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Updated {fmtDate(scenario.updatedAt)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 26, lineHeight: 1, color: colors.text }}>{scenario.result.total}</div>
          <div style={{ fontSize: 10.5, color: colors.muted }}>/ 1,200</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, fontSize: 11.5, color: colors.muted, flexWrap: 'wrap' }}>
        <span style={{ background: '#F5EFE5', borderRadius: 999, padding: '3px 9px' }}>Core {scenario.result.core}</span>
        <span style={{ background: '#F5EFE5', borderRadius: 999, padding: '3px 9px' }}>Transfer {scenario.result.transfer}</span>
        <span style={{ background: '#F5EFE5', borderRadius: 999, padding: '3px 9px' }}>Extra {scenario.result.additional}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <button
          type="button"
          className="btn-outline"
          onClick={() => planner.load(scenario)}
          style={{ flex: 1, background: '#fff', border: `1.5px solid ${colors.accent}`, color: colors.accentHover, borderRadius: 999, padding: '8px 14px', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
        >
          Open &amp; edit
        </button>
        <button
          type="button"
          onClick={() => planner.del(scenario.id)}
          style={{
            background: confirming ? colors.deltaRed : 'none', color: confirming ? '#fff' : colors.faint,
            border: confirming ? 'none' : `1.5px solid ${colors.cardBorder}`, borderRadius: 999, padding: '8px 14px',
            fontWeight: 700, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          {confirming ? 'Really?' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
