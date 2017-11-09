import React = require('react');
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Map from './Map';

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
    this.state = {
      latitude: this.props.latitude,
      longitude: this.props.longitude
    };
  }

  handleChange = state => this.setState(state);

  handleSubmit = () => {
    this.props.onSubmit(this.state);
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
    const { onCancel, onSubmit, isOpen } = this.props;
    const { latitude, longitude } = this.state;
    const actions = [
      <FlatButton label="Cancel" onClick={onCancel} />,
      <FlatButton label="Submit" primary={true} onClick={this.handleSubmit} />
    ];
    return (
      <Dialog title="Select your location" actions={actions} modal open={isOpen} onRequestClose={onCancel}>
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
