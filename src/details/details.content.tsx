import { useState } from 'react';
import classnames from 'classnames';
import { Spinner } from '@blueprintjs/core';
import type { NgcInfo } from '../calculator/calculator.types';
import { getObjectImgSrc } from '../catalog/catalog.utils';
import { toDetails } from '../display/display.utils';
import { useNightInfo, useResultParams } from '../result/result.hooks';
import { useHorizontalCoords } from './details.hooks';
import AltitudeChart from './details.altitude';
import AzimuthChart from './details.azimuth';

function Property({ label, value }: { label: string; value: string }) {
  return (
    <div className="Property">
      <label>{label}</label>
      <div>{value}</div>
    </div>
  );
}

function Preview({ ngcInfo }: { ngcInfo: NgcInfo }) {
  const src = getObjectImgSrc(ngcInfo.object);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <div className="Preview">
      {loadedSrc !== src && failedSrc !== src && <Spinner />}
      {failedSrc === src ? (
        <div className="unavailable">Preview is unavailable</div>
      ) : (
        <img
          className={classnames({ hidden: loadedSrc !== src })}
          src={src}
          alt={`DSS2 preview of NGC ${ngcInfo.object.ngc}`}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
        />
      )}
      <div className="credit">DSS2 · CDS hips2fits</div>
    </div>
  );
}

export default function DetailsContent({ ngcInfo }: { ngcInfo: NgcInfo }) {
  const nightInfo = useNightInfo();
  const params = useResultParams();
  const horizontalCoords = useHorizontalCoords(ngcInfo);
  const details = toDetails(ngcInfo);
  const minAltitude = params?.filter.altitude ?? 0;

  return (
    <div className="DetailsContent">
      <div className="overview">
        <Preview ngcInfo={ngcInfo} />
        <div className="properties">
          <Property label="Type" value={details.types} />
          <Property label="Constellation" value={details.constellation} />
          <Property label="Magnitude" value={details.magnitude} />
          <Property label="Surface brightness" value={details.surfaceBrightness} />
          <Property label="Size" value={details.size} />
          <div />
          <Property label="RA (J2000)" value={details.ra} />
          <Property label="Dec (J2000)" value={details.de} />
          <Property label="RA (on date)" value={details.raOnDate} />
          <Property label="Dec (on date)" value={details.deOnDate} />
          <Property label="Rising" value={details.rising} />
          <Property label="Setting" value={details.setting} />
          {minAltitude !== 0 && (
            <>
              <Property label={`Rising above ${minAltitude}°`} value={details.risingAboveMinAltitude} />
              <Property label={`Setting below ${minAltitude}°`} value={details.settingBelowMinAltitude} />
            </>
          )}
          <Property label="Visible from" value={details.from} />
          <Property label="Visible to" value={details.to} />
          <Property label="Best visibility" value={details.max} />
          <Property label="Altitude" value={details.altitudeAtMax} />
          <Property label="Transit" value={details.transit} />
          <Property label="Altitude" value={details.altitudeAtTransit} />
        </div>
      </div>
      {horizontalCoords && nightInfo && (
        <div className="charts">
          <div className="altitude">
            <AltitudeChart
              horizontalCoords={horizontalCoords}
              ngcInfo={ngcInfo}
              nightInfo={nightInfo}
              minAltitude={minAltitude}
            />
          </div>
          <div className="azimuth">
            <AzimuthChart horizontalCoords={horizontalCoords} />
          </div>
        </div>
      )}
    </div>
  );
}
