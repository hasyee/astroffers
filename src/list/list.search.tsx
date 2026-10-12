import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import EmergencyIcon from '@mui/icons-material/Emergency';
import type { ListSearch } from './list.types';
import { SEARCH_ANY } from './list.utils';

const labels: Record<keyof ListSearch, string> = {
  ngc: 'Every object with an NGC number',
  messier: 'Every object with a Messier number',
  name: 'Every object with a name'
};

/**
 * Toggle at the end of a search field: the `*` term, every object having the field at all (an NGC number: the bodies
 * of the Solar System and a few Messier objects have none). A button, so the field can have the keyboard of its values
 * on a phone (numeric for NGC and Messier); `*` can be typed too.
 */
function SearchAnyAdornment({
  field,
  term,
  onChange
}: {
  field: keyof ListSearch;
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
        <EmergencyIcon fontSize="inherit" />
      </IconButton>
    </InputAdornment>
  );
}

/**
 * The asterisk toggle as the end adornment of a search field, only while the field is empty or has the `*`: beside a
 * typed term the clear button of the field is enough (the adornment is left out, not to keep its room either).
 */
export const getSearchAnyAdornment = (field: keyof ListSearch, term: string, onChange: (term: string) => void) =>
  !term || term.trim() === SEARCH_ANY ? (
    <SearchAnyAdornment field={field} term={term} onChange={onChange} />
  ) : undefined;
