import React = require('react');
const { connect } = require('react-redux');
import AppBar from 'material-ui/AppBar';
import DatePicker from 'material-ui/DatePicker';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import DropDownMenu from 'material-ui/DropDownMenu';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import { List, ListItem } from 'material-ui/List';
import Dialog from 'material-ui/Dialog';
import SelectLocationDialog from './SelectLocationDialog';
import { Filter as IFilter } from '../types';
import {
  changeFilter,
  resetFilter,
  filterObjects,
  toggleSetFilter,
  changeAllTypeFilter,
  changeAllConstellationFilter,
  track
} from '../actions';
import { getFilter } from '../selectors';
import { objectTypes, constellations, BirghtnessType } from 'astroffers-core';

type Range = { min: number; max: number };

const resolveValue = (value: number) => (Number.isFinite(value) ? value.toString() : '');
const checkRange = (value: number, range?: Range) =>
  !Number.isFinite(value) || !range || (value >= range.min && value <= range.max);
const getErrorMessage = (value: number): string => !Number.isFinite(value) && 'This field is required';

export default connect(state => ({ filter: getFilter(state) }), {
  changeFilter,
  resetFilter,
  filterObjects,
  toggleSetFilter,
  changeAllTypeFilter,
  changeAllConstellationFilter,
  track
})(
  class extends React.PureComponent<
    {
      filter: IFilter;
      changeFilter: typeof changeFilter;
      resetFilter: typeof resetFilter;
      filterObjects: typeof filterObjects;
      toggleSetFilter: typeof toggleSetFilter;
      changeAllTypeFilter: typeof changeAllTypeFilter;
      changeAllConstellationFilter: typeof changeAllConstellationFilter;
      track: typeof track;
    },
    {
      isOpenLocationDialog: boolean;
      isOpenTypeFilterDialog: boolean;
      isOpenConstellationFilterDialog: boolean;
    }
  > {
    state = {
      isOpenLocationDialog: false,
      isOpenTypeFilterDialog: false,
      isOpenConstellationFilterDialog: false
    };

    handleDateChange = (_, dateObject) => this.props.changeFilter('date', dateObject.getTime());
    handleSetToday = () => this.props.changeFilter('date', Date.now());
    handleChange = (prop: string, range?: Range) => evt => {
      const value = parseFloat(evt.target.value);
      if (!checkRange(value, range)) return;
      this.props.changeFilter(prop, Number.isFinite(value) ? value : null);
    };
    handleMoonlessChange = (_, checked) => this.props.changeFilter('moonless', checked);
    handleBrightnessFilterChange = (_, __, value) => this.props.changeFilter('brightnessFilter', value);
    handleLocationDialogOpen = () => {
      this.setState({ isOpenLocationDialog: true });
      this.props.track('View', 'open-location-dialog');
    };
    handleLocationDialogCancel = () => this.setState({ isOpenLocationDialog: false });
    handleLocationDialogSubmit = ({ latitude, longitude }) => {
      this.setState({ isOpenLocationDialog: false });
      this.props.changeFilter('latitude', latitude);
      this.props.changeFilter('longitude', longitude);
    };
    handleTypeFilterDialogOpen = () => {
      this.setState({ isOpenTypeFilterDialog: true });
      this.props.track('View', 'open-type-filter-dialog');
    };
    handleTypeFilterDialogClose = () => this.setState({ isOpenTypeFilterDialog: false });
    handleConstellationFilterDialogOpen = () => {
      this.setState({ isOpenConstellationFilterDialog: true });
      this.props.track('View', 'open-constellation-filter-dialog');
    };
    handleConstellationFilterDialogClose = () => this.setState({ isOpenConstellationFilterDialog: false });

    handleResetFilter = () => {
      this.props.resetFilter();
      this.props.track('Filter', 'reset-filter');
    };
    handleSubmitFilter = () => {
      this.props.filterObjects();
      this.props.track(
        'Filter',
        'submit-filter',
        this.props.filter.brightnessFilter,
        this.props.filter.brightnessFilter === BirghtnessType.magnitude
          ? this.props.filter.magnitude
          : this.props.filter.surfaceBrightness
      );
    };

    componentDidMount() {
      this.props.filterObjects();
    }

    getFilterButtonDisabled() {
      const {
        filter: { latitude, longitude, twilight, altitude, brightnessFilter, magnitude, surfaceBrightness }
      } = this.props;
      return !(
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        Number.isFinite(twilight) &&
        Number.isFinite(altitude) &&
        (brightnessFilter === BirghtnessType.magnitude
          ? Number.isFinite(magnitude)
          : Number.isFinite(surfaceBrightness))
      );
    }

    renderTypeFilterDialog() {
      const { filter: { types }, toggleSetFilter, changeAllTypeFilter } = this.props;
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
          <List>
            {Object.keys(objectTypes).map(key => (
              <ListItem
                key={key}
                style={{ userSelect: 'none' }}
                leftIcon={
                  <FontIcon className="mdi mdi-check" style={{ margin: '15px', opacity: types[key] ? 1 : 0 }} />
                }
                primaryText={objectTypes[key]}
                onClick={() => toggleSetFilter('types', key)}
              />
            ))}
          </List>
        </Dialog>
      );
    }

    renderConstellationFilterDialog() {
      const {
        filter: { constellations: consellationFilter },
        toggleSetFilter,
        changeAllConstellationFilter
      } = this.props;
      const { isOpenConstellationFilterDialog } = this.state;
      const actions = [
        <FlatButton label="Close" onClick={this.handleConstellationFilterDialogClose} primary />,
        <FlatButton label="Select all" onClick={() => changeAllConstellationFilter(true)} style={{ float: 'left' }} />,
        <FlatButton label="Select none" onClick={() => changeAllConstellationFilter(false)} style={{ float: 'left' }} />
      ];
      return (
        <Dialog
          actions={actions}
          modal={false}
          open={isOpenConstellationFilterDialog}
          onRequestClose={this.handleConstellationFilterDialogClose}
          autoScrollBodyContent
          contentStyle={{ width: '350px', maxWidth: 'none' }}
        >
          <List>
            {Object.keys(constellations).map(key => (
              <ListItem
                key={key}
                style={{ userSelect: 'none' }}
                leftIcon={
                  <FontIcon
                    className="mdi mdi-check"
                    style={{ margin: '15px', opacity: consellationFilter[key] ? 1 : 0 }}
                  />
                }
                primaryText={constellations[key]}
                onClick={() => toggleSetFilter('constellations', key)}
              />
            ))}
          </List>
        </Dialog>
      );
    }

    render() {
      const {
        filter: {
          date,
          latitude,
          longitude,
          observationTime,
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
            <FlatButton label="Set today" style={{ float: 'left' }} onClick={this.handleSetToday} />
            <FlatButton label="Select location" style={{ float: 'right' }} onClick={this.handleLocationDialogOpen} />
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td>
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
                  </td>
                  <td>
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
                  </td>
                </tr>
              </tbody>
            </table>

            <SelectLocationDialog
              isOpen={this.state.isOpenLocationDialog}
              latitude={latitude}
              longitude={longitude}
              onCancel={this.handleLocationDialogCancel}
              onSubmit={this.handleLocationDialogSubmit}
            />
            <TextField
              floatingLabelText="Minimum observation time ( min )"
              floatingLabelFixed
              fullWidth
              value={resolveValue(observationTime)}
              onChange={this.handleChange('observationTime', { min: 0, max: 1440 })}
              errorText={getErrorMessage(observationTime)}
              type="number"
              min={0}
              max={1440}
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
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td>
                    <TextField
                      floatingLabelText="Max"
                      floatingLabelFixed
                      fullWidth
                      value={resolveValue(
                        brightnessFilter === BirghtnessType.magnitude ? magnitude : surfaceBrightness
                      )}
                      onChange={this.handleChange(brightnessFilter)}
                      errorText={getErrorMessage(
                        brightnessFilter === BirghtnessType.magnitude ? magnitude : surfaceBrightness
                      )}
                      type="number"
                    />
                  </td>
                  <td>
                    <DropDownMenu
                      value={brightnessFilter}
                      onChange={this.handleBrightnessFilterChange}
                      style={{ width: '185px', marginTop: '21px' }}
                      underlineStyle={{ margin: '0' }}
                      labelStyle={{ paddingLeft: '0', userSelect: 'none', lineHeight: '68px' }}
                      iconStyle={{ right: '-15px', top: '9px' }}
                    >
                      <MenuItem value={BirghtnessType.magnitude} primaryText="Magnitude" />
                      <MenuItem value={BirghtnessType.surfaceBrightness} primaryText="Surface brightness" />
                    </DropDownMenu>
                  </td>
                </tr>
              </tbody>
            </table>
            <FlatButton
              label="Filter cons"
              style={{ cssFloat: 'left', marginTop: '5px' }}
              onClick={this.handleConstellationFilterDialogOpen}
            />
            <FlatButton
              label="Filter types"
              style={{ cssFloat: 'right', marginTop: '5px' }}
              onClick={this.handleTypeFilterDialogOpen}
            />
            {this.renderTypeFilterDialog()}
            {this.renderConstellationFilterDialog()}
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
