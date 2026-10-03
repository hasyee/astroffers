import { useCallback, useState } from 'react';
import { Button } from '@blueprintjs/core';
import About from '../about/about';
import Help from '../help/help';
import './header.scss';

export default function Header({ onOpenFilter }: { onOpenFilter?: () => void }) {
  const [openedDialog, setOpenedDialog] = useState<'help' | 'about' | null>(null);
  const handleOpenHelp = useCallback(() => setOpenedDialog('help'), []);
  const handleOpenAbout = useCallback(() => setOpenedDialog('about'), []);
  const handleClose = useCallback(() => setOpenedDialog(null), []);

  return (
    <div className="Header">
      {onOpenFilter && <Button variant="minimal" size="large" icon="menu" onClick={onOpenFilter} aria-label="Filter" />}
      <img className="logo" src="/icons/logo.png" alt="" />
      <span className="title">Astroffers</span>
      <div className="spacer" />
      <Button variant="minimal" icon="help" onClick={handleOpenHelp} aria-label="Help">
        <span className="label">Help</span>
      </Button>
      <Button variant="minimal" icon="info-sign" onClick={handleOpenAbout} aria-label="About">
        <span className="label">About</span>
      </Button>
      <Help isOpen={openedDialog === 'help'} onClose={handleClose} />
      <About isOpen={openedDialog === 'about'} onClose={handleClose} />
    </div>
  );
}
