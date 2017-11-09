import * as React from 'react';
import AppBar from 'material-ui/AppBar';
import DatePicker from 'material-ui/DatePicker';
import Panel from './Panel';

export default class extends React.PureComponent {
  render() {
    return (
      <div className="absolute layout">
        <Panel />
        <div className="fitted layout" />
      </div>
    );
  }
}
