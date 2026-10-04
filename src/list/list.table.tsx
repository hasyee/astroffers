import { useCallback } from 'react';
import classnames from 'classnames';
import InputBase from '@mui/material/InputBase';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { NgcInfo } from '../calculator/calculator.types';
import { useOpenedNgcSetter } from '../details/details.hooks';
import { toListRow } from '../display/display.utils';
import { useIncrementalList, useSearch, useSearchValueSetter, useSortBy, useSortBySetter } from './list.hooks';
import type { ListSearch, SortBy } from './list.types';

type Column = { key: SortBy; label: string; title: string; search?: keyof ListSearch; className?: string };

const columns: Column[] = [
  { key: 'ngc', label: 'NGC', title: 'NGC number', search: 'ngc' },
  { key: 'messier', label: 'M', title: 'Messier number', search: 'messier' },
  { key: 'name', label: 'Name', title: 'Name', search: 'name', className: 'name' },
  { key: 'type', label: 'Type', title: 'Object type' },
  { key: 'constellation', label: 'Cons.', title: 'Constellation' },
  { key: 'from', label: 'From', title: 'Visible from' },
  { key: 'max', label: 'Max / Alt', title: 'Best visibility and its altitude' },
  { key: 'to', label: 'To', title: 'Visible to' },
  { key: 'sum', label: 'Sum', title: 'Length of the visibility' },
  { key: 'magnitude', label: 'Mag.', title: 'Magnitude' },
  { key: 'surfaceBrightness', label: 'Sur. br.', title: 'Surface brightness' }
];

function HeaderCell({ column }: { column: Column }) {
  const sortBy = useSortBy();
  const setSortBy = useSortBySetter();
  const search = useSearch();
  const setSearchValue = useSearchValueSetter(column.search ?? 'name');

  return (
    <th className={classnames(column.key, column.className)} title={column.title}>
      <button className={classnames('sorter', { active: sortBy === column.key })} onClick={() => setSortBy(column.key)}>
        {column.label}
        {sortBy === column.key && <ArrowDownwardIcon className="sort-icon" />}
      </button>
      {column.search && (
        <InputBase
          className="search"
          type="search"
          placeholder={column.search === 'name' ? 'Search' : '#'}
          value={search[column.search]}
          onChange={event => setSearchValue(event.target.value)}
        />
      )}
    </th>
  );
}

function Row({ ngcInfo }: { ngcInfo: NgcInfo }) {
  const setOpenedNgc = useOpenedNgcSetter();
  const row = toListRow(ngcInfo);
  const handleClick = useCallback(() => setOpenedNgc(row.ngc), [setOpenedNgc, row.ngc]);

  return (
    <tr onClick={handleClick}>
      <td className="ngc">
        <b>{row.ngc}</b>
      </td>
      <td className="messier">{row.messier}</td>
      <td className="name" title={row.name}>
        {row.name}
      </td>
      <td className="type" title={row.typeNames}>
        {row.types}
      </td>
      <td className="constellation" title={row.constellationName}>
        {row.constellation}
      </td>
      <td className="from">{row.from}</td>
      <td className="max">
        {row.max} / {row.altitudeAtMax}
      </td>
      <td className="to">{row.to}</td>
      <td className="sum">{row.sum}</td>
      <td className="magnitude">{row.magnitude}</td>
      <td className="surfaceBrightness">{row.surfaceBrightness}</td>
    </tr>
  );
}

/** Result list as a sortable, searchable table (desktop layout) */
export default function ListTable({ list }: { list: NgcInfo[] }) {
  const { visibleList, hasMore, sentinelRef } = useIncrementalList(list);

  return (
    <div className="ListTable">
      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <HeaderCell key={column.key} column={column} />
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleList.map(ngcInfo => (
            <Row key={ngcInfo.object.ngc} ngcInfo={ngcInfo} />
          ))}
        </tbody>
      </table>
      {hasMore && <div ref={sentinelRef} className="sentinel" />}
    </div>
  );
}
