import { useEffect, useRef } from 'react';

/**
 * Closes an overlay (dialog, drawer) with the back button of the browser or the phone, instead of leaving the app:
 * opening it pushes a history entry, closing it from the UI removes that entry.
 */
export const useCloseOnBack = (isOpen: boolean, onClose: () => void) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const key = Math.random().toString(36).slice(2);
    history.pushState({ ...history.state, closeOnBack: key }, '');
    let isClosedByBack = false;
    const handlePopState = () => {
      isClosedByBack = true;
      onCloseRef.current();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!isClosedByBack && history.state?.closeOnBack === key) history.back();
    };
  }, [isOpen]);
};
