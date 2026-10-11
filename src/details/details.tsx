import { useCallback, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import type { NgcInfo, NgcObject } from '../calculator/calculator.types';
import { getSubtitle, getTitle } from '../catalog/catalog.utils';
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

/**
 * Switches between the details and the star map in their place (`/:id/map`), named and drawn as the other one; an icon
 * only in the header of the compact drawer
 */
function ViewSwitch({ id, isCompact = false }: { id: string; isCompact?: boolean }) {
  const isMapRoute = useIsMapRoute();
  const openMap = useOpenMap();
  const closeMap = useCloseMap();
  const handleClick = () => (isMapRoute ? closeMap() : openMap(id));
  const label = isMapRoute ? 'Details' : 'Map';
  const icon = isMapRoute ? <InfoOutlinedIcon /> : <MapOutlinedIcon />;

  return isCompact ? (
    <IconButton onClick={handleClick} aria-label={label} title={label}>
      {icon}
    </IconButton>
  ) : (
    <Button color="inherit" startIcon={icon} onClick={handleClick}>
      {label}
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
 * The details of the object in a drawer from the right, over the list (full-screen on a phone), or its star map in
 * their place (`/:id/map`) with its toolbar in the footer instead of the navigation; closing (the close button, a click
 * beside, Escape) closes the map too, the Details button and the back button return from it to the details
 */
export default function Details() {
  const ngcInfo = useOpenedNgcInfo();
  const closeDetails = useCloseDetails();
  const isCompact = !useIsWideScreen();
  const isDetailsRoute = useIsDetailsRoute();
  const isMapRoute = useIsMapRoute();
  const hasResult = !!useResult();

  // an object not in the result (e.g. a link to an object not visible tonight with the stored filter) is left
  useEffect(() => {
    if (isDetailsRoute && hasResult && !ngcInfo) closeDetails();
  }, [isDetailsRoute, hasResult, ngcInfo, closeDetails]);

  return (
    <Drawer
      anchor="right"
      open={!!ngcInfo}
      onClose={closeDetails}
      className={classnames('Details', { compact: isCompact })}
      slotProps={{ paper: { className: 'DetailsPaper' } }}
      // the page itself does not scroll anyway, and the lock would block the pull to refresh of the browser
      disableScrollLock
    >
      <div className="header">
        <Typography variant="h6" component="h2">
          {ngcInfo && <DetailsTitle object={ngcInfo.object} />}
        </Typography>
        {ngcInfo && <ViewSwitch id={ngcInfo.object.id} isCompact={isCompact} />}
        <RedLightToggle />
        {/* on the right, towards the edge the drawer slides back to */}
        <IconButton onClick={closeDetails} aria-label="Close" edge="end">
          <CloseIcon />
        </IconButton>
      </div>
      {ngcInfo && isMapRoute ? (
        <StarMap ngcInfo={ngcInfo} />
      ) : (
        <>
          {ngcInfo &&
            (isCompact ? (
              <Carousel ngcInfo={ngcInfo} />
            ) : (
              <div className="content">
                <DetailsContent ngcInfo={ngcInfo} />
              </div>
            ))}
          <div className="footer">
            <Navigation ngcInfo={ngcInfo} isCompact={isCompact} />
          </div>
        </>
      )}
    </Drawer>
  );
}
