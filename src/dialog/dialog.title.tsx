import type { ReactNode } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import './dialog.scss';

/** Title of a dialog with a close button on its right, and its actions (e.g. buttons) before that */
export default function DialogTitleWithClose({
  children,
  actions,
  onClose
}: {
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}) {
  return (
    <DialogTitle className="DialogTitleWithClose">
      <span className="text">{children}</span>
      {actions}
      <IconButton onClick={onClose} aria-label="Close" edge="end">
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}
