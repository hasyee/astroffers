import { useEffect, useRef } from 'react';
import Highcharts from './chart.theme';

/** Renders a Highcharts chart, recreating it whenever the (memoized) options change */
export default function Chart({ options, className }: { options: Highcharts.Options; className?: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const chart = Highcharts.chart(container.current, options);
    return () => chart.destroy();
  }, [options]);

  return <div ref={container} className={className} />;
}
