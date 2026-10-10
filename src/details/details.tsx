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
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import type { NgcInfo, NgcObject } from '../calculator/calculator.types';
import { getSubtitle, getTitle } from '../catalog/catalog.utils';
import DialogTitleWithClose from '../dialog/dialog.title';
import { useIsWideScreen } from '../media/media.hooks';
import RedLightToggle from '../redlight/redlight.toggle';
import { useResult } from '../result/result.hooks';
import {
  useAdjacentNgcInfos,
  useCloseDetails,
  useCloseMap,
  useIsDetailsRoute,
  useIsMapRoute,
  useOpenMap,
  useOpenedNgcInfo,
  useStepDetails
} from './details.hooks';
import DetailsContent from './details.content';
import OpenInMenu from '../external/external.menu';
import StarMap from '../starmap/starmap';
import { useSwipe } from '../swipe/swipe.hooks';
import './details.scss';

/**
 * Steps to the previous / next object of the list, with the Open in menu between them; icons only in the footer
 * of the compact drawer
 */
function Navigation({ ngcInfo, isCompact = false }: { ngcInfo: NgcInfo | null; isCompact?: boolean }) {
  const stepDetails = useStepDetails();
  const [prev, next] = useAdjacentNgcInfos();
  const handlePrev = useCallback(() => prev && stepDetails(prev.object.id), [prev, stepDetails]);
  const handleNext = useCallback(() => next && stepDetails(next.object.id), [next, stepDetails]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handlePrev();
      if (event.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  if (isCompact) {
    return (
      <>
        <IconButton onClick={handlePrev} disabled={!prev} aria-label="Previous">
          <ArrowBackIcon />
        </IconButton>
        {ngcInfo && <OpenInMenu ngcInfo={ngcInfo} />}
        <IconButton onClick={handleNext} disabled={!next} aria-label="Next">
          <ArrowForwardIcon />
        </IconButton>
      </>
    );
  }

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} onClick={handlePrev} disabled={!prev}>
        Previous
      </Button>
      {ngcInfo && <OpenInMenu ngcInfo={ngcInfo} />}
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
  const stepDetails = useStepDetails();
  const [prev, next] = useAdjacentNgcInfos();
  const onPrev = useMemo(() => (prev ? () => stepDetails(prev.object.id) : null), [prev, stepDetails]);
  const onNext = useMemo(() => (next ? () => stepDetails(next.object.id) : null), [next, stepDetails]);
  const trackRef = useSwipe<HTMLDivElement>({ onPrev, onNext }, ngcInfo.object.id);

  // keyed by the object, so a neighbor stepped to is kept as it is (e.g. its loaded image and charts)
  const pages: [string, NgcInfo | null][] = [
    [prev ? prev.object.id : 'no-prev', prev],
    [ngcInfo.object.id, ngcInfo],
    [next ? next.object.id : 'no-next', next]
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

/** Toggles the star map in the place of the details: `/:id/map`; an icon only in the header of the compact drawer */
function MapButton({ id, isCompact = false }: { id: string; isCompact?: boolean }) {
  const isMapRoute = useIsMapRoute();
  const openMap = useOpenMap();
  const closeMap = useCloseMap();
  const handleClick = () => (isMapRoute ? closeMap() : openMap(id));

  if (isCompact) {
    return (
      <IconButton
        color={isMapRoute ? 'primary' : 'default'}
        onClick={handleClick}
        aria-label="Map"
        aria-pressed={isMapRoute}
      >
        <MapOutlinedIcon />
      </IconButton>
    );
  }

  return (
    <Button
      color={isMapRoute ? 'primary' : 'inherit'}
      startIcon={<MapOutlinedIcon />}
      onClick={handleClick}
      aria-pressed={isMapRoute}
    >
      Map
    </Button>
  );
}

/** The name of the object with its catalog numbers below it, or its catalog numbers only */
function DetailsTitle({ object }: { object: NgcObject }) {
  const subtitle = getSubtitle(object);
  return (
    <span className="DetailsTitle">
      <span className="title">{getTitle(object)}</span>
      {subtitle && <span className="subtitle">{subtitle}</span>}
    </span>
  );
}

/**
 * The details of the object, or its star map in their place (`/:id/map`) with the flips in the footer instead of the
 * navigation; closing the map (also by the back button) returns to the details
 */
export default function Details() {
  const ngcInfo = useOpenedNgcInfo();
  const closeDetails = useCloseDetails();
  const closeMap = useCloseMap();
  const isWideScreen = useIsWideScreen();
  const isDetailsRoute = useIsDetailsRoute();
  const isMapRoute = useIsMapRoute();
  const hasResult = !!useResult();
  const handleClose = isMapRoute ? closeMap : closeDetails;

  // an object not in the result (e.g. a link to an object not visible tonight with the stored filter) is left
  useEffect(() => {
    if (isDetailsRoute && hasResult && !ngcInfo) closeDetails();
  }, [isDetailsRoute, hasResult, ngcInfo, closeDetails]);

  const title = ngcInfo && <DetailsTitle object={ngcInfo.object} />;

  if (isWideScreen) {
    return (
      <Dialog open={!!ngcInfo} onClose={handleClose} maxWidth={false} className="Details">
        <DialogTitleWithClose
          onClose={handleClose}
          actions={
            <>
              {ngcInfo && <MapButton id={ngcInfo.object.id} />}
              <RedLightToggle />
            </>
          }
        >
          {title}
        </DialogTitleWithClose>
        {ngcInfo && isMapRoute ? (
          <StarMap object={ngcInfo.object} />
        ) : (
          <>
            <DialogContent dividers>{ngcInfo && <DetailsContent ngcInfo={ngcInfo} />}</DialogContent>
            <DialogActions>
              <Navigation ngcInfo={ngcInfo} />
            </DialogActions>
          </>
        )}
      </Dialog>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={!!ngcInfo}
      onClose={handleClose}
      className="Details compact"
      slotProps={{ paper: { className: 'DetailsPaper' } }}
      // the page itself does not scroll anyway, and the lock would block the pull to refresh of the browser
      disableScrollLock
    >
      <div className="header">
        <IconButton onClick={handleClose} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {ngcInfo && <MapButton id={ngcInfo.object.id} isCompact />}
        <RedLightToggle />
      </div>
      {ngcInfo && isMapRoute ? (
        <StarMap object={ngcInfo.object} />
      ) : (
        <>
          {ngcInfo && <Carousel ngcInfo={ngcInfo} />}
          <div className="footer">
            <Navigation ngcInfo={ngcInfo} isCompact />
          </div>
        </>
      )}
    </Drawer>
  );
}
