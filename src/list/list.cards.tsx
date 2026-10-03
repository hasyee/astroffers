import { useCallback, useState } from 'react';
import { Button, Collapse, ControlGroup, HTMLSelect, InputGroup } from '@blueprintjs/core';
import type { NgcInfo } from '../calculator/calculator.types';
import { getObjectImgSrc, getTitle } from '../catalog/catalog.utils';
import { useOpenedNgcSetter } from '../details/details.hooks';
import { toListRow } from '../display/display.utils';
import {
  useIncrementalList,
  useSearch,
  useSearchSetter,
  useSearchValueSetter,
  useSortBy,
  useSortBySetter
} from './list.hooks';
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
      <ControlGroup fill>
        <HTMLSelect
          fill
          value={sortBy}
          onChange={event => setSortBy(event.currentTarget.value as SortBy)}
          options={sortOptions.map(({ value, label }) => ({ value, label: `Sort by ${label.toLowerCase()}` }))}
        />
        <Button icon={isSearchOpen ? 'cross' : 'search'} onClick={handleToggleSearch} aria-label="Search" />
      </ControlGroup>
      <Collapse isOpen={isSearchOpen}>
        <div className="search">
          <InputGroup
            type="search"
            inputMode="numeric"
            placeholder="NGC"
            value={search.ngc}
            onChange={event => setNgc(event.target.value)}
          />
          <InputGroup
            type="search"
            inputMode="numeric"
            placeholder="Messier"
            value={search.messier}
            onChange={event => setMessier(event.target.value)}
          />
          <InputGroup
            type="search"
            placeholder="Name"
            value={search.name}
            onChange={event => setName(event.target.value)}
          />
        </div>
      </Collapse>
    </div>
  );
}

function Item({ ngcInfo }: { ngcInfo: NgcInfo }) {
  const setOpenedNgc = useOpenedNgcSetter();
  const row = toListRow(ngcInfo);
  const handleClick = useCallback(() => setOpenedNgc(row.ngc), [setOpenedNgc, row.ngc]);

  return (
    <div className="Item" onClick={handleClick}>
      <div className="heading">
        <img className="thumbnail" src={getObjectImgSrc(ngcInfo.object, 80)} alt="" loading="lazy" />
        <div>
          <div className="title">{getTitle(ngcInfo.object)}</div>
          <div className="subtitle">
            {row.typeNames} in {row.constellationName}
          </div>
        </div>
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
