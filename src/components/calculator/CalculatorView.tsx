import type { Planner } from '../../state/usePlanner';
import { Banner } from '../Banner';
import { FormCards } from './FormCards';
import { ScoreCard } from './ScoreCard';

export function CalculatorView({ planner }: { planner: Planner }) {
  return (
    <main data-screen-label="Calculator" style={{ maxWidth: 1120, width: '100%', margin: '0 auto', padding: '8px 20px 40px', flex: 1 }}>
      <Banner planner={planner} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <FormCards planner={planner} />
        <ScoreCard planner={planner} />
      </div>
    </main>
  );
}
