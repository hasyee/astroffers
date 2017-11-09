import React = require('react');
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import DatePicker from 'material-ui/DatePicker';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SelectLocationDialog from './SelectLocationDialog';
import { State, Filter as IFilter } from '../types';
import { changeFilter } from '../actions';

class Filter extends React.PureComponent<{ filter: IFilter; changeFilter: typeof changeFilter }> {
  state = {
    isOpenDialog: false
  };

  handleDateChange = (_, dateObject) => this.props.changeFilter('date', dateObject.getTime());
  handleSetToday = () => this.props.changeFilter('date', Date.now());
  handleMagnitudeChange = evt => this.props.changeFilter('magnitude', Number(evt.target.value));
  handleLatitudeChange = evt => this.props.changeFilter('latitude', Number(evt.target.value));
  handleLongitudeChange = evt => this.props.changeFilter('longitude', Number(evt.target.value));
  handleDialogOpen = () => this.setState({ isOpenDialog: true });
  handleDialogCancel = () => this.setState({ isOpenDialog: false });
  handleDialogSubmit = ({ latitude, longitude }) => {
    this.setState({ isOpenDialog: false });
    this.props.changeFilter('latitude', latitude);
    this.props.changeFilter('longitude', longitude);
  };

  render() {
    const { filter: { date, magnitude, latitude, longitude } } = this.props;
    return (
      <div className="fitted column layout filter">
        <div className="fitted overflow-y inputs">
          <DatePicker
            floatingLabelText="Date"
            floatingLabelFixed
            fullWidth
            autoOk
            value={new Date(date)}
            onChange={this.handleDateChange}
          />
          <FlatButton label="Set today" style={{ cssFloat: 'right' }} onClick={this.handleSetToday} />
          <TextField
            floatingLabelText="Latitude"
            floatingLabelFixed
            fullWidth
            value={latitude}
            onChange={this.handleLatitudeChange}
            type="number"
          />
          <TextField
            floatingLabelText="Longitude"
            floatingLabelFixed
            fullWidth
            value={longitude}
            onChange={this.handleLongitudeChange}
            type="number"
          />
          <FlatButton label="Select location" style={{ cssFloat: 'right' }} onClick={this.handleDialogOpen} />
          <SelectLocationDialog
            isOpen={this.state.isOpenDialog}
            latitude={latitude}
            longitude={longitude}
            onCancel={this.handleDialogCancel}
            onSubmit={this.handleDialogSubmit}
          />
          <TextField
            floatingLabelText="Magnitude limit"
            floatingLabelFixed
            fullWidth
            value={magnitude}
            onChange={this.handleMagnitudeChange}
            type="number"
          />
        </div>
        <div className="dynamic button-container">
          <RaisedButton label="Filter" primary style={{ cssFloat: 'right' }} />
        </div>
      </div>
    );
  }
}

export default connect(({ filter }: State) => ({ filter }), { changeFilter })(Filter);
