import { useCallback } from 'react';
import classnames from 'classnames';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HideImageOutlinedIcon from '@mui/icons-material/HideImageOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import type { NgcInfo } from '../calculator/calculator.types';
import { getObjectImgSrc } from '../catalog/catalog.utils';
import { useOpenDetails } from '../details/details.hooks';
import { toListRow } from '../display/display.utils';
import {
  useIncrementalList,
  useListImages,
  useSearch,
  useSearchValueSetter,
  useSortBy,
  useSortBySetter
} from './list.hooks';
import { getSearchAnyAdornment } from './list.search';
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
          endAdornment={
            column.search !== 'ngc'
              ? getSearchAnyAdornment(column.search, search[column.search], setSearchValue)
              : undefined
          }
        />
      )}
    </th>
  );
}

/** The column of the images, its header toggles them */
function ImageHeaderCell({ hasImages, onToggle }: { hasImages: boolean; onToggle: () => void }) {
  const label = hasImages ? 'Hide images' : 'Show images';
  return (
    <th className="image">
      <IconButton size="small" onClick={onToggle} title={label} aria-label={label} aria-pressed={hasImages}>
        {hasImages ? <HideImageOutlinedIcon fontSize="small" /> : <ImageOutlinedIcon fontSize="small" />}
      </IconButton>
    </th>
  );
}

function Row({ ngcInfo, hasImages }: { ngcInfo: NgcInfo; hasImages: boolean }) {
  const openDetails = useOpenDetails();
  const row = toListRow(ngcInfo);
  const { id } = ngcInfo.object;
  const handleClick = useCallback(() => openDetails(id), [openDetails, id]);

  return (
    <tr onClick={handleClick}>
      <td className="image">
        {/* the size of the details, to share its cached image */}
        {hasImages && <img src={getObjectImgSrc(ngcInfo.object)} crossOrigin="anonymous" alt="" loading="lazy" />}
      </td>
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

/** Result list as a sortable, searchable table (desktop layout), compact or comfortable with the images */
export default function ListTable({ list }: { list: NgcInfo[] }) {
  const { visibleList, hasMore, sentinelRef } = useIncrementalList(list);
  const [hasImages, toggleImages] = useListImages();

  return (
    <div className={classnames('ListTable', { 'has-images': hasImages })}>
      <table>
        <thead>
          <tr>
            <ImageHeaderCell hasImages={hasImages} onToggle={toggleImages} />
            {columns.map(column => (
              <HeaderCell key={column.key} column={column} />
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleList.map(ngcInfo => (
            <Row key={ngcInfo.object.id} ngcInfo={ngcInfo} hasImages={hasImages} />
          ))}
        </tbody>
      </table>
      {hasMore && <div ref={sentinelRef} className="sentinel" />}
    </div>
  );
}
