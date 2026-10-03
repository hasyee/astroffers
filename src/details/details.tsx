import { useCallback, useEffect } from 'react';
import { Button, Classes, Dialog, Drawer } from '@blueprintjs/core';
import { getTitle } from '../catalog/catalog.utils';
import { useCloseOnBack } from '../history/history.hooks';
import { useIsWideScreen } from '../media/media.hooks';
import { useAdjacentNgcs, useCloseDetails, useOpenedNgcInfo, useOpenedNgcSetter } from './details.hooks';
import DetailsContent from './details.content';
import './details.scss';

function Navigation() {
  const setOpenedNgc = useOpenedNgcSetter();
  const [prev, next] = useAdjacentNgcs();
  const handlePrev = useCallback(() => prev !== null && setOpenedNgc(prev), [prev, setOpenedNgc]);
  const handleNext = useCallback(() => next !== null && setOpenedNgc(next), [next, setOpenedNgc]);

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
      <Button icon="arrow-left" onClick={handlePrev} disabled={prev === null}>
        Previous
      </Button>
      <Button endIcon="arrow-right" onClick={handleNext} disabled={next === null}>
        Next
      </Button>
    </>
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
            <Button intent="primary" onClick={closeDetails}>
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
      icon={<Button variant="minimal" icon="arrow-left" onClick={closeDetails} aria-label="Back" />}
      isCloseButtonShown={false}
      isOpen={!!ngcInfo}
      onClose={closeDetails}
      size="100%"
      className="Details compact"
    >
      <div className={Classes.DRAWER_BODY}>{body}</div>
      <div className={Classes.DRAWER_FOOTER}>
        <Navigation />
      </div>
    </Drawer>
  );
}
