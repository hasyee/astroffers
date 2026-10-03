import { type ChangeEvent, useState } from 'react';
import { FormGroup, InputGroup } from '@blueprintjs/core';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const parse = (text: string, min: number, max: number) => {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) && value >= min && value <= max ? value : null;
};

export default function CoordinateInput({ label, value, min, max, disabled, onChange }: Props) {
  const [draft, setDraft] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);

  // Take over changes coming from outside (place search, geolocation), but keep what is being typed
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
    <FormGroup label={label}>
      <InputGroup
        large
        fill
        type="number"
        inputMode="decimal"
        step="any"
        min={min}
        max={max}
        value={draft}
        onChange={handleChange}
        intent={parse(draft, min, max) === null ? 'danger' : 'none'}
        disabled={disabled}
      />
    </FormGroup>
  );
}
