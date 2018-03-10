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
import CircularProgress from 'material-ui/CircularProgress';
import { NgcInfo, NightInfo, Az, CoordSeries } from '../calcs/types';
import resolveTypes from '../calcs/resolveTypes';

import { dmsToString, hmsToString, radToDmsString, radToHmsString, radToDeg } from '../calcs/units';
import { openDetails, closeDetails, track } from '../actions';
import {
  isOpenDetails,
  getNightInfo,
  getAdjacentDetails,
  getOpenedNgcInfo,
  getHorizontalCoords,
  getMinAltitde
} from '../selectors';
import AltitudeChart from './AltitudeChart';
import AzimuthChart from './AzimuthChart';

const getTitle = (ngcInfo: NgcInfo): string => {
  const object = ngcInfo ? ngcInfo.object : null;
  if (!object) return 'Unknown';
  return [ `NGC ${object.ngc}`, object.messier ? `M ${object.messier}` : null, object.name || null ]
    .filter(_ => _)
    .join(' | ');
};

const getImgSrc = (ngc: number): string =>
  `http://www.ngcicproject.org/dss/n/${Math.floor(ngc / 1000)}/n${leftpad(ngc, 4, 0)}.jpg`;

const leftButtonStyle = { float: 'left' };

export default connect(
  state => ({
    isOpen: isOpenDetails(state),
    nightInfo: getNightInfo(state),
    ngcInfo: getOpenedNgcInfo(state),
    horizontalCoords: getHorizontalCoords(state),
    minAltitude: getMinAltitde(state),
    prevDetails: getAdjacentDetails(-1)(state),
    nextDetails: getAdjacentDetails(+1)(state)
  }),
  { openDetails, closeDetails, track }
)(
  class extends React.PureComponent<
    {
      isOpen: boolean;
      ngcInfo: NgcInfo;
      nightInfo: NightInfo;
      minAltitude: number;
      prevDetails: number;
      nextDetails: number;
      horizontalCoords: CoordSeries<Az>;
      openDetails: typeof openDetails;
      closeDetails: typeof closeDetails;
      track: typeof track;
    },
    { imageIsLoading: boolean }
  > {
    state = { imageIsLoading: true };

    componentDidUpdate(prevProps) {
      if (prevProps.isOpen === false && this.props.isOpen === true) {
        this.props.track('View', 'open-details');
      } else if (prevProps.isOpen === true && this.props.isOpen === false) {
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.ngcInfo !== nextProps.ngcInfo) this.setState({ imageIsLoading: true });
    }

    handleClickPrevDetails = () => this.props.openDetails(this.props.prevDetails);
    handleClickNextDetails = () => this.props.openDetails(this.props.nextDetails);
    handleImageLoaded = () => this.setState({ imageIsLoading: false });

    renderContent() {
      if (!this.props.ngcInfo) return null;
      const {
        horizontalCoords,
        nightInfo,
        ngcInfo: {
          object: { ngc, messier, name, type, constellation, size, magnitude, surfaceBrightness, eqCoords },
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
      const { imageIsLoading } = this.state;
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
                    <td>{Number.isFinite(hda0.start) ? moment(hda0.start).format('HH:mm') : '-'}</td>
                    <td>
                      <b>Setting</b>
                    </td>
                    <td>{Number.isFinite(hda0.end) ? moment(hda0.end).format('HH:mm') : '-'}</td>
                  </tr>
                  {minAltitude !== 0 && (
                    <tr>
                      <td>
                        <b>Rising above {minAltitude}°</b>
                      </td>
                      <td>{Number.isFinite(hda.start) ? moment(hda.start).format('HH:mm') : '-'}</td>
                      <td>
                        <b>Setting below {minAltitude}°</b>
                      </td>
                      <td>{Number.isFinite(hda.end) ? moment(hda.end).format('HH:mm') : '-'}</td>
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
                    <td>{max ? moment(max).format('HH:mm') : '-'}</td>
                    <td>
                      <b>Altitude</b>
                    </td>
                    <td>{altitudeAtMax ? Math.round(radToDeg(altitudeAtMax)) : '-'}°</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Transit</b>
                    </td>
                    <td>{transit ? moment(transit).format('HH:mm') : '-'}</td>
                    <td>
                      <b>Altitude</b>
                    </td>
                    <td>{altitudeAtTransit ? Math.round(radToDeg(altitudeAtTransit)) : '-'}°</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="dynamic layout center image-container">
              {imageIsLoading ? <CircularProgress /> : null}
              <img
                alt={`preview of ${ngc}`}
                src={getImgSrc(ngc)}
                className={imageIsLoading ? 'hidden' : null}
                onLoad={this.handleImageLoaded}
              />
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
      const { closeDetails, isOpen, prevDetails, nextDetails } = this.props;
      const actions = [
        <FlatButton
          label="Previous"
          disabled={!prevDetails}
          onClick={this.handleClickPrevDetails}
          style={leftButtonStyle}
        />,
        <FlatButton
          label="Next"
          disabled={!nextDetails}
          onClick={this.handleClickNextDetails}
          style={leftButtonStyle}
        />,
        <FlatButton label="Close" primary onClick={closeDetails} />
      ];
      return (
        <Dialog
          title={getTitle(this.props.ngcInfo)}
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
);
