import { createStateContext } from '../provider/state.hooks';

export type SidebarDialog = 'help' | 'about';

/**
 * The dialog opened from the footer of the sidebar. Above the layouts (`App`), as the sidebar is remounted when the
 * layout changes (panel ↔ drawer, e.g. by rotating a phone), which would close the dialog.
 */
export const SidebarDialogContext = createStateContext<SidebarDialog | null>(null);
