import { useEffect } from 'react';

const useEventListener = (
  target: Window | HTMLElement | null,
  event: string,
  handler: () => void,
): (() => void) => {
  useEffect(() => {
    if (!target) return;

    target.addEventListener(event, handler);
    return () => {
      target.removeEventListener(event, handler);
    };
  }, [target, event, handler]);

  return () => {
    if (!target) return;
    target.removeEventListener(event, handler);
  };
};

export default useEventListener;
