import { Fragment } from 'react';
import classnames from 'classnames';
import type { Interval, MoonCross, NightInfo, Timestamp } from '../calculator/calculator.types';
import { formatTime } from '../display/display.utils';

type Cell = { label: string; time: Timestamp | null };

/** `key` is the class of its dot */
type Row = { key: 'night' | 'astroNight' | 'moonNight' | 'moonlessNight'; name: string; cells: [Cell, Cell] };

const toIntervalCells = (interval: Interval | null, start: string, end: string): [Cell, Cell] => [
  { label: start, time: interval?.start ?? null },
  { label: end, time: interval?.end ?? null }
];

const moonCrossLabels = { rise: 'Moonrise', set: 'Moonset' };

const toMoonCrossCell = ({ type, time }: MoonCross): Cell => ({ label: moonCrossLabels[type], time });

/**
 * The first two moonrises and moonsets of the day in their order (a moonrise first at a full Moon). A single one is
 * beside the missing one on the side the missing one is on: a moonset before the noon, a moonrise after the next noon.
 */
const toMoonCells = ([first, second]: MoonCross[]): [Cell, Cell] => {
  if (!first)
    return [
      { label: 'Moonrise', time: null },
      { label: 'Moonset', time: null }
    ];
  if (second) return [toMoonCrossCell(first), toMoonCrossCell(second)];
  return first.type === 'rise'
    ? [{ label: 'Moonset', time: null }, toMoonCrossCell(first)]
    : [toMoonCrossCell(first), { label: 'Moonrise', time: null }];
};

const getRows = ({ night, astroNight, moonlessNight, moonCrosses }: NightInfo): Row[] => [
  { key: 'night', name: 'Twilight', cells: toIntervalCells(night, 'Sunset', 'Sunrise') },
  { key: 'astroNight', name: 'Astro night', cells: toIntervalCells(astroNight, 'From', 'To') },
  { key: 'moonNight', name: 'Moon', cells: toMoonCells(moonCrosses) },
  { key: 'moonlessNight', name: 'Moonless night', cells: toIntervalCells(moonlessNight, 'From', 'To') }
];

/** Table of the twilight, the astronomical night and the Moon */
export default function NightTable({ nightInfo }: { nightInfo: NightInfo }) {
  return (
    <table className="NightTable">
      <tbody>
        {getRows(nightInfo).map(({ key, name, cells }) => (
          <tr key={key}>
            <td>
              <span className={classnames('dot', key)} /> {name}
            </td>
            {cells.map(({ label, time }, index) => (
              <Fragment key={index}>
                <td className="label">{label}</td>
                <td className="time">{formatTime(time)}</td>
              </Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
