import type { Planner } from '../state/usePlanner';
import { colors, headingFont, tabStyle } from './styles';

export function Header({ planner }: { planner: Planner }) {
  return (
    <header style={{ maxWidth: 1120, width: '100%', margin: '0 auto', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => planner.setView('calc')}
      >
        <div style={{ width: 36, height: 36, borderRadius: 12, background: colors.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: headingFont, fontWeight: 800, fontSize: 12, letterSpacing: 0.5 }}>
          CRS
        </div>
        <div>
          <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 17, lineHeight: 1.1 }}>Scenario Planner</div>
          <div style={{ fontSize: 11.5, color: colors.muted }}>Express Entry · saves to your browser</div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: 4, background: colors.neutralTint, borderRadius: 999, padding: 4, marginLeft: 'auto', flexWrap: 'wrap' }}>
        <button type="button" className="tab-btn" onClick={() => planner.setView('calc')} style={tabStyle(planner.view === 'calc')}>
          Calculator
        </button>
        <button type="button" className="tab-btn" onClick={() => planner.setView('saved')} style={tabStyle(planner.view === 'saved')}>
          My scenarios
          {planner.hasScenarios && (
            <span style={{ background: colors.accent, color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 7px', marginLeft: 7 }}>
              {planner.scenarioCount}
            </span>
          )}
        </button>
        <button type="button" className="tab-btn" onClick={() => planner.setView('compare')} style={tabStyle(planner.view === 'compare')}>
          Compare
        </button>
      </nav>

      <a
        href={planner.donateUrl}
        target="_blank"
        rel="noopener"
        onClick={planner.onDonate}
        className="donate-link"
        style={{ border: `1.5px solid ${colors.accent}`, color: '#A8552E', borderRadius: 999, padding: '8px 18px', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}
      >
        Donate
      </a>
    </header>
  );
}
