import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { KofiWidget } from './components/KofiWidget';
import { CalculatorView } from './components/calculator/CalculatorView';
import { ScenarioListView } from './components/scenarios/ScenarioList';
import { CompareView } from './components/compare/CompareView';
import { usePlanner, type PlannerProps } from './state/usePlanner';

export default function App(props: PlannerProps = {}) {
  const planner = usePlanner(props);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', fontFamily: "'Figtree', sans-serif", color: '#3A3227', display: 'flex', flexDirection: 'column' }}>
      <Header planner={planner} />
      {planner.view === 'calc' && <CalculatorView planner={planner} />}
      {planner.view === 'saved' && <ScenarioListView planner={planner} />}
      {planner.view === 'compare' && <CompareView planner={planner} />}
      <Footer planner={planner} />
      <Toast planner={planner} />
      <KofiWidget />
    </div>
  );
}
