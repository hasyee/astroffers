import { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogTitleWithClose from '../dialog/dialog.title';
import { useFetchLatestVersion, useReloadToLatestVersion } from '../version/version.hooks';
import { currentVersion } from '../version/version.utils';
import './about.scss';

const REPOSITORY = 'https://github.com/hasyee/astroffers';

/**
 * An Update button when a newer version is deployed, in case the service worker does not update the app by itself.
 * Checked whenever the dialog opens (it is mounted only while open).
 */
function UpdateRow() {
  const fetchLatestVersion = useFetchLatestVersion();
  const reloadToLatestVersion = useReloadToLatestVersion();
  const [latestVersion, setLatestVersion] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isActive = true;
    fetchLatestVersion().then(version => {
      if (isActive) setLatestVersion(version);
    });
    return () => {
      isActive = false;
    };
  }, [fetchLatestVersion]);

  const handleUpdate = useCallback(() => {
    setIsUpdating(true);
    reloadToLatestVersion();
  }, [reloadToLatestVersion]);

  if (!latestVersion || latestVersion === currentVersion) return null;

  return (
    <tr className="update">
      <td colSpan={2}>
        <div className="content">
          <Button variant="contained" size="small" onClick={handleUpdate} loading={isUpdating}>
            Update
          </Button>
          <span className="hint">Version {latestVersion} is available</span>
        </div>
      </td>
    </tr>
  );
}

export default function About({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="About">
      <DialogTitleWithClose onClose={onClose}>About Astroffers</DialogTitleWithClose>
      <DialogContent>
        <div className="heading">
          <img src="/icons/icon-192x192.png" alt="" />
          <div>
            <Typography variant="h5">Astroffers</Typography>
            <Typography color="text.secondary">
              Take offers to watch at given nights by the NGC 2000 and the Messier catalogs, and from the Solar System.
            </Typography>
          </div>
        </div>
        <table>
          <tbody>
            <UpdateRow />
            <tr>
              <th>Version</th>
              <td>{currentVersion}</td>
            </tr>
            <tr>
              <th>Author</th>
              <td>Péter Hauszknecht</td>
            </tr>
            <tr>
              <th>License</th>
              <td>MIT</td>
            </tr>
            <tr>
              <th>Source</th>
              <td>
                <a href={REPOSITORY} target="_blank" rel="noreferrer">
                  {REPOSITORY}
                </a>
              </td>
            </tr>
            <tr>
              <th>Feedback</th>
              <td>
                <a href={`${REPOSITORY}/issues`} target="_blank" rel="noreferrer">
                  {REPOSITORY}/issues
                </a>
              </td>
            </tr>
            <tr>
              <th>Catalog</th>
              <td>
                NGC 2000.0 (R. W. Sinnott, 1988); the Messier objects without an NGC number from{' '}
                <a href="http://www.messier.seds.org" target="_blank" rel="noreferrer">
                  SEDS
                </a>
              </td>
            </tr>
            <tr>
              <th>Previews</th>
              <td>
                The Second Digitized Sky Survey (DSS2), produced at the Space Telescope Science Institute under U.S.
                Government grant NAG W-2166, rendered by{' '}
                <a href="https://alasky.cds.unistra.fr/hips-image-services/hips2fits" target="_blank" rel="noreferrer">
                  CDS hips2fits
                </a>
                ; photos of the Solar System from NASA, ESA, ESO and others via{' '}
                <a href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">
                  Wikimedia Commons
                </a>
                , credited on each
              </td>
            </tr>
            <tr>
              <th>Solar System</th>
              <td>
                Planets and Pluto by{' '}
                <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noreferrer">
                  Astronomy Engine
                </a>
                ; orbits of the other dwarf planets and the asteroids from the{' '}
                <a href="https://ssd.jpl.nasa.gov/tools/sbdb_query.html" target="_blank" rel="noreferrer">
                  JPL Small-Body Database
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
}
