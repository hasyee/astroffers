import * as React from 'react';
import AppBar from 'material-ui/AppBar';
import DatePicker from 'material-ui/DatePicker';
import Filter from './Filter';

export default class extends React.PureComponent {
  render() {
    return (
      <div className="dynamic column layout panel">
        <AppBar title="Astroffers" showMenuIconButton={false} />
        <Filter />
      </div>
    );
  }
}
