import { useEffect, useState, RefObject } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

const useResizeObserver = (
  ref: RefObject<HTMLElement>,
  enabled: boolean = true,
): Dimensions | null => {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, enabled]);

  return dimensions;
};

export default useResizeObserver;
