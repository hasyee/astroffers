import { useCallback, useState } from 'react';
import moment from 'moment';
import { Button, Card, Collapse } from '@blueprintjs/core';
import { downloadCsv } from '../export/export.utils';
import { formatDate, formatIntervalEnd, formatIntervalStart } from '../display/display.utils';
import { useDisplayedList } from '../list/list.hooks';
import Moon from '../moon/moon';
import { useNightInfo, useResultParams } from '../result/result.hooks';
import NightChart from './summary.chart';
import NightTable from './summary.night';
import './summary.scss';

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export default function Summary({ compact = false }: { compact?: boolean }) {
  const nightInfo = useNightInfo();
  const params = useResultParams();
  const list = useDisplayedList();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => setIsExpanded(isExpanded => !isExpanded), []);
  const handleExport = useCallback(() => {
    if (params) downloadCsv(list, `astroffers-${moment(params.date).format('YYYY-MM-DD')}.csv`);
  }, [list, params]);

  if (!nightInfo || !params) return null;

  const observedNight = params.filter.moonless ? nightInfo.moonlessNight : nightInfo.astroNight;
  const moonIllumination = formatPercent(nightInfo.moonIllumination);

  if (compact) {
    return (
      <div className="Summary compact">
        <div className="bar" onClick={handleToggle}>
          <div className="count">
            <div className="value">{list.length}</div>
            <div className="label">objects</div>
          </div>
          <div className="moon">
            <Moon phase={nightInfo.moonPhase} />
          </div>
          <div className="observed-night">
            <div>{formatIntervalStart(observedNight)}</div>
            <div>{formatIntervalEnd(observedNight)}</div>
          </div>
          <NightChart date={params.date} nightInfo={nightInfo} size={64} />
          <Button variant="minimal" icon={isExpanded ? 'chevron-up' : 'chevron-down'} aria-label="Night details" />
        </div>
        <Collapse isOpen={isExpanded}>
          <div className="details">
            <div className="date">
              {formatDate(params.date)} · Moon illumination {moonIllumination}
            </div>
            <NightTable nightInfo={nightInfo} />
          </div>
        </Collapse>
      </div>
    );
  }

  return (
    <Card className="Summary">
      <div className="count">
        <div className="value">{list.length}</div>
        <div className="label">objects</div>
        <Button icon="export" variant="minimal" onClick={handleExport} disabled={list.length === 0}>
          Export CSV
        </Button>
      </div>
      <div className="moon">
        <div className="label">Moon</div>
        <div className="image">
          <Moon phase={nightInfo.moonPhase} />
        </div>
        <div className="label">{moonIllumination}</div>
      </div>
      <div className="night-info">
        <div className="date">{formatDate(params.date)}</div>
        <NightTable nightInfo={nightInfo} />
      </div>
      <NightChart date={params.date} nightInfo={nightInfo} />
    </Card>
  );
}
