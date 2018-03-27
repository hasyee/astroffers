import React = require('react');
import { findDOMNode } from 'react-dom';
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
import { ListItemProp } from '../types';
import { NgcInfo } from '../calcs/types';
import display from '../utils/display';
import resolveTypes from '../calcs/resolveTypes';
import resolveConstellation from '../calcs/resolveConstellation';
import { openDetails, sort } from '../actions';
import { getList, isFiltering, getSortBy } from '../selectors';
import LazyInput from './LazyInput';

const DEFAULT_DISPLAYED_ITEMS = 100;

export default connect(
  state => ({ objects: getList(state), isFiltering: isFiltering(state), sortBy: getSortBy(state) }),
  { openDetails, sort }
)(
  class extends React.PureComponent<
    {
      objects: NgcInfo[];
      isFiltering: boolean;
      sortBy: ListItemProp;
      openDetails: typeof openDetails;
      sort: typeof sort;
    },
    { displayedItems: number; filter: { [key in ListItemProp]?: string } }
  > {
    private table;

    state = {
      displayedItems: DEFAULT_DISPLAYED_ITEMS,
      filter: {
        [ListItemProp.NGC]: '',
        [ListItemProp.MESSIER]: '',
        [ListItemProp.NAME]: ''
      }
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
      if (prevProps.sortBy !== this.props.sortBy) {
        this.setState({ displayedItems: DEFAULT_DISPLAYED_ITEMS });
        if (this.table) this.table.scrollTop = 0;
      }
    }

    handleHeaderClick = (prop: ListItemProp) => () => {
      if (prop !== this.props.sortBy) {
        this.props.sort(prop);
      }
    };

    handleFilterChange = (prop: ListItemProp) => value => {
      this.setState({ filter: { ...this.state.filter, [prop]: value } });
    };

    handleRowClick = (ngc: number) => () => this.props.openDetails(ngc);

    renderSortByIcon(prop: string) {
      return prop === this.props.sortBy && <i className="mdi mdi-arrow-down" />;
    }

    render() {
      const { displayedItems, filter } = this.state;
      const { sortBy, isFiltering, objects } = this.props;
      if (isFiltering || !objects) return null;
      return (
        <div className="fitted layout list card">
          <Table selectable={false} height={'calc(100% - 59px)'} ref="table" style={{ overflow: 'hidden' }}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn className="ngc">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.NGC)}>
                    NGC{this.renderSortByIcon(ListItemProp.NGC)}
                  </span>
                  <br />
                  <LazyInput value={filter[ListItemProp.NGC]} onTypeEnd={this.handleFilterChange(ListItemProp.NGC)} />
                </TableHeaderColumn>
                <TableHeaderColumn className="messier">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.MESSIER)}>
                    M{this.renderSortByIcon(ListItemProp.MESSIER)}
                  </span>
                  <br />
                  <LazyInput
                    value={filter[ListItemProp.MESSIER]}
                    onTypeEnd={this.handleFilterChange(ListItemProp.MESSIER)}
                  />
                </TableHeaderColumn>
                <TableHeaderColumn className="name">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.NAME)}>
                    Name{this.renderSortByIcon(ListItemProp.NAME)}
                  </span>
                  <br />
                  <LazyInput value={filter[ListItemProp.NAME]} onTypeEnd={this.handleFilterChange(ListItemProp.NAME)} />
                </TableHeaderColumn>
                <TableHeaderColumn className="type">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.TYPE)}>
                    Type{this.renderSortByIcon(ListItemProp.TYPE)}
                  </span>
                </TableHeaderColumn>
                <TableHeaderColumn className="constellation">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.CONSTELLATION)}>
                    Cons.{this.renderSortByIcon(ListItemProp.CONSTELLATION)}
                  </span>
                </TableHeaderColumn>
                <TableHeaderColumn className="from">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.FROM)}>
                    From{this.renderSortByIcon(ListItemProp.FROM)}
                  </span>
                </TableHeaderColumn>
                <TableHeaderColumn className="to">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.TO)}>
                    To{this.renderSortByIcon(ListItemProp.TO)}
                  </span>
                </TableHeaderColumn>
                <TableHeaderColumn className="max">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.MAX)}>
                    Max / Alt{this.renderSortByIcon(ListItemProp.MAX)}
                  </span>
                </TableHeaderColumn>
                <TableHeaderColumn className="sum">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.SUM)}>
                    Sum{this.renderSortByIcon(ListItemProp.SUM)}
                  </span>
                </TableHeaderColumn>
                <TableHeaderColumn className="magnitude">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.MAGNITUDE)}>
                    Mag.{this.renderSortByIcon(ListItemProp.MAGNITUDE)}
                  </span>
                </TableHeaderColumn>
                <TableHeaderColumn className="surface-brightness">
                  <span className="sorter" onClick={this.handleHeaderClick(ListItemProp.SURFACE_BRIGHTNESS)}>
                    Sur.br.{this.renderSortByIcon(ListItemProp.SURFACE_BRIGHTNESS)}
                  </span>
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false} preScanRows={false}>
              {objects.slice(0, displayedItems).filter(search(this.state.filter)).map(ngcInfo => {
                const {
                  ngc,
                  messier,
                  name,
                  types,
                  constellation,
                  from,
                  to,
                  max,
                  sum,
                  magnitude,
                  surfaceBrightness
                } = display(ngcInfo);
                const typeStr = types.join(', ');
                const resolvedTypeStr = resolveTypes(types);
                return (
                  <TableRow key={ngc} selectable={false} className="list row" onClick={this.handleRowClick(ngc)}>
                    <TableRowColumn className="ngc">
                      <b>{ngc}</b>
                    </TableRowColumn>
                    <TableRowColumn className="messier">{messier}</TableRowColumn>
                    <TableRowColumn className="name" title={name}>
                      {name}
                    </TableRowColumn>
                    <TableRowColumn className="type" title={resolvedTypeStr}>
                      {typeStr}
                    </TableRowColumn>
                    <TableRowColumn className="constellation" title={resolveConstellation(constellation)}>
                      {constellation}
                    </TableRowColumn>
                    <TableRowColumn className="from">{from}</TableRowColumn>
                    <TableRowColumn className="to">{to}</TableRowColumn>
                    <TableRowColumn className="max">{max}</TableRowColumn>
                    <TableRowColumn className="sum">{sum}</TableRowColumn>
                    <TableRowColumn className="magnitude">{magnitude}</TableRowColumn>
                    <TableRowColumn className="surface-brightness">{surfaceBrightness}</TableRowColumn>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    }
  }
);

const search = (filter: { [key in ListItemProp]?: string }) => (ngcInfo: NgcInfo): boolean => {
  if (filter[ListItemProp.NGC] && filter[ListItemProp.NGC] !== ngcInfo.object.ngc.toString()) return false;
  if (filter[ListItemProp.MESSIER] && !ngcInfo.object.messier) return false;
  if (
    filter[ListItemProp.MESSIER] &&
    ngcInfo.object.messier &&
    filter[ListItemProp.MESSIER] !== ngcInfo.object.messier.toString()
  )
    return false;
  if (filter[ListItemProp.NAME] && !ngcInfo.object.name) return false;
  if (
    filter[ListItemProp.NAME] &&
    ngcInfo.object.name &&
    ngcInfo.object.name.toLowerCase().search(filter[ListItemProp.NAME].toLowerCase()) === -1
  )
    return false;

  return true;
};
