import React = require('react');

const TIMEOUT = 300;

export default class extends React.PureComponent<{ value: string; onTypeEnd: Function }, { value: string }> {
  timer: NodeJS.Timer;
  state = { value: this.props.value };

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) this.setState({ value: nextProps.value });
  }

  handleChange = evt => {
    this.setState({ value: evt.target.value });
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.props.onTypeEnd(this.state.value);
    }, TIMEOUT);
  };

  render() {
    return <input value={this.state.value} onChange={this.handleChange} />;
  }
}
