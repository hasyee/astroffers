import { useCallback } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import type { NominatimPlace } from './location.types';
import { useLocationSetter, useSearch } from './location.hooks';

const getOptionLabel = (place: NominatimPlace) => place.display_name;

export default function PlaceSearch({ onSelectLocation }: { onSelectLocation: () => void }) {
  const setLocation = useLocationSetter();
  const { query, handleQueryChange, items, isSearching, hasSearched } = useSearch();

  const handleChange = useCallback(
    (_: unknown, place: NominatimPlace | null) => {
      if (!place) return;
      setLocation({ coords: { lng: Number(place.lon), lat: Number(place.lat) }, name: place.display_name });
      onSelectLocation();
    },
    [setLocation, onSelectLocation]
  );

  // the input is reset by the autocomplete itself too (e.g. on selecting), only typing searches
  const handleInputChange = useCallback(
    (_: unknown, value: string, reason: string) => {
      if (reason === 'input' || reason === 'clear') handleQueryChange(value);
    },
    [handleQueryChange]
  );

  return (
    <Autocomplete<NominatimPlace>
      className="PlaceSearch"
      value={null}
      onChange={handleChange}
      inputValue={query}
      onInputChange={handleInputChange}
      options={items}
      // the results are filtered by Nominatim already
      filterOptions={options => options}
      getOptionLabel={getOptionLabel}
      renderOption={({ key: _key, ...props }, place) => (
        <li key={place.place_id} {...props}>
          {place.display_name}
        </li>
      )}
      loading={isSearching}
      noOptionsText={query && hasSearched ? 'No results.' : 'Type the name of a place'}
      clearOnBlur={false}
      forcePopupIcon={false}
      renderInput={params => <TextField {...params} size="medium" label="Search" />}
    />
  );
}
