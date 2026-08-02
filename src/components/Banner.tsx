import { colors } from './styles';
import type { Planner } from '../state/usePlanner';

export function Banner({ planner }: { planner: Planner }) {
  if (planner.view !== 'calc' || planner.calculatedOnce || planner.bannerDismissed) return null;
  return (
    <div style={{ background: colors.warnBg, border: `1px solid ${colors.warnBorder}`, borderRadius: 16, padding: '13px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20, fontSize: 13.5, color: '#6E6046', lineHeight: 1.5 }}>
      <div style={{ flex: 1 }}>
        <strong style={{ color: '#5C4E33' }}>Heads up:</strong> this tool is informational only, not immigration
        advice. Scores are our best effort and may differ from the official IRCC calculation — always confirm with
        the official tool before making decisions.
      </div>
      <button
        type="button"
        onClick={planner.dismissBanner}
        aria-label="Dismiss"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#A6935F', padding: 2, lineHeight: 1 }}
      >
        ✕
      </button>
    </div>
  );
}
