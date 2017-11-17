import React = require('react');
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import DatePicker from 'material-ui/DatePicker';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import SelectLocationDialog from './SelectLocationDialog';
import { State, Filter as IFilter } from '../types';
import { changeFilter, resetFilter, filterObjects, toggleTypeFilter, changeAllTypeFilter } from '../actions';
const typeMap = require('../../data/types.json');

const resolveValue = (value: number) => (Number.isFinite(value) ? value : '');

class Filter extends React.PureComponent<{
  filter: IFilter;
  changeFilter: typeof changeFilter;
  resetFilter: typeof resetFilter;
  filterObjects: typeof filterObjects;
  toggleTypeFilter: typeof toggleTypeFilter;
  changeAllTypeFilter: typeof changeAllTypeFilter;
}> {
  state = {
    isOpenLocationDialog: false,
    isOpenTypeFilterDialog: false
  };

  handleDateChange = (_, dateObject) => this.props.changeFilter('date', dateObject.getTime());
  handleSetToday = () => this.props.changeFilter('date', Date.now());
  handleChange = (prop: string) => evt => {
    const value = parseFloat(evt.target.value);
    this.props.changeFilter(prop, Number.isFinite(value) ? value : null);
  };
  handleMoonlessChange = (_, checked) => this.props.changeFilter('moonless', checked);
  handleLocationDialogOpen = () => this.setState({ isOpenLocationDialog: true });
  handleLocationDialogCancel = () => this.setState({ isOpenLocationDialog: false });
  handleLocationDialogSubmit = ({ latitude, longitude }) => {
    this.setState({ isOpenLocationDialog: false });
    this.props.changeFilter('latitude', latitude);
    this.props.changeFilter('longitude', longitude);
  };
  handleTypeFilterDialogOpen = () => this.setState({ isOpenTypeFilterDialog: true });
  handleTypeFilterDialogClose = () => this.setState({ isOpenTypeFilterDialog: false });

  componentDidMount() {
    this.props.filterObjects();
  }

  renderTypeFilterDialog() {
    const { filter: { types }, toggleTypeFilter, changeAllTypeFilter } = this.props;
    const { isOpenTypeFilterDialog } = this.state;
    const actions = [
      <FlatButton label="Close" onClick={this.handleTypeFilterDialogClose} primary />,
      <FlatButton label="Select all" onClick={() => changeAllTypeFilter(true)} style={{ float: 'left' }} />,
      <FlatButton label="Select none" onClick={() => changeAllTypeFilter(false)} style={{ float: 'left' }} />
    ];
    return (
      <Dialog
        actions={actions}
        modal={false}
        open={isOpenTypeFilterDialog}
        onRequestClose={this.handleTypeFilterDialogClose}
        autoScrollBodyContent
        contentStyle={{ width: '350px', maxWidth: 'none' }}
      >
        <Menu autoWidth={false} desktop width={350}>
          {Object.keys(typeMap).map(key => (
            <MenuItem
              key={key}
              insetChildren={true}
              primaryText={typeMap[key]}
              checked={types[key]}
              onClick={() => toggleTypeFilter(key)}
            />
          ))}
        </Menu>
      </Dialog>
    );
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
          <FlatButton label="Select location" style={{ cssFloat: 'right' }} onClick={this.handleLocationDialogOpen} />
          <SelectLocationDialog
            isOpen={this.state.isOpenLocationDialog}
            latitude={latitude}
            longitude={longitude}
            onCancel={this.handleLocationDialogCancel}
            onSubmit={this.handleLocationDialogSubmit}
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
          <Toggle
            style={{ marginTop: '10px' }}
            label="Moonless night only"
            toggled={moonless}
            onToggle={this.handleMoonlessChange}
          />
          <FlatButton
            label="Filter types"
            style={{ cssFloat: 'right', marginTop: '5px' }}
            onClick={this.handleTypeFilterDialogOpen}
          />
          {this.renderTypeFilterDialog()}
        </div>
        <div className="dynamic button-container">
          <FlatButton label="Reset" primary style={{ float: 'left' }} onClick={resetFilter} />
          <RaisedButton label="Filter" primary style={{ float: 'right' }} onClick={filterObjects} />
        </div>
      </div>
    );
  }
}

export default connect(({ filter }: State) => ({ filter }), {
  changeFilter,
  resetFilter,
  filterObjects,
  toggleTypeFilter,
  changeAllTypeFilter
})(Filter);
