import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { SetFilter } from '../calculator/calculator.types';

type Props = {
  title: string;
  isOpen: boolean;
  /** Display names by key */
  options: Record<string, string>;
  value: SetFilter;
  onChange: (value: SetFilter) => void;
  onClose: () => void;
};

const selectAll = (options: Record<string, string>, selected: boolean): SetFilter =>
  Object.fromEntries(Object.keys(options).map(key => [key, selected]));

/** Dialog to select a subset of object types or constellations */
export default function SetFilterDialog({ title, isOpen, options, value, onChange, onClose }: Props) {
  return (
    <Dialog open={isOpen} onClose={onClose} scroll="paper" maxWidth="md" fullWidth className="SetFilterDialog">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <div className="options">
          {Object.entries(options).map(([key, label]) => (
            <FormControlLabel
              key={key}
              label={label}
              control={
                <Checkbox
                  size="small"
                  checked={!!value[key]}
                  onChange={() => onChange({ ...value, [key]: !value[key] })}
                />
              }
            />
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onChange(selectAll(options, true))}>Select all</Button>
        <Button onClick={() => onChange(selectAll(options, false))}>Select none</Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
