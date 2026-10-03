import { useCalculation, useIsCalculating, useResultList } from '../result/result.hooks';

export default function App() {
  useCalculation();
  const isCalculating = useIsCalculating();
  const list = useResultList();

  return <div className="App">{isCalculating ? 'Calculating...' : `${list.length} objects`}</div>;
}
