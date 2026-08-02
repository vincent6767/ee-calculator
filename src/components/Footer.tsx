import { SCORING_LAST_VERIFIED } from '../model/form';
import type { Planner } from '../state/usePlanner';
import { colors } from './styles';

export function Footer({ planner }: { planner: Planner }) {
  const verified = new Date(SCORING_LAST_VERIFIED).toLocaleDateString('en-CA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <footer style={{ borderTop: `1px solid ${colors.cardBorder}`, background: '#F5EFE5', padding: '36px 20px', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        <div style={{ flex: '2 1 420px', fontSize: 12.5, color: colors.muted, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, color: '#6E6250', marginBottom: 6 }}>Disclaimer</div>
          This calculator is provided for informational purposes only and is not immigration advice. We make our
          best effort to keep it accurate and current, but we don't guarantee it matches the official Government of
          Canada calculation, and we accept no liability for any loss or damage arising from its use. Always confirm
          your score using the official IRCC tools before making decisions.
        </div>
        <div style={{ flex: '1 1 240px', fontSize: 12.5, color: colors.muted, lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, color: '#6E6250', marginBottom: 6 }}>About this tool</div>
          <div>
            Scoring rules last verified <strong>{verified}</strong>
          </div>
          <div>Your data never leaves this browser.</div>
          <div style={{ marginTop: 10 }}>
            <a href={planner.donateUrl} target="_blank" rel="noopener" onClick={planner.onDonate} style={{ fontWeight: 700 }}>
              ♥ Support this tool with a donation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
