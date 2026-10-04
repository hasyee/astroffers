import type { Band, Bands as BandsData } from '../calculator/calculator.types';

/** Twilight, astronomical night and moonless night of a day on a strip from midnight to midnight */
export default function Bands({ night, astroNight, moonlessNight }: BandsData) {
  const renderBands = (name: string, bands: Band[]) =>
    bands.map(([start, end], i) => (
      <div key={`${name}-${i}`} className={name} style={{ left: `${start * 100}%`, right: `${(1 - end) * 100}%` }} />
    ));

  return (
    <div className="Bands">
      {renderBands('night', night)}
      {renderBands('astroNight', astroNight)}
      {renderBands('moonlessNight', moonlessNight)}
    </div>
  );
}
