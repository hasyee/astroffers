import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import EmergencyIcon from '@mui/icons-material/Emergency';
import EmergencyOutlinedIcon from '@mui/icons-material/EmergencyOutlined';
import type { ListSearch } from './list.types';
import { SEARCH_ANY } from './list.utils';

const labels: Partial<Record<keyof ListSearch, string>> = {
  messier: 'Every object with a Messier number',
  name: 'Every object with a name'
};

/**
 * Toggle at the end of the Messier and the name search: the `*` term, every object having the field at all. A
 * button, so the field can have the keyboard of its values on a phone (numeric for Messier); `*` can be typed too.
 */
function SearchAnyAdornment({
  field,
  term,
  onChange
}: {
  field: 'messier' | 'name';
  term: string;
  onChange: (term: string) => void;
}) {
  const isAny = term.trim() === SEARCH_ANY;
  const label = labels[field];

  return (
    <InputAdornment position="end" className="SearchAnyAdornment">
      <IconButton
        size="small"
        edge="end"
        color={isAny ? 'primary' : 'default'}
        onClick={() => onChange(isAny ? '' : SEARCH_ANY)}
        aria-label={label}
        aria-pressed={isAny}
        title={label}
      >
        {isAny ? <EmergencyIcon fontSize="inherit" /> : <EmergencyOutlinedIcon fontSize="inherit" />}
      </IconButton>
    </InputAdornment>
  );
}

/**
 * The asterisk toggle as the end adornment of a search field, only while the field is empty or has the `*`: beside a
 * typed term the clear button of the field is enough (the adornment is left out, not to keep its room either).
 */
export const getSearchAnyAdornment = (field: 'messier' | 'name', term: string, onChange: (term: string) => void) =>
  !term || term.trim() === SEARCH_ANY ? (
    <SearchAnyAdornment field={field} term={term} onChange={onChange} />
  ) : undefined;
