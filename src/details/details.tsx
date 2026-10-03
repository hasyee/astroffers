import { useCallback, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { Button, Classes, Dialog, Drawer } from '@blueprintjs/core';
import type { NgcInfo } from '../calculator/calculator.types';
import { getTitle } from '../catalog/catalog.utils';
import { useCloseOnBack } from '../history/history.hooks';
import { useIsWideScreen } from '../media/media.hooks';
import { useAdjacentNgcInfos, useCloseDetails, useOpenedNgcInfo, useOpenedNgcSetter } from './details.hooks';
import DetailsContent from './details.content';
import { useSwipe } from './details.swipe';
import './details.scss';

function Navigation() {
  const setOpenedNgc = useOpenedNgcSetter();
  const [prev, next] = useAdjacentNgcInfos();
  const handlePrev = useCallback(() => prev && setOpenedNgc(prev.object.ngc), [prev, setOpenedNgc]);
  const handleNext = useCallback(() => next && setOpenedNgc(next.object.ngc), [next, setOpenedNgc]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handlePrev();
      if (event.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <>
      <Button variant="minimal" icon="arrow-left" onClick={handlePrev} disabled={!prev}>
        Previous
      </Button>
      <Button variant="minimal" endIcon="arrow-right" onClick={handleNext} disabled={!next}>
        Next
      </Button>
    </>
  );
}

/**
 * Body of the full-screen drawer: the previous, the current and the next object side by side, each scrolling on
 * its own, to swipe between them like the pages of a carousel
 */
function Carousel({ ngcInfo }: { ngcInfo: NgcInfo }) {
  const setOpenedNgc = useOpenedNgcSetter();
  const [prev, next] = useAdjacentNgcInfos();
  const onPrev = useMemo(() => (prev ? () => setOpenedNgc(prev.object.ngc) : null), [prev, setOpenedNgc]);
  const onNext = useMemo(() => (next ? () => setOpenedNgc(next.object.ngc) : null), [next, setOpenedNgc]);
  const trackRef = useSwipe<HTMLDivElement>({ onPrev, onNext }, ngcInfo.object.ngc);

  // keyed by the object, so a neighbor stepped to is kept as it is (e.g. its loaded image and charts)
  const pages: [string, NgcInfo | null][] = [
    [prev ? String(prev.object.ngc) : 'no-prev', prev],
    [String(ngcInfo.object.ngc), ngcInfo],
    [next ? String(next.object.ngc) : 'no-next', next]
  ];

  return (
    <div className={classnames(Classes.DRAWER_BODY, 'Carousel')}>
      <div className="track" ref={trackRef}>
        {pages.map(([key, pageNgcInfo]) => (
          <div key={key} className="page">
            {pageNgcInfo && <DetailsContent ngcInfo={pageNgcInfo} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Details() {
  const ngcInfo = useOpenedNgcInfo();
  const closeDetails = useCloseDetails();
  const isWideScreen = useIsWideScreen();
  useCloseOnBack(!!ngcInfo, closeDetails);

  const title = ngcInfo ? getTitle(ngcInfo.object) : '';
  const body = ngcInfo && <DetailsContent ngcInfo={ngcInfo} />;

  if (isWideScreen) {
    return (
      <Dialog title={title} isOpen={!!ngcInfo} onClose={closeDetails} className="Details">
        <div className={Classes.DIALOG_BODY}>{body}</div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Navigation />
            <Button variant="minimal" intent="primary" onClick={closeDetails}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Drawer
      title={title}
      icon={<Button variant="minimal" size="large" icon="arrow-left" onClick={closeDetails} aria-label="Back" />}
      isCloseButtonShown={false}
      isOpen={!!ngcInfo}
      onClose={closeDetails}
      size="100%"
      className="Details compact"
    >
      {ngcInfo && <Carousel ngcInfo={ngcInfo} />}
      <div className={Classes.DRAWER_FOOTER}>
        <Navigation />
      </div>
    </Drawer>
  );
}
