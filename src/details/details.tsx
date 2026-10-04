import { useCallback, useEffect, useMemo } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { NgcInfo } from '../calculator/calculator.types';
import { getTitle } from '../catalog/catalog.utils';
import DialogTitleWithClose from '../dialog/dialog.title';
import { useCloseOnBack } from '../history/history.hooks';
import { useIsWideScreen } from '../media/media.hooks';
import { useAdjacentNgcInfos, useCloseDetails, useOpenedNgcInfo, useOpenedNgcSetter } from './details.hooks';
import DetailsContent from './details.content';
import { useSwipe } from '../swipe/swipe.hooks';
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
      <Button startIcon={<ArrowBackIcon />} onClick={handlePrev} disabled={!prev}>
        Previous
      </Button>
      <Button endIcon={<ArrowForwardIcon />} onClick={handleNext} disabled={!next}>
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
    <div className="Carousel">
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
      <Dialog open={!!ngcInfo} onClose={closeDetails} maxWidth={false} className="Details">
        <DialogTitleWithClose onClose={closeDetails}>{title}</DialogTitleWithClose>
        <DialogContent dividers>{body}</DialogContent>
        <DialogActions>
          <Navigation />
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={!!ngcInfo}
      onClose={closeDetails}
      className="Details compact"
      slotProps={{ paper: { className: 'DetailsPaper' } }}
    >
      <div className="header">
        <IconButton onClick={closeDetails} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="h2" noWrap>
          {title}
        </Typography>
      </div>
      {ngcInfo && <Carousel ngcInfo={ngcInfo} />}
      <div className="footer">
        <Navigation />
      </div>
    </Drawer>
  );
}
