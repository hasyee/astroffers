import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import classnames from 'classnames';
import moment from 'moment';
import { type MouseEvent, useCallback } from 'react';
import { formatIntervalEnd, formatIntervalStart } from '../display/display.utils';
import { downloadCsv } from '../export/export.utils';
import { useFilter } from '../filter/filter.hooks';
import { useDisplayedList } from '../list/list.hooks';
import Moon from '../moon/moon';
import { useNight, useResultParams } from '../result/result.hooks';
import NightChart from './summary.chart';
import NightTable from './summary.night';
import './summary.scss';

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

type Props = {
  /** The bar of a phone */
  compact?: boolean;
  /** The bar shows the times of the night below it */
  isExpanded?: boolean;
  /** Its expanding and collapsing are animated */
  isAnimated?: boolean;
  /** A click on the bar, which is not clickable without it */
  onToggle?: () => void;
};

export default function Summary({ compact = false, isExpanded = false, isAnimated = true, onToggle }: Props) {
  // the night arrives before the list; the count and the export follow the list
  const night = useNight();
  const { moonless } = useFilter();
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

  if (!night) return null;

  const {
    nightInfo,
    params: { date }
  } = night;
  const observedNight = moonless ? nightInfo.moonlessNight : nightInfo.astroNight;
  const moonIllumination = formatPercent(nightInfo.moonIllumination);

  if (compact) {
    return (
      <div className="Summary compact">
        <div className={classnames('bar', { clickable: onToggle })} onClick={onToggle}>
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
          <NightChart date={date} nightInfo={nightInfo} size={42} />
        </div>
        <Collapse in={isExpanded} timeout={isAnimated ? undefined : 0}>
          <div className="details">
            <NightTable nightInfo={nightInfo} />
          </div>
        </Collapse>
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
      <NightChart date={date} nightInfo={nightInfo} />
    </Paper>
  );
}
