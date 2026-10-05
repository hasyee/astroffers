import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import moment from 'moment';
import { type MouseEvent, useCallback } from 'react';
import { formatIntervalEnd, formatIntervalStart } from '../display/display.utils';
import { downloadCsv } from '../export/export.utils';
import { useDisplayedList } from '../list/list.hooks';
import Moon from '../moon/moon';
import { useNightInfo, useResultParams } from '../result/result.hooks';
import NightChart from './summary.chart';
import NightTable from './summary.night';
import './summary.scss';

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

type Props = {
  /** The bar of a phone */
  compact?: boolean;
  /** The bar shows the times of the night below it while the calendar is open, and toggles the calendar */
  isExpanded?: boolean;
  onToggle?: () => void;
};

export default function Summary({ compact = false, isExpanded = false, onToggle }: Props) {
  const nightInfo = useNightInfo();
  const params = useResultParams();
  const list = useDisplayedList();
  const handleExport = useCallback(
    (event: MouseEvent) => {
      // not to toggle the bar of the compact summary
      event.stopPropagation();
      if (params) downloadCsv(list, `astroffers-${moment(params.date).format('YYYY-MM-DD')}.csv`);
    },
    [list, params]
  );

  if (!nightInfo || !params) return null;

  const observedNight = params.filter.moonless ? nightInfo.moonlessNight : nightInfo.astroNight;
  const moonIllumination = formatPercent(nightInfo.moonIllumination);

  if (compact) {
    return (
      <div className="Summary compact">
        <div className="bar" onClick={onToggle}>
          <div className="count">
            <div className="value">{list.length}</div>
            <div className="label">objects</div>
          </div>
          <Button
            size="small"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={handleExport}
            disabled={list.length === 0}
          >
            CSV
          </Button>
          <div className="spacer" />
          <div className="label">{moonIllumination}</div>
          <div className="moon">
            <Moon phase={nightInfo.moonPhase} />
          </div>
          <div className="label">
            <div>{formatIntervalStart(observedNight)}</div>
            <div>{formatIntervalEnd(observedNight)}</div>
          </div>
          <NightChart date={params.date} nightInfo={nightInfo} size={42} />
        </div>
        {/* shown at once with the calendar, which fills the rest of the screen */}
        {isExpanded && (
          <div className="details">
            <NightTable nightInfo={nightInfo} />
          </div>
        )}
      </div>
    );
  }

  return (
    <Paper variant="outlined" className="Summary">
      <div className="count">
        <div className="value">{list.length}</div>
        <div className="label">objects</div>
        <Button
          size="small"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={handleExport}
          disabled={list.length === 0}
        >
          CSV
        </Button>
      </div>
      <div className="moon">
        <div className="image">
          <Moon phase={nightInfo.moonPhase} />
        </div>
        <div className="label">{moonIllumination}</div>
      </div>
      <div className="night-info">
        <NightTable nightInfo={nightInfo} />
      </div>
      <NightChart date={params.date} nightInfo={nightInfo} />
    </Paper>
  );
}
