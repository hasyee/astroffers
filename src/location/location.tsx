import { Fragment, useState, useCallback, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DialogTitleWithClose from '../dialog/dialog.title';
import SelectorField from '../input/input.selector';
import { useLocation, useLocationSetter, useMyLocation, useLocationShortName } from './location.hooks';
import CoordinateInput from './location.coordinate';
import PlaceSearch from './location.search';
import './location.scss';

export default function Location() {
  const locationShortName = useLocationShortName();
  const { coords } = useLocation();
  const setLocation = useLocationSetter();

  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const { fetchLocation, isFetchingLocation, locationFetchingError, clearLocationFetchingError } =
    useMyLocation(handleClose);

  // the error of the positioning belongs to the attempt: the dialog opens without it again
  useEffect(() => {
    if (!isOpen) clearLocationFetchingError();
  }, [isOpen, clearLocationFetchingError]);

  const handleLngChange = useCallback(
    (lng: number) => setLocation({ coords: { ...coords, lng }, name: '' }),
    [coords, setLocation]
  );
  const handleLatChange = useCallback(
    (lat: number) => setLocation({ coords: { ...coords, lat }, name: '' }),
    [coords, setLocation]
  );
  const handleDialogClose = useCallback(() => {
    if (!isFetchingLocation) handleClose();
  }, [isFetchingLocation, handleClose]);

  return (
    <Fragment>
      <SelectorField label="Location" value={locationShortName} icon={<MyLocationIcon />} onClick={handleOpen} />

      <Dialog open={isOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitleWithClose onClose={handleDialogClose}>Location</DialogTitleWithClose>
        <DialogContent className="Location">
          <PlaceSearch onSelectLocation={handleClose} />
          <div className="lat-lon">
            <CoordinateInput
              label="Longitude"
              value={coords.lng}
              min={-180}
              max={180}
              disabled={isFetchingLocation}
              onChange={handleLngChange}
            />
            <CoordinateInput
              label="Latitude"
              value={coords.lat}
              min={-90}
              max={90}
              disabled={isFetchingLocation}
              onChange={handleLatChange}
            />
          </div>

          {locationFetchingError && (
            <Alert severity="error" variant="outlined">
              {locationFetchingError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button size="large" onClick={fetchLocation} startIcon={<MyLocationIcon />} loading={isFetchingLocation}>
            Use my location
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
