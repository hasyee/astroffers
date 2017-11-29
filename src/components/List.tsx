import React = require('react');
import { findDOMNode } from 'react-dom';
import moment = require('moment');
const { connect } = require('react-redux');
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
import { stringifyTimeDiff } from '../calcs/utils';
import { openDetails } from '../actions';

export enum PROP {
  NGC = 'ngc',
  FROM = 'from',
  TO = 'to',
  MAGNITUDE = 'magnitude',
  SURFACE_BRIGHTNESS = 'surfaceBrightness',
  TYPE = 'type',
  MAX = 'max',
  SUM = 'sum'
}

const defaultSorter = (propertySelector: Function) => (a: NgcInfo, b: NgcInfo) => {
  const aProp = propertySelector(a);
  const bProp = propertySelector(b);
  if (aProp < bProp) return -1;
  else if (aProp > bProp) return 1;
  else return 0;
};

const sorters = {
  [PROP.NGC]: defaultSorter((object: NgcInfo) => object.object.ngc),
  [PROP.FROM]: defaultSorter((object: NgcInfo) => object.intersection.start),
  [PROP.TO]: defaultSorter((object: NgcInfo) => object.intersection.end),
  [PROP.MAX]: (a: NgcInfo, b: NgcInfo) => {
    const maxDiff = a.max - b.max;
    return maxDiff === 0 ? a.sum - b.sum : maxDiff;
  },
  [PROP.SUM]: defaultSorter((object: NgcInfo) => object.sum),
  [PROP.MAGNITUDE]: defaultSorter((object: NgcInfo) => object.object.magnitude),
  [PROP.SURFACE_BRIGHTNESS]: defaultSorter((object: NgcInfo) => object.object.surfaceBrightness),
  [PROP.TYPE]: defaultSorter((object: NgcInfo) => object.object.type)
};

const DEFAULT_DISPLAYED_ITEMS = 100;

class List extends React.PureComponent<{ objects: NgcInfo[]; isFiltering: boolean; openDetails: typeof openDetails }> {
  private table;

  state = {
    displayedItems: DEFAULT_DISPLAYED_ITEMS,
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
        this.setState({ displayedItems: this.state.displayedItems + DEFAULT_DISPLAYED_ITEMS });
      }
    };
  }

  componentDidMount() {
    this.initScroll();
  }

  componentWillUpdate(nextProps) {
    if (this.props.objects !== nextProps.objects) this.setState({ displayedItems: DEFAULT_DISPLAYED_ITEMS });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.objects !== this.props.objects) {
      this.initScroll();
    }
  }

  handleHeaderClick = (prop: PROP) => () => {
    if (prop !== this.state.sortBy) {
      this.setState({ sortBy: prop, displayedItems: DEFAULT_DISPLAYED_ITEMS });
      this.table.scrollTop = 0;
    }
  };

  handleRowClick = (ngc: number) => () => this.props.openDetails(ngc);

  renderSortByIcon(prop: string) {
    return prop === this.state.sortBy && <i className="mdi mdi-arrow-down" />;
  }

  render() {
    const { sortBy, displayedItems } = this.state;
    const { isFiltering, objects } = this.props;
    if (isFiltering || !objects) return null;
    return (
      <div className="fitted layout list card">
        <Table selectable={false} height={'calc(100% - 59px)'} ref="table" style={{ overflow: 'hidden' }}>
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
                <span className="sorter" onClick={this.handleHeaderClick(PROP.SUM)}>
                  Sum{this.renderSortByIcon(PROP.SUM)}
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
              .sort(sorters[sortBy])
              .slice(0, displayedItems)
              .map(
                ({
                  object: { ngc, magnitude, surfaceBrightness, type },
                  intersection: { start, end },
                  max,
                  sum,
                  altitudeAtMax
                }) => {
                  const resolvedType = resolveTypes(type).join(', ');
                  return (
                    <TableRow key={ngc} selectable={false} className="list row" onClick={this.handleRowClick(ngc)}>
                      <TableRowColumn>
                        <b>{ngc}</b>
                      </TableRowColumn>
                      <TableRowColumn title={resolvedType}>{resolvedType}</TableRowColumn>
                      <TableRowColumn>{moment(start).format('HH:mm')}</TableRowColumn>
                      <TableRowColumn>{moment(end).format('HH:mm')}</TableRowColumn>
                      <TableRowColumn>
                        {moment(max).format('HH:mm')} / {Math.round(radToDeg(altitudeAtMax))}°
                      </TableRowColumn>
                      <TableRowColumn>{stringifyTimeDiff(sum)}</TableRowColumn>
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

export default connect(({ result, isFiltering }) => ({ objects: result ? result.list : null, isFiltering }), {
  openDetails
})(List);
