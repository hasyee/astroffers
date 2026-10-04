import type { KeyboardEvent, ReactNode } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import './input.scss';

type Props = {
  label: string;
  value: string;
  icon: ReactNode;
  size?: 'small' | 'medium';
  onClick: () => void;
};

/** Read-only field opening a dialog to choose its value, e.g. the location or the object types */
export default function SelectorField({ label, value, icon, size, onClick }: Props) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onClick();
  };

  return (
    <TextField
      className="SelectorField"
      label={label}
      value={value}
      size={size}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      slotProps={{
        htmlInput: { readOnly: true },
        input: { endAdornment: <InputAdornment position="end">{icon}</InputAdornment> }
      }}
    />
  );
}
