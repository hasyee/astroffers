import React = require('react');
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import DatePicker from 'material-ui/DatePicker';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import SelectLocationDialog from './SelectLocationDialog';
import { State, Filter as IFilter } from '../types';
import { changeFilter, resetFilter, filterObjects } from '../actions';

const resolveValue = (value: number) => (Number.isFinite(value) ? value : '');

class Filter extends React.PureComponent<{
  filter: IFilter;
  changeFilter: typeof changeFilter;
  resetFilter: typeof resetFilter;
  filterObjects: typeof filterObjects;
}> {
  state = {
    isOpenDialog: false
  };

  handleDateChange = (_, dateObject) => this.props.changeFilter('date', dateObject.getTime());
  handleSetToday = () => this.props.changeFilter('date', Date.now());
  handleChange = (prop: string) => evt => {
    const value = parseFloat(evt.target.value);
    this.props.changeFilter(prop, Number.isFinite(value) ? value : null);
  };
  handleMoonlessChange = evt => this.props.changeFilter('moonless', evt.target.checked);
  handleDialogOpen = () => this.setState({ isOpenDialog: true });
  handleDialogCancel = () => this.setState({ isOpenDialog: false });
  handleDialogSubmit = ({ latitude, longitude }) => {
    this.setState({ isOpenDialog: false });
    this.props.changeFilter('latitude', latitude);
    this.props.changeFilter('longitude', longitude);
  };

  componentDidMount() {
    this.props.filterObjects();
  }

  render() {
    const {
      filter: { date, magnitude, latitude, longitude, twilight, altitude, moonless },
      resetFilter,
      filterObjects
    } = this.props;
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
            floatingLabelText="Latitude ( ° )"
            floatingLabelFixed
            fullWidth
            value={resolveValue(latitude)}
            onChange={this.handleChange('latitude')}
            type="number"
          />
          <TextField
            floatingLabelText="Longitude ( ° )"
            floatingLabelFixed
            fullWidth
            value={resolveValue(longitude)}
            onChange={this.handleChange('longitude')}
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
            floatingLabelText="Magnitude limit ( ° )"
            floatingLabelFixed
            fullWidth
            value={resolveValue(magnitude)}
            onChange={this.handleChange('magnitude')}
            type="number"
          />
          <TextField
            floatingLabelText="Astronomical twilight ( ° )"
            floatingLabelFixed
            fullWidth
            value={resolveValue(twilight)}
            onChange={this.handleChange('twilight')}
            type="number"
          />
          <TextField
            floatingLabelText="Altitude limit ( ° )"
            floatingLabelFixed
            fullWidth
            value={resolveValue(altitude)}
            onChange={this.handleChange('altitude')}
            type="number"
          />
          <Checkbox
            style={{ marginTop: '10px' }}
            label="Moonless night only"
            checked={moonless}
            onCheck={this.handleMoonlessChange}
          />
          <IconMenu
            iconButtonElement={<FlatButton label="Filter by type" />}
            style={{ cssFloat: 'right', marginTop: '10px' }}
          >
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
            <MenuItem insetChildren={true}>yee</MenuItem>
          </IconMenu>
        </div>
        <div className="dynamic button-container">
          <FlatButton label="Reset" primary style={{ float: 'left' }} onClick={resetFilter} />
          <RaisedButton label="Filter" primary style={{ float: 'right' }} onClick={filterObjects} />
        </div>
      </div>
    );
  }
}

export default connect(({ filter }: State) => ({ filter }), { changeFilter, resetFilter, filterObjects })(Filter);
