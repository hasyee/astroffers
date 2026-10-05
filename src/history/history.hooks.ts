import { useEffect, useRef } from 'react';

/**
 * Closes an overlay (dialog, drawer) with the back button of the browser or the phone, instead of leaving the app:
 * opening it pushes a history entry, closing it from the UI removes that entry. The entry lists the keys of every
 * open overlay, so the back button closes only the topmost one (e.g. the help opened in the filter drawer).
 */
export const useCloseOnBack = (isOpen: boolean, onClose: () => void) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const key = Math.random().toString(36).slice(2);
    const openKeys: string[] = history.state?.closeOnBack ?? [];
    history.pushState({ ...history.state, closeOnBack: [...openKeys, key] }, '');
    let isClosedByBack = false;
    const handlePopState = () => {
      // an overlay opened over this one was closed
      if (history.state?.closeOnBack?.includes(key)) return;
      isClosedByBack = true;
      onCloseRef.current();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!isClosedByBack && history.state?.closeOnBack?.at(-1) === key) history.back();
    };
  }, [isOpen]);
};
