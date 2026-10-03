import { useCallback, useMemo } from 'react';
import { FormGroup, MenuItem } from '@blueprintjs/core';
import { Suggest, type ItemRenderer } from '@blueprintjs/select';
import type { NominatimPlace } from './location.types';
import { useLocationSetter, useSearch } from './location.hooks';
import './location.search.scss';

export default function PlaceSearch({ onSelectLocation }: { onSelectLocation: () => void }) {
  const setLocation = useLocationSetter();
  const { query, handleQueryChange, items, isSearching, hasSearched } = useSearch();

  const handleItemSelect = useCallback(
    ({ display_name, lon, lat }: NominatimPlace) => {
      setLocation({ coords: { lng: Number(lon), lat: Number(lat) }, name: display_name });
      onSelectLocation();
    },
    [setLocation, onSelectLocation]
  );

  const itemRenderer = useCallback<ItemRenderer<NominatimPlace>>(
    (item, { handleClick, modifiers }) => (
      <MenuItem
        key={item.place_id}
        text={item.display_name}
        active={modifiers.active}
        disabled={modifiers.disabled}
        onClick={handleClick}
        multiline
      />
    ),
    []
  );

  const inputValueRenderer = useCallback((item: NominatimPlace) => item.display_name, []);

  const noResults = useMemo(
    () => (!!query && !isSearching && hasSearched ? <MenuItem disabled text="No results." /> : null),
    [query, isSearching, hasSearched]
  );

  return (
    <FormGroup label="Search">
      <Suggest<NominatimPlace>
        fill
        popoverProps={{ minimal: true, popoverClassName: 'suggest-dropdown-popover' }}
        inputProps={{ large: true }}
        query={query}
        onQueryChange={handleQueryChange}
        items={items}
        itemRenderer={itemRenderer}
        inputValueRenderer={inputValueRenderer}
        onItemSelect={handleItemSelect}
        noResults={noResults}
      />
    </FormGroup>
  );
}
