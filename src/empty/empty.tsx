import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import './empty.scss';

/** Placeholder of a missing content: an icon, a title and an optional description */
export default function EmptyState({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="EmptyState">
      <div className="icon">{icon}</div>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </div>
  );
}
