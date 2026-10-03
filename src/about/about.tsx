import { Classes, Dialog, HTMLTable } from '@blueprintjs/core';
import { appVersion, currentVersion } from '../version/version.utils';
import './about.scss';

const REPOSITORY = 'https://github.com/hasyee/astroffers';

export default function About({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog title="About Astroffers" icon="info-sign" isOpen={isOpen} onClose={onClose} className="About">
      <div className={Classes.DIALOG_BODY}>
        <div className="heading">
          <img src="/icons/icon-192x192.png" alt="" />
          <div>
            <h2 className={Classes.HEADING}>Astroffers</h2>
            <p>Take offers to watch at given nights by the NGC 2000 catalog.</p>
          </div>
        </div>
        <HTMLTable compact>
          <tbody>
            <tr>
              <th>Version</th>
              <td>
                {appVersion} ({currentVersion})
              </td>
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
              <td>NGC 2000.0 (R. W. Sinnott, 1988)</td>
            </tr>
            <tr>
              <th>Previews</th>
              <td>
                DSS2 color survey via{' '}
                <a href="https://alasky.cds.unistra.fr/hips-image-services/hips2fits" target="_blank" rel="noreferrer">
                  CDS hips2fits
                </a>
              </td>
            </tr>
          </tbody>
        </HTMLTable>
      </div>
    </Dialog>
  );
}
