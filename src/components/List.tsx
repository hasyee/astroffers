import React = require('react');
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
  NOON = 'noon',
  TO = 'to',
  MAGNITUDE = 'magnitude'
}

const propertySelectors = {
  [PROP.NGC]: (object: NgcInfo) => object.object.ngc,
  [PROP.FROM]: (object: NgcInfo) => object.intersection.start,
  [PROP.NOON]: (object: NgcInfo) => object.noon,
  [PROP.TO]: (object: NgcInfo) => object.intersection.end,
  [PROP.MAGNITUDE]: (object: NgcInfo) => object.object.magnitude
};

const sorter = (prop: PROP) => (a: NgcInfo, b: NgcInfo) => {
  const propertySelector = propertySelectors[prop];
  return propertySelector(a) - propertySelector(b);
};

export default class extends React.PureComponent<{ objects: NgcInfo[] }> {
  state = {
    sortBy: PROP.NOON
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
                <span className="sorter" onClick={this.handleHeaderClick(PROP.FROM)}>
                  From
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.NOON)}>
                  Noon
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
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.props.objects
              .sort(sorter(this.state.sortBy))
              .map(({ object: { ngc, magnitude }, intersection: { start, end }, noon }) => (
                <TableRow key={ngc} selectable={false}>
                  <TableRowColumn>{ngc}</TableRowColumn>
                  <TableRowColumn>{new Date(start).toLocaleString()}</TableRowColumn>
                  <TableRowColumn>{new Date(noon).toLocaleString()}</TableRowColumn>
                  <TableRowColumn>{new Date(end).toLocaleString()}</TableRowColumn>
                  <TableRowColumn>{magnitude}</TableRowColumn>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
