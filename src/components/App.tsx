import * as React from 'react';
import DatePicker from 'material-ui/DatePicker';
import AppBar from 'material-ui/AppBar';
import Filter from './Filter';
import SunCard from './SunCard';

export default class extends React.PureComponent {
  render() {
    return (
      <div className="absolute column layout">
        <header className="dynamic">
          <AppBar title="Astroffers" showMenuIconButton={false} />
        </header>
        <main className="fitted layout">
          <div className="dynamic column layout high">
            <Filter />
          </div>
          <div className="fitted column layout overflow-y content">
            <SunCard />
          </div>
        </main>
      </div>
    );
  }
}
