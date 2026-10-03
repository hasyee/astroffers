import classnames from 'classnames';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { useIsCalculating, useResult, useResultList } from '../result/result.hooks';
import { useDisplayedList } from './list.hooks';
import ListCards from './list.cards';
import ListTable from './list.table';
import './list.scss';

function NoResults() {
  const result = useResult();
  if (!result) return null;
  const { params, nightInfo } = result;
  const description = !nightInfo.astroNight
    ? 'There is no astronomical night on this date at this location. Try to raise the maximum altitude of the Sun.'
    : params.filter.moonless && !nightInfo.moonlessNight
      ? 'The Moon is up during the whole astronomical night. Try to turn off the Moonless night only filter.'
      : params.filter.moonless
        ? 'Try to turn off the Moonless night only filter, or loosen the filter.'
        : 'Try to loosen the filter.';
  return <NonIdealState icon="moon" title="No results to show" description={description} />;
}

export default function List({ compact = false }: { compact?: boolean }) {
  const result = useResult();
  const resultList = useResultList();
  const list = useDisplayedList();
  const isCalculating = useIsCalculating();

  if (!result) {
    return (
      <div className="List">
        <NonIdealState icon={<Spinner />} title="Calculating..." />
      </div>
    );
  }

  return (
    <div className={classnames('List', { calculating: isCalculating, compact })}>
      {isCalculating && <Spinner className="progress" size={20} />}
      {resultList.length === 0 ? (
        <NoResults />
      ) : (
        <>
          {compact ? <ListCards list={list} /> : <ListTable list={list} />}
          {list.length === 0 && <NonIdealState icon="search" title="No matching objects" />}
        </>
      )}
    </div>
  );
}
