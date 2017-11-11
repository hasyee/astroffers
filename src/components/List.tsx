import React = require('react');
import moment = require('moment');
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import { NgcInfo } from '../calcs/types';

export enum PROP {
  NGC = 'ngc',
  FROM = 'from',
  TO = 'to',
  MAGNITUDE = 'magnitude',
  SURFACE_BRIGHTNESS = 'surfaceBrightness',
  TYPE = 'type'
}

const propertySelectors = {
  [PROP.NGC]: (object: NgcInfo) => object.object.ngc,
  [PROP.FROM]: (object: NgcInfo) => object.intersection.start,
  [PROP.TO]: (object: NgcInfo) => object.intersection.end,
  [PROP.MAGNITUDE]: (object: NgcInfo) => object.object.magnitude,
  [PROP.SURFACE_BRIGHTNESS]: (object: NgcInfo) => object.object.surfaceBrightness,
  [PROP.TYPE]: (object: NgcInfo) => object.object.type
};

const sorter = (prop: PROP) => (a: NgcInfo, b: NgcInfo) => {
  const propertySelector = propertySelectors[prop];
  const aProp = propertySelector(a);
  const bProp = propertySelector(b);
  if (aProp < bProp) return -1;
  else if (aProp > bProp) return 1;
  else return 0;
};

export default class extends React.PureComponent<{ objects: NgcInfo[] }> {
  state = {
    sortBy: PROP.FROM
  };

  handleHeaderClick = (prop: PROP) => () => this.setState({ sortBy: prop });

  render() {
    return (
      <div className="fitted layout list card">
        <Table selectable={false} height={'calc(100% - 59px)'}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.NGC)}>
                  NGC
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.TYPE)}>
                  Type
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.FROM)}>
                  From
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.TO)}>
                  To
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.MAGNITUDE)}>
                  Magnitude
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.SURFACE_BRIGHTNESS)}>
                  Surface brightness
                </span>
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.props.objects
              .sort(sorter(this.state.sortBy))
              .map(({ object: { ngc, magnitude, surfaceBrightness, type }, intersection: { start, end }, transit }) => (
                <TableRow key={ngc} selectable={false}>
                  <TableRowColumn>{ngc}</TableRowColumn>
                  <TableRowColumn>{type}</TableRowColumn>
                  <TableRowColumn>{moment(start).format('HH:mm')}</TableRowColumn>
                  <TableRowColumn>{moment(end).format('HH:mm')}</TableRowColumn>
                  <TableRowColumn>{magnitude}</TableRowColumn>
                  <TableRowColumn>{surfaceBrightness}</TableRowColumn>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
