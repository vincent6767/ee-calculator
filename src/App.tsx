import { Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { KofiWidget } from './components/KofiWidget';
import { CalculatorView } from './components/calculator/CalculatorView';
import { usePlanner, type PlannerProps } from './state/usePlanner';

const ScenarioListView = lazy(() => import('./components/scenarios/ScenarioList').then((m) => ({ default: m.ScenarioListView })));
const CompareView = lazy(() => import('./components/compare/CompareView').then((m) => ({ default: m.CompareView })));

export default function App(props: PlannerProps = {}) {
  const planner = usePlanner(props);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', fontFamily: "'Figtree', sans-serif", color: '#3A3227', display: 'flex', flexDirection: 'column' }}>
      <Header planner={planner} />
      {planner.view === 'calc' && <CalculatorView planner={planner} />}
      <Suspense fallback={null}>
        {planner.view === 'saved' && <ScenarioListView planner={planner} />}
        {planner.view === 'compare' && <CompareView planner={planner} />}
      </Suspense>
      <Footer planner={planner} />
      <Toast planner={planner} />
      <KofiWidget />
    </div>
  );
}
