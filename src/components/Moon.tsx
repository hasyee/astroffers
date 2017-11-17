import React = require('react');

const getD = (phase: number): string => {
  let sweep = [];
  let mag;
  if (phase <= 0.25) {
    sweep = [ 1, 0 ];
    mag = 20 - 20 * phase * 4;
  } else if (phase <= 0.5) {
    sweep = [ 0, 0 ];
    mag = 20 * (phase - 0.25) * 4;
  } else if (phase <= 0.75) {
    sweep = [ 1, 1 ];
    mag = 20 - 20 * (phase - 0.5) * 4;
  } else if (phase <= 1) {
    sweep = [ 0, 1 ];
    mag = 20 * (phase - 0.75) * 4;
  } else {
  }
  let d = 'm100,0 ';
  d = d + 'a' + mag + ',20 0 1,' + sweep[0] + ' 0,150 ';
  return (d = d + 'a20,20 0 1,' + sweep[1] + ' 0,-150');
};

export default class extends React.PureComponent<{ phase: number }> {
  render() {
    return (
      <div className="fitted column layout center moon">
        <div className="dynamic layout center">Moon phase</div>
        <div className="fitted">
          <svg id="moon" viewBox="0 0 200 200" width="100px" height="100px">
            <path className="moonback" d="m100,0 a20,20 0 1,1 0,150 a20,20 0 1,1 0,-150" />
            <path className="moonlight" d={getD(this.props.phase)} />
          </svg>
        </div>
      </div>
    );
  }
}
