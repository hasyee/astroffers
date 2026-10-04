import { useContext, type AnchorHTMLAttributes, type MouseEvent, type PropsWithChildren } from 'react';
import { RouteContext, useNavigate } from './router.hooks';
import { joinPath } from './router.utils';

type LinkProps = PropsWithChildren<{ to: string }> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>;

/** Anchor navigating in the app, while a modified click (e.g. Ctrl / Cmd) still opens a new tab (from tinc) */
export default function Link({ to, children, ...rest }: LinkProps) {
  const match = useContext(RouteContext);
  const navigate = useNavigate();
  const href = to.startsWith('/') ? to : joinPath(match ? match.matchedPrefix : '', to);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
