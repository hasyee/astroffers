import classnames from 'classnames';
import CircularProgress from '@mui/material/CircularProgress';
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import EmptyState from '../empty/empty';
import { useIsCalculating, useResult, useResultList } from '../result/result.hooks';
import { useDisplayedList } from './list.hooks';
import ListCards from './list.cards';
import ListTable from './list.table';
import './list.scss';

function NoResults() {
  const result = useResult();
  if (!result) return null;
  const { params, nightInfo } = result;
  const { observationWindow } = params.filter;
  const description = !nightInfo.night
    ? 'The Sun does not set on this date at this location.'
    : observationWindow !== 'night' && !nightInfo.astroNight
      ? 'There is no astronomical night on this date at this location. Try to raise the maximum altitude of the Sun, or to observe in the whole night.'
      : observationWindow === 'moonlessNight' && !nightInfo.moonlessNight
        ? 'The Moon is up during the whole astronomical night. Try another observation window.'
        : observationWindow === 'moonlessNight'
          ? 'Try another observation window, or loosen the filter.'
          : 'Try to loosen the filter.';
  return <EmptyState icon={<NightsStayOutlinedIcon />} title="No results to show" description={description} />;
}

export default function List({ compact = false }: { compact?: boolean }) {
  const result = useResult();
  const resultList = useResultList();
  const list = useDisplayedList();
  const isCalculating = useIsCalculating();

  if (!result) {
    return (
      <div className="List">
        <EmptyState icon={<CircularProgress />} title="Calculating..." />
      </div>
    );
  }

  return (
    <div className={classnames('List', { calculating: isCalculating, compact })}>
      {isCalculating && <CircularProgress className="progress" size={20} />}
      {resultList.length === 0 ? (
        <NoResults />
      ) : (
        <>
          {compact ? <ListCards list={list} /> : <ListTable list={list} />}
          {list.length === 0 && <EmptyState icon={<SearchOffIcon />} title="No matching objects" />}
        </>
      )}
    </div>
  );
}
