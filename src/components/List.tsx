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

export default class extends React.PureComponent<{ objects: NgcInfo[] }> {
  render() {
    return (
      <div className="fitted layout card">
        <Table selectable={false} height={'calc(100% - 59px)'}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>NGC</TableHeaderColumn>
              <TableHeaderColumn>From</TableHeaderColumn>
              <TableHeaderColumn>To</TableHeaderColumn>
              <TableHeaderColumn>Magnitude</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.props.objects.map(({ object: { ngc, magnitude }, intersection: { start, end } }) => (
              <TableRow key={ngc} selectable={false}>
                <TableRowColumn>{ngc}</TableRowColumn>
                <TableRowColumn>{new Date(start).toLocaleString()}</TableRowColumn>
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
