import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
  CSSProperties,
} from 'react';
import { useEventListener, useNamespace } from './hooks';
import { isClient } from './utils';
import { ScrollbarContext } from './context';
import { BAR_MAP, renderThumbStyle } from './util';

// 类型定义
interface ThumbProps {
  vertical?: boolean;
  size?: string;
  move?: number;
  ratio?: number;
  always?: boolean;
}

export interface ThumbRef {
  // 可以暴露需要的方法
}

const COMPONENT_NAME = 'Thumb';

const Thumb = forwardRef<ThumbRef, ThumbProps>(
  (
    { vertical = false, size = '', move = 0, ratio = 1, always = false },
    ref,
  ) => {
    const scrollbar = React.useContext(ScrollbarContext);
    const ns = useNamespace('scrollbar');

    if (!scrollbar) {
      throw new Error(`${COMPONENT_NAME}: can not inject scrollbar context`);
    }

    // Refs
    const instanceRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);

    // State
    const [thumbState, setThumbState] = useState<
      Partial<Record<'X' | 'Y', number>>
    >({});
    const [visible, setVisible] = useState(false);

    // Variables
    const cursorDown = useRef(false);
    const cursorLeave = useRef(false);
    const baseScrollHeight = useRef(0);
    const baseScrollWidth = useRef(0);
    const originalOnSelectStart = useRef<
      ((this: GlobalEventHandlers, ev: Event) => any) | null
    >(isClient() ? document.onselectstart : null);

    // Computed values
    const bar = useMemo(
      () => BAR_MAP[vertical ? 'vertical' : 'horizontal'],
      [vertical],
    );

    const thumbStyle = useMemo<CSSProperties>(
      () =>
        renderThumbStyle({
          size,
          move,
          bar,
        }),
      [size, move, bar],
    );

    const offsetRatio = useMemo(() => {
      if (!instanceRef.current || !thumbRef.current || !scrollbar.wrapElement) {
        return 1;
      }

      const instanceOffset = instanceRef.current[
        bar.offset as keyof HTMLElement
      ] as number;
      const wrapScrollSize = scrollbar.wrapElement[
        bar.scrollSize as keyof HTMLElement
      ] as number;
      const thumbOffset = thumbRef.current[
        bar.offset as keyof HTMLElement
      ] as number;

      if (
        instanceOffset === 0 ||
        wrapScrollSize === 0 ||
        thumbOffset === 0 ||
        ratio === 0
      ) {
        return 1;
      }

      return instanceOffset ** 2 / wrapScrollSize / ratio / thumbOffset;
    }, [bar, ratio, scrollbar.wrapElement]);

    // Event handlers
    const restoreOnselectstart = useCallback(() => {
      if (document.onselectstart !== originalOnSelectStart.current) {
        document.onselectstart = originalOnSelectStart.current;
      }
    }, []);

    const mouseUpDocumentHandler = useCallback(() => {
      cursorDown.current = false;
      document.removeEventListener('mousemove', mouseMoveDocumentHandler);
      document.removeEventListener('mouseup', mouseUpDocumentHandler);
      restoreOnselectstart();
      if (cursorLeave.current) {
        setVisible(false);
      }
    }, [bar.axis, restoreOnselectstart]);

    const mouseMoveDocumentHandler = useCallback(
      (e: MouseEvent) => {
        if (!instanceRef.current || !thumbRef.current || !scrollbar.wrapElement)
          return;
        if (cursorDown.current === false) return;

        const prevPage = thumbState[bar.axis];
        if (!prevPage) return;

        const offset =
          (((instanceRef.current.getBoundingClientRect()[
            bar.direction as keyof DOMRect
          ] as number) - e[bar.client as keyof MouseEvent]) as number) * -1;
        const thumbClickPosition =
          (thumbRef.current[bar.offset as keyof HTMLElement] as number) -
          prevPage;
        const thumbPositionPercentage =
          ((offset - thumbClickPosition) * 100 * offsetRatio) /
          (instanceRef.current[bar.offset as keyof HTMLElement] as number);

        if (bar.scroll === 'scrollLeft') {
          scrollbar.wrapElement[bar.scroll] =
            (thumbPositionPercentage * baseScrollWidth.current) / 100;
        } else {
          scrollbar.wrapElement[bar.scroll as 'scrollTop'] =
            (thumbPositionPercentage * baseScrollHeight.current) / 100;
        }
      },
      [thumbState, bar, offsetRatio, scrollbar.wrapElement],
    );

    const startDrag = useCallback(
      (e: MouseEvent) => {
        if (!scrollbar.wrapElement) return;

        e.stopImmediatePropagation();
        cursorDown.current = true;
        baseScrollHeight.current = scrollbar.wrapElement.scrollHeight;
        baseScrollWidth.current = scrollbar.wrapElement.scrollWidth;
        document.addEventListener('mousemove', mouseMoveDocumentHandler);
        document.addEventListener('mouseup', mouseUpDocumentHandler);
        originalOnSelectStart.current = document.onselectstart;
        document.onselectstart = () => false;
      },
      [scrollbar.wrapElement, mouseMoveDocumentHandler, mouseUpDocumentHandler],
    );

    const clickThumbHandler = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        // prevent click event of middle and right button
        e.stopPropagation();
        if (e.ctrlKey || [1, 2].includes(e.button)) return;

        window.getSelection()?.removeAllRanges();
        startDrag(e.nativeEvent);

        const el = e.currentTarget;
        if (!el) return;

        const newState = {
          ...thumbState,
          [bar.axis]:
            (el[bar.offset as keyof HTMLElement] as number) -
            (((e.nativeEvent[bar.client as keyof MouseEvent] as number) -
              el.getBoundingClientRect()[
                bar.direction as keyof DOMRect
              ]) as number),
        };
        setThumbState(newState);
      },
      [startDrag, thumbState, bar],
    );

    const clickTrackHandler = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!thumbRef.current || !instanceRef.current || !scrollbar.wrapElement)
          return;

        const target = e.target as HTMLElement;
        const offset = Math.abs(
          ((target.getBoundingClientRect()[
            bar.direction as keyof DOMRect
          ] as number) -
            e.nativeEvent[bar.client as keyof MouseEvent]) as number,
        );
        const thumbHalf =
          (thumbRef.current[bar.offset as keyof HTMLElement] as number) / 2;
        const thumbPositionPercentage =
          ((offset - thumbHalf) * 100 * offsetRatio) /
          (instanceRef.current[bar.offset as keyof HTMLElement] as number);

        scrollbar.wrapElement[bar.scroll as 'scrollTop' | 'scrollLeft'] =
          (thumbPositionPercentage *
            (scrollbar.wrapElement[
              bar.scrollSize as keyof HTMLElement
            ] as number)) /
          100;
      },
      [bar, offsetRatio, scrollbar.wrapElement],
    );

    const mouseMoveScrollbarHandler = useCallback(() => {
      cursorLeave.current = false;
      setVisible(!!size);
    }, [size]);

    const mouseLeaveScrollbarHandler = useCallback(() => {
      cursorLeave.current = true;
      setVisible(cursorDown.current);
    }, []);

    // Event listeners
    useEventListener(
      scrollbar.scrollbarElement,
      'mousemove',
      mouseMoveScrollbarHandler,
    );

    useEventListener(
      scrollbar.scrollbarElement,
      'mouseleave',
      mouseLeaveScrollbarHandler,
    );

    // Cleanup
    useEffect(() => {
      return () => {
        restoreOnselectstart();
        document.removeEventListener('mouseup', mouseUpDocumentHandler);
      };
    }, [restoreOnselectstart, mouseUpDocumentHandler]);

    // Expose methods
    useImperativeHandle(ref, () => ({}), []);

    // CSS classes
    const barClassName = `${ns.e('bar')} ${ns.is(bar.key)}`;
    const thumbClassName = ns.e('thumb');

    return (
      <div
        ref={instanceRef}
        className={barClassName}
        style={{
          opacity: always || visible ? 1 : 0,
          transition: 'opacity 120ms ease-out',
          display: always || visible ? 'block' : 'none',
        }}
        onMouseDown={clickTrackHandler}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={thumbRef}
          className={thumbClassName}
          style={thumbStyle}
          onMouseDown={clickThumbHandler}
        />
      </div>
    );
  },
);

Thumb.displayName = 'Thumb';

export default Thumb;
