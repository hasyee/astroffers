import { Button, Checkbox, Classes, Dialog } from '@blueprintjs/core';
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
    <Dialog title={title} isOpen={isOpen} onClose={onClose} className="SetFilterDialog">
      <div className={Classes.DIALOG_BODY}>
        <div className="options">
          {Object.entries(options).map(([key, label]) => (
            <Checkbox
              key={key}
              label={label}
              checked={!!value[key]}
              onChange={() => onChange({ ...value, [key]: !value[key] })}
            />
          ))}
        </div>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button variant="minimal" onClick={() => onChange(selectAll(options, true))}>
            Select all
          </Button>
          <Button variant="minimal" onClick={() => onChange(selectAll(options, false))}>
            Select none
          </Button>
          <Button variant="minimal" intent="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
