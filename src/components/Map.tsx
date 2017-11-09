import React = require('react');
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

export default withGoogleMap(
  class extends React.PureComponent<{ latitude: number; longitude: number; onChange: Function }> {
    render() {
      const { latitude, longitude, onChange } = this.props;
      return (
        <GoogleMap defaultZoom={8} defaultCenter={{ lat: latitude, lng: longitude }}>
          <Marker
            position={{ lat: latitude, lng: longitude }}
            draggable
            onDragEnd={({ latLng }) => onChange({ latitude: latLng.lat(), longitude: latLng.lng() })}
          />
        </GoogleMap>
      );
    }
  }
);
