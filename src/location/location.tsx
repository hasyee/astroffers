import { Fragment, useState, useCallback } from 'react';
import classnames from 'classnames';
import { Button, Dialog, Callout, Classes } from '@blueprintjs/core';
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

  const { fetchLocation, isFetchingLocation, locationFetchingError } = useMyLocation(handleClose);

  const handleLngChange = useCallback(
    (lng: number) => setLocation(location => ({ coords: { ...location.coords, lng }, name: '' })),
    [setLocation]
  );
  const handleLatChange = useCallback(
    (lat: number) => setLocation(location => ({ coords: { ...location.coords, lat }, name: '' })),
    [setLocation]
  );

  return (
    <Fragment>
      <Button icon="locate" onClick={handleOpen} large className="location-button-with-text">
        {locationShortName ? locationShortName.toUpperCase() : 'LOCATION'}
      </Button>
      <Button icon="locate" onClick={handleOpen} large className="location-button-without-text"></Button>

      <Dialog
        icon="locate"
        title="Location"
        isOpen={isOpen}
        onClose={handleClose}
        canOutsideClickClose={!isFetchingLocation}
      >
        <div className={classnames(Classes.DIALOG_BODY, 'Location')}>
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
            <Callout icon={undefined} intent="danger">
              {locationFetchingError}
            </Callout>
          )}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button large onClick={fetchLocation} icon={'locate'} loading={isFetchingLocation}>
              USE MY LOCATION
            </Button>
          </div>
        </div>
      </Dialog>
    </Fragment>
  );
}
