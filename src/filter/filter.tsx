import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { BrightnessType, ObservationWindow } from '../calculator/calculator.types';
import { constellations, objectTypes } from '../catalog/catalog.utils';
import NumberInput from '../input/input.number';
import SelectorField from '../input/input.selector';
import Location from '../location/location';
import { useFilter, useFilterValueSetter, useResetFilter } from './filter.hooks';
import { countSelected } from './filter.utils';
import SetFilterDialog from './filter.set';
import './filter.scss';

const observationWindowOptions: { value: ObservationWindow; label: string }[] = [
  { value: 'moonlessNight', label: 'Moonless astronomical night' },
  { value: 'astroNight', label: 'Astronomical night' },
  { value: 'night', label: 'Night' }
];

const brightnessLimitTypeOptions: { value: BrightnessType; label: string }[] = [
  { value: 'magnitude', label: 'Magnitude' },
  { value: 'surfaceBrightness', label: 'Surface brightness' }
];

const typeCount = Object.keys(objectTypes).length;
const constellationCount = Object.keys(constellations).length;

export function ResetFilterButton() {
  const resetFilter = useResetFilter();
  return (
    <Button startIcon={<RestartAltIcon />} onClick={resetFilter}>
      Reset filter
    </Button>
  );
}

/** The fields of the filter, scrolled on their own */
export default function Filter() {
  const filter = useFilter();
  const setObservationTime = useFilterValueSetter('observationTime');
  const setTwilight = useFilterValueSetter('twilight');
  const setAltitude = useFilterValueSetter('altitude');
  const setObservationWindow = useFilterValueSetter('observationWindow');
  const setBrightnessLimitType = useFilterValueSetter('brightnessLimitType');
  const setMagnitude = useFilterValueSetter('magnitude');
  const setSurfaceBrightness = useFilterValueSetter('surfaceBrightness');
  const setTypes = useFilterValueSetter('types');
  const setConstellations = useFilterValueSetter('constellations');

  const [openedDialog, setOpenedDialog] = useState<'types' | 'constellations' | null>(null);
  const handleOpenTypes = useCallback(() => setOpenedDialog('types'), []);
  const handleOpenConstellations = useCallback(() => setOpenedDialog('constellations'), []);
  const handleCloseDialog = useCallback(() => setOpenedDialog(null), []);

  const isMagnitude = filter.brightnessLimitType === 'magnitude';

  return (
    <div className="Filter">
      <Location />

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

      <NumberInput
        label="Minimum observation time"
        unit="min"
        min={0}
        max={1440}
        value={filter.observationTime}
        onChange={setObservationTime}
      />
      <TextField
        select
        label="Observation window"
        value={filter.observationWindow}
        onChange={event => setObservationWindow(event.target.value as ObservationWindow)}
      >
        {observationWindowOptions.map(({ value, label }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>

      <div className="brightness">
        <TextField
          select
          label="Brightness limit type"
          value={filter.brightnessLimitType}
          onChange={event => setBrightnessLimitType(event.target.value as BrightnessType)}
        >
          {brightnessLimitTypeOptions.map(({ value, label }) => (
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
