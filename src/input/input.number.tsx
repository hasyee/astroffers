import { type ChangeEvent, type ReactNode, useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

type Props = {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const parse = (text: string, min: number, max: number) => {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) && value >= min && value <= max ? value : null;
};

/** Numeric input committing valid values only, while keeping whatever is being typed */
export default function NumberInput({ label, value, min, max, unit, disabled, onChange }: Props) {
  const [draft, setDraft] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);

  // Take over changes coming from outside (e.g. reset), but keep what is being typed
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (Number(draft) !== value) setDraft(String(value));
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setDraft(text);
    const nextValue = parse(text, min, max);
    if (nextValue !== null) onChange(nextValue);
  };

  return (
    <TextField
      label={label}
      type="number"
      value={draft}
      onChange={handleChange}
      error={parse(draft, min, max) === null}
      disabled={disabled}
      slotProps={{
        htmlInput: { inputMode: 'decimal', step: 'any', min, max },
        input: unit ? { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> } : undefined
      }}
    />
  );
}
