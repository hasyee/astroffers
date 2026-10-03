import classnames from 'classnames';
import type { NightInfo } from '../calculator/calculator.types';
import { formatIntervalEnd, formatIntervalStart } from '../display/display.utils';

type Row = { key: 'night' | 'astroNight' | 'moonNight' | 'moonlessNight'; name: string; start: string; end: string };

const rows: Row[] = [
  { key: 'night', name: 'Twilight', start: 'Sunset', end: 'Sunrise' },
  { key: 'astroNight', name: 'Astro night', start: 'From', end: 'To' },
  { key: 'moonNight', name: 'Moon', start: 'Moonset', end: 'Moonrise' },
  { key: 'moonlessNight', name: 'Moonless night', start: 'From', end: 'To' }
];

/** Table of the twilight, the astronomical night and the Moon */
export default function NightTable({ nightInfo }: { nightInfo: NightInfo }) {
  return (
    <table className="NightTable">
      <tbody>
        {rows.map(({ key, name, start, end }) => (
          <tr key={key}>
            <td>
              <span className={classnames('dot', key)} /> {name}
            </td>
            <td className="label">{start}</td>
            <td className="time">{formatIntervalStart(nightInfo[key])}</td>
            <td className="label">{end}</td>
            <td className="time">{formatIntervalEnd(nightInfo[key])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
