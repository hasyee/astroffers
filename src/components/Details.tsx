import React = require('react');
const { connect } = require('react-redux');
import moment = require('moment');
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import {
  resolveTypes,
  resolveConstellation,
  NgcInfo,
  NightInfo,
  Az,
  CoordSeries,
  dmsToString,
  hmsToString,
  radToDmsString,
  radToHmsString,
  radToDeg,
  getObjectImgSrc
} from 'astroffers-core';
import { displayToDetails } from '../utils/display';
import { openDetails, closeDetails, track } from '../actions';
import {
  isOpenDetails,
  getNightInfo,
  getAdjacentDetails,
  getOpenedNgcInfo,
  getHorizontalCoords,
  getMinAltitude
} from '../selectors';
import AltitudeChart from './AltitudeChart';
import AzimuthChart from './AzimuthChart';

export default connect(
  state => ({
    isOpen: isOpenDetails(state),
    nightInfo: getNightInfo(state),
    ngcInfo: getOpenedNgcInfo(state),
    horizontalCoords: getHorizontalCoords(state),
    minAltitude: getMinAltitude(state),
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

    getTitle(): string {
      const object = this.props.ngcInfo ? this.props.ngcInfo.object : null;
      if (!object) return 'Unknown';
      return [ `NGC ${object.ngc}`, object.messier ? `M ${object.messier}` : null, object.name || null ]
        .filter(_ => _)
        .join(' | ');
    }

    renderContent() {
      if (!this.props.ngcInfo) return null;
      const { horizontalCoords, nightInfo, ngcInfo, minAltitude } = this.props;
      const {
        ngc,
        title,
        types,
        constellation,
        size,
        magnitude,
        surfaceBrightness,
        ra,
        de,
        raOnDate,
        deOnDate,
        rising,
        setting,
        risingAboveMinAltitude,
        settingBelowMinAltitude,
        from,
        to,
        max,
        altitudeAtMax,
        transit,
        altitudeAtTransit
      } = displayToDetails(ngcInfo);
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
                    <td>{resolveTypes(types).join(', ')}</td>
                    <td>
                      <b>Constellation</b>
                    </td>
                    <td>{resolveConstellation(constellation)}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Magnitude</b>
                    </td>
                    <td>{magnitude}</td>
                    <td>
                      <b>Surface brightness</b>
                    </td>
                    <td>{surfaceBrightness}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Size</b>
                    </td>
                    <td>{size}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>RA (J2000)</b>
                    </td>
                    <td>{ra}</td>
                    <td>
                      <b>Dec (J2000)</b>
                    </td>
                    <td>{de}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>RA (on date)</b>
                    </td>
                    <td>{raOnDate}</td>
                    <td>
                      <b>Dec (on date)</b>
                    </td>
                    <td>{deOnDate}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Rising</b>
                    </td>
                    <td>{rising}</td>
                    <td>
                      <b>Setting</b>
                    </td>
                    <td>{setting}</td>
                  </tr>
                  {minAltitude !== 0 && (
                    <tr>
                      <td>
                        <b>Rising above {minAltitude}°</b>
                      </td>
                      <td>{risingAboveMinAltitude}</td>
                      <td>
                        <b>Setting below {minAltitude}°</b>
                      </td>
                      <td>{settingBelowMinAltitude}</td>
                    </tr>
                  )}
                  <tr>
                    <td>
                      <b>Visibility from</b>
                    </td>
                    <td>{from}</td>
                    <td>
                      <b>Visibility to</b>
                    </td>
                    <td>{to}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Best visibility</b>
                    </td>
                    <td>{max}</td>
                    <td>
                      <b>Altitude</b>
                    </td>
                    <td>{altitudeAtMax}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Transit</b>
                    </td>
                    <td>{transit}</td>
                    <td>
                      <b>Altitude</b>
                    </td>
                    <td>{altitudeAtTransit}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="dynamic layout center image-container">
              {imageIsLoading ? <CircularProgress /> : null}
              <img
                alt={`preview of ${ngc}`}
                src={getObjectImgSrc(ngc)}
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
          style={{ float: 'left' }}
        />,
        <FlatButton
          label="Next"
          disabled={!nextDetails}
          onClick={this.handleClickNextDetails}
          style={{ float: 'left' }}
        />,
        <FlatButton label="Close" primary onClick={closeDetails} />
      ];
      return (
        <Dialog
          title={this.getTitle()}
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
