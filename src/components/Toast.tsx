import { colors } from './styles';
import type { Planner } from '../state/usePlanner';

export function Toast({ planner }: { planner: Planner }) {
  if (!planner.toast) return null;
  return (
    <div
      role="status"
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: colors.toastBg, color: colors.toastText, borderRadius: 999, padding: '11px 22px',
        fontSize: 13.5, fontWeight: 600, boxShadow: '0 8px 24px rgba(40,30,15,0.3)', zIndex: 50,
        animation: 'fadeUp .25s ease', pointerEvents: 'none',
      }}
    >
      {planner.toast}
    </div>
  );
}
