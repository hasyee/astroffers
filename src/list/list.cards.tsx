import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useCallback, useState } from 'react';
import type { NgcInfo } from '../calculator/calculator.types';
import { getObjectImgSrc, getTitle } from '../catalog/catalog.utils';
import { useOpenDetails } from '../details/details.hooks';
import { toListRow } from '../display/display.utils';
import {
  useIncrementalList,
  useSearch,
  useSearchSetter,
  useSearchValueSetter,
  useSortBy,
  useSortBySetter
} from './list.hooks';
import { getSearchAnyAdornment } from './list.search';
import type { SortBy } from './list.types';
import { emptySearch, isSearchEmpty, sortOptions } from './list.utils';

function Toolbar() {
  const sortBy = useSortBy();
  const setSortBy = useSortBySetter();
  const search = useSearch();
  const setSearch = useSearchSetter();
  const setNgc = useSearchValueSetter('ngc');
  const setMessier = useSearchValueSetter('messier');
  const setName = useSearchValueSetter('name');
  const [isSearchOpen, setIsSearchOpen] = useState(!isSearchEmpty(search));

  const handleToggleSearch = useCallback(() => {
    // closing the search clears it, not to leave the list filtered invisibly
    if (isSearchOpen) setSearch(emptySearch);
    setIsSearchOpen(!isSearchOpen);
  }, [isSearchOpen, setSearch]);

  return (
    <div className="Toolbar">
      <div className="sort">
        <TextField
          select
          value={sortBy}
          onChange={event => setSortBy(event.target.value as SortBy)}
          slotProps={{ htmlInput: { 'aria-label': 'Sort by' } }}
          style={{ marginRight: '0.5rem' }}
        >
          {sortOptions.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              Sort by {label.toLowerCase()}
            </MenuItem>
          ))}
        </TextField>
        <IconButton onClick={handleToggleSearch} aria-label="Search">
          {isSearchOpen ? <CloseIcon /> : <SearchIcon />}
        </IconButton>
      </div>
      <Collapse in={isSearchOpen}>
        <div className="search">
          <TextField
            type="search"
            placeholder="NGC"
            value={search.ngc}
            onChange={event => setNgc(event.target.value)}
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          />
          <TextField
            type="search"
            // short, as in the header of the table: its asterisk button takes room too
            placeholder="M"
            value={search.messier}
            onChange={event => setMessier(event.target.value)}
            slotProps={{
              htmlInput: { inputMode: 'numeric' },
              input: {
                endAdornment: getSearchAnyAdornment('messier', search.messier, setMessier)
              }
            }}
          />
          <TextField
            type="search"
            placeholder="Name"
            value={search.name}
            onChange={event => setName(event.target.value)}
            slotProps={{
              input: { endAdornment: getSearchAnyAdornment('name', search.name, setName) }
            }}
          />
        </div>
      </Collapse>
    </div>
  );
}

function Item({ ngcInfo }: { ngcInfo: NgcInfo }) {
  const openDetails = useOpenDetails();
  const row = toListRow(ngcInfo);
  const handleClick = useCallback(() => openDetails(row.ngc), [openDetails, row.ngc]);

  return (
    <div className="Item" onClick={handleClick}>
      {/* as high as the card; the size of the details, to share its cached image */}
      <img className="thumbnail" src={getObjectImgSrc(ngcInfo.object)} crossOrigin="anonymous" alt="" loading="lazy" />
      <div className="info">
        <div className="title">{getTitle(ngcInfo.object)}</div>
        <div className="subtitle">
          {row.typeNames} in {row.constellationName}
        </div>
        <div className="properties">
          <div>
            <label>From</label>
            {row.from}
          </div>
          <div>
            <label>Max / Alt</label>
            {row.max} / {row.altitudeAtMax}
          </div>
          <div>
            <label>To</label>
            {row.to}
          </div>
          <div>
            <label>Sum</label>
            {row.sum}
          </div>
          <div>
            <label>Magnitude</label>
            {row.magnitude}
          </div>
          <div>
            <label>Surface br.</label>
            {row.surfaceBrightness}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Result list as cards with a sort selector and a collapsible search (mobile layout) */
export default function ListCards({ list }: { list: NgcInfo[] }) {
  const { visibleList, hasMore, sentinelRef } = useIncrementalList(list);

  return (
    <div className="ListCards">
      <Toolbar />
      {visibleList.map(ngcInfo => (
        <Item key={ngcInfo.object.ngc} ngcInfo={ngcInfo} />
      ))}
      {hasMore && <div ref={sentinelRef} className="sentinel" />}
    </div>
  );
}
