import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';

export const useDebounce = <T>(
  initialValue: T,
  callback: (value: T) => void,
  timeout = 500
): [T, (nextValue: T, triggered?: boolean) => void] => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [value, setValue] = useState(initialValue);

  const trigger = useCallback(
    (nextValue: T, triggered = true) => {
      setValue(nextValue);
      if (!triggered) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        callback(nextValue);
      }, timeout);
    },
    [timer, timeout, callback]
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [timer]
  );

  useLayoutEffect(() => setValue(initialValue), [initialValue]);

  return [value, trigger];
};
