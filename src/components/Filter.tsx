import React = require('react');
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import DatePicker from 'material-ui/DatePicker';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import Menu from 'material-ui/Menu';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import SelectLocationDialog from './SelectLocationDialog';
import { State, Filter as IFilter } from '../types';
import { changeFilter, resetFilter, filterObjects, toggleTypeFilter, changeAllTypeFilter, track } from '../actions';
const typeMap = require('../../data/types.json');

type Range = { min: number; max: number };

const resolveValue = (value: number) => (Number.isFinite(value) ? value.toString() : '');
const checkRange = (value: number, range?: Range) =>
  !Number.isFinite(value) || !range || (value >= range.min && value <= range.max);
const getErrorMessage = (value: number): string => !Number.isFinite(value) && 'This field is required';

export default connect(({ filter }: State) => ({ filter }), {
  changeFilter,
  resetFilter,
  filterObjects,
  toggleTypeFilter,
  changeAllTypeFilter,
  track
})(
  class extends React.PureComponent<{
    filter: IFilter;
    changeFilter: typeof changeFilter;
    resetFilter: typeof resetFilter;
    filterObjects: typeof filterObjects;
    toggleTypeFilter: typeof toggleTypeFilter;
    changeAllTypeFilter: typeof changeAllTypeFilter;
    track: typeof track;
  }> {
    state = {
      isOpenLocationDialog: false,
      isOpenTypeFilterDialog: false
    };

    handleDateChange = (_, dateObject) => this.props.changeFilter('date', dateObject.getTime());
    handleSetToday = () => this.props.changeFilter('date', Date.now());
    handleChange = (prop: string, range?: Range) => evt => {
      const value = parseFloat(evt.target.value);
      if (!checkRange(value, range)) return;
      this.props.changeFilter(prop, Number.isFinite(value) ? value : null);
    };
    handleMoonlessChange = (_, checked) => {
      this.props.changeFilter('moonless', checked);
      this.props.track('Moonless', checked ? 'on' : 'off');
    };
    handleBrightnessFilterChange = (_, __, value) => this.props.changeFilter('brightnessFilter', value);
    handleLocationDialogOpen = () => {
      this.setState({ isOpenLocationDialog: true });
      this.props.track('Location Dialog', 'open');
    };
    handleLocationDialogCancel = () => {
      this.setState({ isOpenLocationDialog: false });
      this.props.track('Location Dialog', 'cancel');
    };
    handleLocationDialogSubmit = ({ latitude, longitude }) => {
      this.setState({ isOpenLocationDialog: false });
      this.props.changeFilter('latitude', latitude);
      this.props.changeFilter('longitude', longitude);
      this.props.track('Location Dialog', 'submit', { evLabel: 'coord', evValue: latitude + '_' + longitude });
    };
    handleTypeFilterDialogOpen = () => {
      this.setState({ isOpenTypeFilterDialog: true });
      this.props.track('Type Filter Dialog', 'open');
    };
    handleTypeFilterDialogClose = () => {
      this.setState({ isOpenTypeFilterDialog: false });
      this.props.track('Type Filter Dialog', 'close');
    };
    handleResetFilter = () => {
      this.props.resetFilter();
      this.props.track('Filter', 'reset');
    };
    handleSubmitFilter = () => {
      this.props.filterObjects();
      this.props.track('Filter', 'submit', {
        evLabel: this.props.filter.brightnessFilter,
        evValue:
          this.props.filter.brightnessFilter === 'magnitude'
            ? this.props.filter.magnitude
            : this.props.filter.surfaceBrightness
      });
    };

    componentDidMount() {
      this.props.filterObjects();
    }

    getFilterButtonDisabled() {
      const {
        filter: { latitude, longitude, twilight, altitude, brightnessFilter, magnitude, surfaceBrightness }
      } = this.props;
      return !(Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Number.isFinite(twilight) &&
      Number.isFinite(altitude) &&
      brightnessFilter === 'magnitude'
        ? Number.isFinite(magnitude)
        : Number.isFinite(surfaceBrightness));
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
        filter: {
          date,
          latitude,
          longitude,
          twilight,
          altitude,
          moonless,
          brightnessFilter,
          magnitude,
          surfaceBrightness
        },
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
              onChange={this.handleChange('latitude', { min: -90, max: 90 })}
              errorText={getErrorMessage(latitude)}
              type="number"
              min={-90}
              max={90}
            />
            <TextField
              floatingLabelText="Longitude ( ° )"
              floatingLabelFixed
              fullWidth
              value={resolveValue(longitude)}
              onChange={this.handleChange('longitude', { min: -180, max: 180 })}
              errorText={getErrorMessage(longitude)}
              type="number"
              min={-180}
              max={180}
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
              floatingLabelText="Maximum altitude of Sun ( ° )"
              floatingLabelFixed
              fullWidth
              value={resolveValue(twilight)}
              onChange={this.handleChange('twilight', { min: -90, max: 90 })}
              errorText={getErrorMessage(twilight)}
              type="number"
              min={-90}
              max={90}
            />
            <TextField
              floatingLabelText="Minimum altitude of objects ( ° )"
              floatingLabelFixed
              fullWidth
              value={resolveValue(altitude)}
              onChange={this.handleChange('altitude', { min: -90, max: 90 })}
              errorText={getErrorMessage(altitude)}
              type="number"
              min={-90}
              max={90}
            />
            <Toggle
              style={{ marginTop: '10px' }}
              label="Moonless night only"
              toggled={moonless}
              onToggle={this.handleMoonlessChange}
            />
            <DropDownMenu
              value={brightnessFilter}
              onChange={this.handleBrightnessFilterChange}
              style={{ width: '100%', marginTop: '10px' }}
              underlineStyle={{ margin: '0' }}
              labelStyle={{ paddingLeft: '0', userSelect: 'none' }}
              iconStyle={{ right: '-15px' }}
            >
              <MenuItem value="magnitude" primaryText="Filter by magnitude" />
              <MenuItem value="surfaceBrightness" primaryText="Filter by surface brightness" />
            </DropDownMenu>
            <TextField
              floatingLabelText={`Maximum ${brightnessFilter === 'magnitude'
                ? 'magnitude'
                : 'surface brightness'} ( ° )`}
              floatingLabelFixed
              fullWidth
              value={resolveValue(brightnessFilter === 'magnitude' ? magnitude : surfaceBrightness)}
              onChange={this.handleChange(brightnessFilter)}
              errorText={getErrorMessage(brightnessFilter === 'magnitude' ? magnitude : surfaceBrightness)}
              type="number"
            />
            <FlatButton
              label="Filter types"
              style={{ cssFloat: 'right', marginTop: '5px' }}
              onClick={this.handleTypeFilterDialogOpen}
            />
            {this.renderTypeFilterDialog()}
          </div>
          <div className="dynamic button-container">
            <FlatButton label="Reset" primary style={{ float: 'left' }} onClick={this.handleResetFilter} />
            <RaisedButton
              label="Filter"
              primary
              style={{ float: 'right' }}
              disabled={this.getFilterButtonDisabled()}
              onClick={this.handleSubmitFilter}
            />
          </div>
        </div>
      );
    }
  }
);
