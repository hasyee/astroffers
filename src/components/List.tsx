import React = require('react');
import { findDOMNode } from 'react-dom';
import moment = require('moment');
import { connect } from 'react-redux';
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
import { radToDeg } from '../calcs/units';
const typeMap = require('../../data/types.json');

export enum PROP {
  NGC = 'ngc',
  FROM = 'from',
  TO = 'to',
  MAGNITUDE = 'magnitude',
  SURFACE_BRIGHTNESS = 'surfaceBrightness',
  TYPE = 'type',
  MAX = 'max'
}

const propertySelectors = {
  [PROP.NGC]: (object: NgcInfo) => object.object.ngc,
  [PROP.FROM]: (object: NgcInfo) => object.intersection.start,
  [PROP.TO]: (object: NgcInfo) => object.intersection.end,
  [PROP.MAX]: (object: NgcInfo) => object.max,
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

const resolveType = (type: string): string => type.split('+').map(t => typeMap[t]).join(', ');

const DISPLAYED_ITEMS = 100;

class List extends React.PureComponent<{ objects: NgcInfo[] }> {
  private table;

  state = {
    displayedItems: DISPLAYED_ITEMS,
    sortBy: PROP.MAX
  };

  componentDidMount() {
    this.table = findDOMNode(this.refs.table).getElementsByTagName('div')[1];
    this.table.onscroll = () => {
      if (this.table.scrollTop >= 0.8 * this.table.scrollHeight) {
        this.setState({ displayedItems: this.state.displayedItems + DISPLAYED_ITEMS });
      }
    };
  }

  handleHeaderClick = (prop: PROP) => () => this.setState({ sortBy: prop });

  render() {
    return (
      <div className="fitted layout list card">
        <Table selectable={false} height={'calc(100% - 59px)'} ref="table">
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
                <span className="sorter" onClick={this.handleHeaderClick(PROP.MAX)}>
                  Max / Alt
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
          <TableBody displayRowCheckbox={false} preScanRows={false}>
            {this.props.objects
              .sort(sorter(this.state.sortBy))
              .slice(0, this.state.displayedItems)
              .map(
                ({
                  object: { ngc, magnitude, surfaceBrightness, type },
                  intersection: { start, end },
                  max,
                  altitudeAtMax
                }) => {
                  const resolvedType = resolveType(type);
                  return (
                    <TableRow key={ngc} selectable={false}>
                      <TableRowColumn>
                        <b>{ngc}</b>
                      </TableRowColumn>
                      <TableRowColumn title={resolvedType}>{resolvedType}</TableRowColumn>
                      <TableRowColumn>{moment(start).format('HH:mm')}</TableRowColumn>
                      <TableRowColumn>{moment(end).format('HH:mm')}</TableRowColumn>
                      <TableRowColumn>
                        {moment(max).format('HH:mm')} / {Math.round(radToDeg(altitudeAtMax))}°
                      </TableRowColumn>
                      <TableRowColumn>{magnitude}</TableRowColumn>
                      <TableRowColumn>{surfaceBrightness}</TableRowColumn>
                    </TableRow>
                  );
                }
              )}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default connect(({ result }) => ({ objects: result.list }))(List);
