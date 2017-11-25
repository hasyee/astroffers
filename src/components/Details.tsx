import React = require('react');
import { connect } from 'react-redux';
import moment = require('moment');
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { NgcInfo } from '../calcs/types';
import resolveTypes from '../calcs/resolveTypes';
import { dmsToString, hmsToString, radToDmsString, radToHmsString, radToDeg } from '../calcs/units';
import { closeDetails } from '../actions';

class Details extends React.PureComponent<{
  isOpen: boolean;
  ngcInfo: NgcInfo;
  closeDetails: typeof closeDetails;
  minAltitude: number;
}> {
  render() {
    if (!this.props.ngcInfo) return null;
    const {
      closeDetails,
      isOpen,
      ngcInfo: {
        object: { ngc, type, constellation, size, magnitude, surfaceBrightness, eqCoords },
        eqCoordsOnDate,
        max,
        sum,
        transit,
        hda,
        hda0,
        intersection,
        altitudeAtMax,
        altitudeAtTransit
      },
      minAltitude
    } = this.props;
    const actions = [ <FlatButton label="Close" primary={true} onClick={closeDetails} /> ];
    return (
      <Dialog
        title={`NGC ${ngc}`}
        actions={actions}
        modal={true}
        open={isOpen}
        autoScrollBodyContent
        contentStyle={{ maxWidth: '850px' }}
      >
        <div className="details">
          <div className="dynamic row layout">
            <div className="fitted layout">
              <table>
                <tr>
                  <td>
                    <b>Type</b>
                  </td>
                  <td>{resolveTypes(type).join(', ')}</td>
                </tr>
                <tr>
                  <td>
                    <b>Constellation</b>
                  </td>
                  <td>{constellation}</td>
                </tr>
                <tr>
                  <td>
                    <b>Size</b>
                  </td>
                  <td>{size ? `${dmsToString(size[0])} × ${dmsToString(size[1])}` : 'Unknown'}</td>
                </tr>
                <tr>
                  <td>
                    <b>Magnitude</b>
                  </td>
                  <td>{magnitude}</td>
                </tr>
                <tr>
                  <td>
                    <b>Surface brightness</b>
                  </td>
                  <td>{surfaceBrightness}</td>
                </tr>
                <tr>
                  <td>
                    <b>RA (J2000)</b>
                  </td>
                  <td>{hmsToString(eqCoords.ra)}</td>
                  <td>
                    <b>Dec (J2000)</b>
                  </td>
                  <td>{dmsToString(eqCoords.de)}</td>
                </tr>
                <tr>
                  <td>
                    <b>RA (on date)</b>
                  </td>
                  <td>{radToHmsString(eqCoordsOnDate.ra)}</td>
                  <td>
                    <b>Dec (on date)</b>
                  </td>
                  <td>{radToDmsString(eqCoordsOnDate.de)}</td>
                </tr>
                <tr>
                  <td>
                    <b>Rising</b>
                  </td>
                  <td>{moment(hda0.start).format('HH:mm')}</td>
                  <td>
                    <b>Setting</b>
                  </td>
                  <td>{moment(hda0.end).format('HH:mm')}</td>
                </tr>
                {minAltitude !== 0 && (
                  <tr>
                    <td>
                      <b>Rising above {minAltitude}°</b>
                    </td>
                    <td>{moment(hda.start).format('HH:mm')}</td>
                    <td>
                      <b>Setting below {minAltitude}°</b>
                    </td>
                    <td>{moment(hda.end).format('HH:mm')}</td>
                  </tr>
                )}
                <tr>
                  <td>
                    <b>Visibility from</b>
                  </td>
                  <td>{moment(intersection.start).format('HH:mm')}</td>
                  <td>
                    <b>Visibility to</b>
                  </td>
                  <td>{moment(intersection.end).format('HH:mm')}</td>
                </tr>
                <tr>
                  <td>
                    <b>Best visibility</b>
                  </td>
                  <td>{moment(max).format('HH:mm')}</td>
                  <td>
                    <b>Altitude then</b>
                  </td>
                  <td>{Math.round(radToDeg(altitudeAtMax))}°</td>
                </tr>
                <tr>
                  <td>
                    <b>Transit</b>
                  </td>
                  <td>{moment(transit).format('HH:mm')}</td>
                  <td>
                    <b>Altitude then</b>
                  </td>
                  <td>{Math.round(radToDeg(altitudeAtTransit))}°</td>
                </tr>
              </table>
            </div>
            <div className="dynamic layout">
              <img src="http://www.ngcicproject.org/dss/n/7/n7662.jpg" width="300px" height="300px" />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default connect(
  ({ openedDetails, result, filter: { altitude } }) => ({
    isOpen: openedDetails !== null,
    ngcInfo: result ? result.list.find(info => info.object.ngc === openedDetails) : null,
    minAltitude: altitude
  }),
  { closeDetails }
)(Details);
