import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { BrightnessType } from '../calculator/calculator.types';
import { constellations, objectTypes } from '../catalog/catalog.utils';
import NumberInput from '../input/input.number';
import SelectorField from '../input/input.selector';
import Location from '../location/location';
import { useFilter, useFilterValueSetter, useResetFilter } from './filter.hooks';
import { countSelected } from './filter.utils';
import DateInput from './filter.date';
import SetFilterDialog from './filter.set';
import './filter.scss';

const brightnessOptions: { value: BrightnessType; label: string }[] = [
  { value: 'magnitude', label: 'Magnitude' },
  { value: 'surfaceBrightness', label: 'Surface brightness' }
];

const typeCount = Object.keys(objectTypes).length;
const constellationCount = Object.keys(constellations).length;

export default function Filter() {
  const filter = useFilter();
  const resetFilter = useResetFilter();
  const setObservationTime = useFilterValueSetter('observationTime');
  const setTwilight = useFilterValueSetter('twilight');
  const setAltitude = useFilterValueSetter('altitude');
  const setMoonless = useFilterValueSetter('moonless');
  const setBrightnessFilter = useFilterValueSetter('brightnessFilter');
  const setMagnitude = useFilterValueSetter('magnitude');
  const setSurfaceBrightness = useFilterValueSetter('surfaceBrightness');
  const setTypes = useFilterValueSetter('types');
  const setConstellations = useFilterValueSetter('constellations');

  const [openedDialog, setOpenedDialog] = useState<'types' | 'constellations' | null>(null);
  const handleOpenTypes = useCallback(() => setOpenedDialog('types'), []);
  const handleOpenConstellations = useCallback(() => setOpenedDialog('constellations'), []);
  const handleCloseDialog = useCallback(() => setOpenedDialog(null), []);

  const isMagnitude = filter.brightnessFilter === 'magnitude';

  return (
    <div className="Filter">
      <div className="inputs">
        <DateInput />

        <Location />

        <NumberInput
          label="Minimum observation time"
          unit="min"
          min={0}
          max={1440}
          value={filter.observationTime}
          onChange={setObservationTime}
        />
        <NumberInput
          label="Maximum altitude of the Sun"
          unit="°"
          min={-90}
          max={0}
          value={filter.twilight}
          onChange={setTwilight}
        />
        <NumberInput
          label="Minimum altitude of objects"
          unit="°"
          min={-90}
          max={90}
          value={filter.altitude}
          onChange={setAltitude}
        />

        <FormControlLabel
          label="Moonless night only"
          control={<Switch checked={filter.moonless} onChange={event => setMoonless(event.target.checked)} />}
        />

        <div className="brightness">
          <TextField
            select
            label="Maximum brightness"
            value={filter.brightnessFilter}
            onChange={event => setBrightnessFilter(event.target.value as BrightnessType)}
          >
            {brightnessOptions.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          {isMagnitude ? (
            <NumberInput label="Value" min={-30} max={30} value={filter.magnitude} onChange={setMagnitude} />
          ) : (
            <NumberInput
              label="Value"
              min={-30}
              max={30}
              value={filter.surfaceBrightness}
              onChange={setSurfaceBrightness}
            />
          )}
        </div>

        <SelectorField
          label="Object types"
          value={`${countSelected(filter.types)} of ${typeCount} selected`}
          icon={<FilterListIcon />}
          onClick={handleOpenTypes}
        />

        <SelectorField
          label="Constellations"
          value={`${countSelected(filter.constellations)} of ${constellationCount} selected`}
          icon={<FilterListIcon />}
          onClick={handleOpenConstellations}
        />
      </div>

      <div className="actions">
        <Button startIcon={<RestartAltIcon />} onClick={resetFilter}>
          Reset filter
        </Button>
      </div>

      <SetFilterDialog
        title="Object types"
        isOpen={openedDialog === 'types'}
        options={objectTypes}
        value={filter.types}
        onChange={setTypes}
        onClose={handleCloseDialog}
      />
      <SetFilterDialog
        title="Constellations"
        isOpen={openedDialog === 'constellations'}
        options={constellations}
        value={filter.constellations}
        onChange={setConstellations}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
