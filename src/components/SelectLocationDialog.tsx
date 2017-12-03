import React = require('react');
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Map from './Map';
import { fetchLocation } from '../api';
import analytics from '../analytics';

export default class extends React.PureComponent<
  {
    isOpen: boolean;
    latitude: number;
    longitude: number;
    onSubmit: Function;
    onCancel: Function;
  },
  { latitude: number; longitude: number }
> {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      latitude: this.props.latitude,
      longitude: this.props.longitude
    };
  }

  handleFetchLocation = async () => {
    const { latitude, longitude } = await fetchLocation();
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) this.setState({ latitude, longitude });
    analytics.event('Network Location', 'fetch', { evLabel: 'coord', evValue: latitude + '_' + longitude });
  };

  handleChange = state => this.setState(state);

  handleSubmit = () => {
    this.props.onSubmit(this.state);
  };

  handleCancel = () => {
    this.setState(this.getInitialState());
    this.props.onCancel();
  };

  componentWillUpdate(nextProps) {
    if (nextProps.latitude !== this.props.latitude || nextProps.longitude !== this.props.longitude) {
      this.setState({
        latitude: nextProps.latitude,
        longitude: nextProps.longitude
      });
    }
  }

  render() {
    const { onSubmit, isOpen } = this.props;
    const { latitude, longitude } = this.state;
    const actions = [
      <FlatButton label="Use network location" onClick={this.handleFetchLocation} style={{ float: 'left' }} />,
      <FlatButton label="Cancel" onClick={this.handleCancel} />,
      <FlatButton label="Submit" primary={true} onClick={this.handleSubmit} />
    ];
    return (
      <Dialog title="Select your location" actions={actions} modal open={isOpen} onRequestClose={this.handleCancel}>
        <Map
          containerElement={<div style={{ height: `400px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
          latitude={latitude}
          longitude={longitude}
          onChange={this.handleChange}
        />
      </Dialog>
    );
  }
}
