import { type ReactNode, useCallback } from 'react';
import About from '../about/about';
import Help from '../help/help';
import { useCloseOnBack } from '../history/history.hooks';
import { useStateSetter, useStateValue } from '../provider/state.hooks';
import StateProvider from '../provider/state.provider';
import { SidebarDialogContext } from './sidebar.hooks';

function SidebarDialogs() {
  const dialog = useStateValue(SidebarDialogContext);
  const setDialog = useStateSetter(SidebarDialogContext);
  const handleClose = useCallback(() => setDialog(null), [setDialog]);
  useCloseOnBack(!!dialog, handleClose);

  return (
    <>
      <Help isOpen={dialog === 'help'} onClose={handleClose} />
      <About isOpen={dialog === 'about'} onClose={handleClose} />
    </>
  );
}

/** Keeps and shows the dialogs of the sidebar (see `SidebarDialogContext`) */
export default function SidebarDialogProvider({ children }: { children: ReactNode }) {
  return (
    <StateProvider context={SidebarDialogContext}>
      {children}
      <SidebarDialogs />
    </StateProvider>
  );
}
