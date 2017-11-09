import * as React from 'react';
import AppBar from 'material-ui/AppBar';

export default class extends React.PureComponent {
  render() {
    return (
      <div className="absolute layout">
        <div className="dynamic column layout panel">
          <AppBar title="Astroffers" showMenuIconButton={false} />
        </div>
        <div className="fitted layout" />
      </div>
    );
  }
}
