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
import resolveTypes from '../calcs/resolveTypes';

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

const DISPLAYED_ITEMS = 100;

class List extends React.PureComponent<{ objects: NgcInfo[]; isFiltering: boolean }> {
  private table;

  state = {
    displayedItems: DISPLAYED_ITEMS,
    sortBy: PROP.MAX
  };

  initScroll() {
    if (!this.refs.table) return;
    this.table = findDOMNode(this.refs.table).getElementsByTagName('div')[1];
    this.table.onscroll = () => {
      if (
        this.table.scrollTop >= 0.8 * this.table.scrollHeight &&
        this.state.displayedItems < this.props.objects.length
      ) {
        this.setState({ displayedItems: this.state.displayedItems + DISPLAYED_ITEMS });
      }
    };
  }

  componentDidMount() {
    this.initScroll();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.objects !== this.props.objects) this.initScroll();
  }

  handleHeaderClick = (prop: PROP) => () => {
    if (prop !== this.state.sortBy) {
      this.setState({ sortBy: prop, displayedItems: DISPLAYED_ITEMS });
      this.table.scrollTop = 0;
    }
  };

  renderSortByIcon(prop: string) {
    return prop === this.state.sortBy && <i className="mdi mdi-arrow-down" />;
  }

  render() {
    const { sortBy, displayedItems } = this.state;
    const { isFiltering, objects } = this.props;
    if (isFiltering || !objects) return null;
    return (
      <div className="fitted layout list card">
        <Table selectable={false} height={'calc(100% - 59px)'} ref="table">
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.NGC)}>
                  NGC{this.renderSortByIcon(PROP.NGC)}
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.TYPE)}>
                  Type{this.renderSortByIcon(PROP.TYPE)}
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.FROM)}>
                  From{this.renderSortByIcon(PROP.FROM)}
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.TO)}>
                  To{this.renderSortByIcon(PROP.TO)}
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.MAX)}>
                  Max / Alt{this.renderSortByIcon(PROP.MAX)}
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.MAGNITUDE)}>
                  Magnitude{this.renderSortByIcon(PROP.MAGNITUDE)}
                </span>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <span className="sorter" onClick={this.handleHeaderClick(PROP.SURFACE_BRIGHTNESS)}>
                  Surface brightness{this.renderSortByIcon(PROP.SURFACE_BRIGHTNESS)}
                </span>
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false} preScanRows={false}>
            {objects
              .sort(sorter(sortBy))
              .slice(0, displayedItems)
              .map(
                ({
                  object: { ngc, magnitude, surfaceBrightness, type },
                  intersection: { start, end },
                  max,
                  altitudeAtMax
                }) => {
                  const resolvedType = resolveTypes(type).join(', ');
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

export default connect(({ result, isFiltering }) => ({ objects: result ? result.list : null, isFiltering }))(List);
