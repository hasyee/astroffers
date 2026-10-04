import { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useCurrentVersion, useFetchLatestVersion, useReloadToLatestVersion } from './version.hooks';
import { VERSION_CHECK_INTERVAL } from './version.utils';
import './version.scss';

export default function VersionListener() {
  const version = useCurrentVersion();
  const fetchLatestVersion = useFetchLatestVersion();
  const reloadToLatestVersion = useReloadToLatestVersion();
  const [nextVersion, setNextVersion] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (!version) return;
    const checkVersion = async () => {
      const latestVersion = await fetchLatestVersion();
      if (latestVersion && latestVersion !== version) setNextVersion(latestVersion);
    };
    // on start too, not only after the first interval
    checkVersion();
    const interval = setInterval(checkVersion, VERSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [version, fetchLatestVersion]);

  const handleConfirm = useCallback(() => {
    setIsReloading(true);
    reloadToLatestVersion();
  }, [reloadToLatestVersion]);

  const handleClose = useCallback(() => {
    if (!isReloading) setNextVersion(null);
  }, [isReloading]);

  return (
    <Dialog open={!!nextVersion} onClose={handleClose} className="VersionListener">
      <DialogTitle>New version</DialogTitle>
      <DialogContent>
        <p>There is a new version of the app.</p>
        <p>
          Your version: <Chip size="small" label={version} />
        </p>
        <p>
          New version: <Chip size="small" color="primary" label={nextVersion} />
        </p>
        <p>Would you like to reload the page?</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isReloading}>
          Not now
        </Button>
        <Button variant="contained" color="warning" onClick={handleConfirm} loading={isReloading}>
          Reload now
        </Button>
      </DialogActions>
    </Dialog>
  );
}
