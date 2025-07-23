import useResizeObserver from './useResizeObserver';
import useEventListener from './useEventListener';

const useNamespace = (block: string) => ({
  b: () => `el-${block}`,
  e: (element: string) => `el-${block}__${element}`,
  em: (element: string, modifier: string) =>
    `el-${block}__${element}--${modifier}`,
  is: (name: string) => {
    return name ? `is-${name}` : '';
  },
});

export { useResizeObserver, useEventListener, useNamespace };
