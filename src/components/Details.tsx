/**
 * PHOTOS:
 * http://www.ngcicproject.org/dss/n/7/n7662.jpg
 * http://stdatu.stsci.edu/cgi-bin/dss_form?target=ngc1976&resolver=SIMBAD
 */

import React = require('react');
const { connect } = require('react-redux');
import moment = require('moment');
import leftpad = require('left-pad');
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { NgcInfo, NightInfo, Az, CoordSeries } from '../calcs/types';
import resolveTypes from '../calcs/resolveTypes';
import getHorizontalCoords from '../calcs/getHorizontalCoords';
import { dmsToString, hmsToString, radToDmsString, radToHmsString, radToDeg } from '../calcs/units';
import { closeDetails } from '../actions';
import AltitudeChart from './AltitudeChart';
import AzimuthChart from './AzimuthChart';
import analytics from '../analytics';

const getImgSrc = (ngc: number): string =>
  `http://www.ngcicproject.org/dss/n/${Math.floor(ngc / 1000)}/n${leftpad(ngc, 4, 0)}.jpg`;

class Details extends React.PureComponent<{
  isOpen: boolean;
  ngcInfo: NgcInfo;
  nightInfo: NightInfo;
  minAltitude: number;
  horizontalCoords: CoordSeries<Az>;
  closeDetails: typeof closeDetails;
}> {
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen === false && this.props.isOpen === true) {
      analytics.event('Details', 'open');
    } else if (prevProps.isOpen === true && this.props.isOpen === false) {
      analytics.event('Details', 'close');
    }
  }

  renderContent() {
    if (!this.props.ngcInfo) return null;
    const {
      horizontalCoords,
      nightInfo,
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
    return (
      <div className="details">
        <div className="dynamic row layout">
          <div className="fitted layout">
            <table>
              <tbody>
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
                    <b>Altitude</b>
                  </td>
                  <td>{Math.round(radToDeg(altitudeAtMax))}°</td>
                </tr>
                <tr>
                  <td>
                    <b>Transit</b>
                  </td>
                  <td>{moment(transit).format('HH:mm')}</td>
                  <td>
                    <b>Altitude</b>
                  </td>
                  <td>{Math.round(radToDeg(altitudeAtTransit))}°</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="dynamic layout">
            <img alt={`preview of ${ngc}`} src={getImgSrc(ngc)} />
          </div>
        </div>
        <div className="dynamic row layout">
          <div className="fitted layout">
            <AltitudeChart
              minAltitude={minAltitude}
              ngcInfo={this.props.ngcInfo}
              horizontalCoords={horizontalCoords}
              nightInfo={nightInfo}
            />
          </div>
          <div className="dynamic layout">
            <AzimuthChart horizontalCoords={horizontalCoords} />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { closeDetails, isOpen } = this.props;
    const actions = [ <FlatButton label="Close" primary={true} onClick={closeDetails} /> ];
    return (
      <Dialog
        title={`NGC ${this.props.ngcInfo && this.props.ngcInfo.object ? this.props.ngcInfo.object.ngc : 'Unknown'}`}
        actions={actions}
        modal={false}
        open={isOpen}
        autoScrollBodyContent
        contentStyle={{ maxWidth: '850px' }}
        onRequestClose={closeDetails}
      >
        {this.renderContent()}
      </Dialog>
    );
  }
}

export default connect(
  ({ openedDetails, result, filter: { date, latitude, longitude, altitude } }) => {
    const ngcInfo = result ? result.list.find(info => info.object.ngc === openedDetails) : null;
    return {
      isOpen: openedDetails !== null,
      nightInfo: result ? result.nightInfo : null,
      ngcInfo,
      horizontalCoords: ngcInfo ? getHorizontalCoords(date, latitude, longitude, ngcInfo.eqCoordsOnDate) : null,
      minAltitude: altitude
    };
  },
  { closeDetails }
)(Details);
