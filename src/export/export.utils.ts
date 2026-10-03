import type { NgcInfo } from '../calculator/calculator.types';
import { toListRow } from '../display/display.utils';

const columns: { label: string; value: (row: ReturnType<typeof toListRow>) => string | number | undefined }[] = [
  { label: 'NGC', value: row => row.ngc },
  { label: 'Messier', value: row => row.messier },
  { label: 'Name', value: row => row.name },
  { label: 'Type', value: row => row.typeNames },
  { label: 'Constellation', value: row => row.constellationName },
  { label: 'From', value: row => row.from },
  { label: 'Max', value: row => row.max },
  { label: 'Altitude at max', value: row => row.altitudeAtMax },
  { label: 'To', value: row => row.to },
  { label: 'Sum', value: row => row.sum },
  { label: 'Magnitude', value: row => row.magnitude },
  { label: 'Surface brightness', value: row => row.surfaceBrightness }
];

const escape = (value: string | number | undefined) => {
  const text = value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (list: NgcInfo[]) =>
  [
    columns.map(({ label }) => escape(label)).join(','),
    ...list.map(toListRow).map(row => columns.map(({ value }) => escape(value(row))).join(','))
  ].join('\n');

export const downloadCsv = (list: NgcInfo[], fileName: string) => {
  const url = URL.createObjectURL(new Blob([toCsv(list)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
