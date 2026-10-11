import type { ReactNode } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import './dialog.scss';

/** Title of a dialog with a close button on its right */
export default function DialogTitleWithClose({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <DialogTitle className="DialogTitleWithClose">
      <span className="text">{children}</span>
      <IconButton onClick={onClose} aria-label="Close" edge="end">
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}
