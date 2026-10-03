import { renderToStaticMarkup } from 'react-dom/server';
import svgToDataURL from 'svg-to-dataurl';
import './moon.scss';

const getSvg = (phase: number) => {
  const d = getD(phase);
  const svgStr = renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 200 150" width="100px" height="100px">
      <path className="moonback" fill="black" d="m100,0 a20,20 0 1,1 0,150 a20,20 0 1,1 0,-150" />
      <path className="moonlight" fill="white" d={d} />
    </svg>
  );
  return svgToDataURL(svgStr);
};

const getSweepAndMag = (phase: number): { sweep: [number, number]; mag: number } => {
  if (phase <= 0.25) return { sweep: [1, 0], mag: 20 - 20 * phase * 4 };
  if (phase <= 0.5) return { sweep: [0, 0], mag: 20 * (phase - 0.25) * 4 };
  if (phase <= 0.75) return { sweep: [1, 1], mag: 20 - 20 * (phase - 0.5) * 4 };
  return { sweep: [0, 1], mag: 20 * (phase - 0.75) * 4 };
};

const getD = (phase: number) => {
  const { sweep, mag } = getSweepAndMag(phase);
  return `m100,0 a${mag},20 0 1,${sweep[0]} 0,150 a20,20 0 1,${sweep[1]} 0,-150`;
};

const svgs: Record<string, string> = Object.fromEntries(
  Array.from({ length: 101 }, (_, i) => [(i / 100).toFixed(2), getSvg(i / 100)])
);

export default function Moon({ phase }: { phase: number }) {
  const svg = svgs[phase.toFixed(2)];

  return <div className="Moon" style={{ backgroundImage: `url(${svg})` }} />;
}
