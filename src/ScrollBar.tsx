import React, { useRef, useEffect, useCallback } from 'react';
import { useResizeObserver, useEventListener, useNamespace } from './hooks';
import { addUnit, isNumber, isObject } from './utils';
import Bar, { BarRef } from './bar';
import { ScrollbarContext } from './context';
import type { ScrollbarProps } from './interface';
// 类型定义

export type ScrollbarDirection = 'top' | 'bottom' | 'left' | 'right';

export interface ScrollbarRef {
  wrapRef: React.RefObject<HTMLDivElement>;
  update: () => void;
  scrollTo: {
    (x: number, y?: number): void;
    (options: ScrollToOptions): void;
  };
  setScrollTop: (value: number) => void;
  setScrollLeft: (value: number) => void;
  handleScroll: () => void;
}

const Scrollbar = React.forwardRef<ScrollbarRef, ScrollbarProps>(
  (
    {
      height,
      maxHeight,
      native = false,
      wrapStyle = {},
      wrapClass = '',
      viewClass = '',
      viewStyle = {},
      noresize = false,
      tag: Tag = 'div',
      always = false,
      minSize = 12,
      tabindex,
      id,
      role,
      ariaLabel,
      ariaOrientation,
      children,
      onScroll,
      onEndReached,
    },
    ref,
  ) => {
    const ns = useNamespace('scrollbar');

    // Refs
    const scrollbarRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<BarRef>(null);

    // State
    const wrapScrollTop = useRef(0);
    const wrapScrollLeft = useRef(0);
    const direction = useRef<ScrollbarDirection>('top');

    // Resize observers
    const stopResizeObserver = useRef<(() => void) | undefined>();
    const stopResizeListener = useRef<(() => void) | undefined>();

    // Computed styles
    const computedWrapStyle = React.useMemo<React.CSSProperties>(() => {
      const style: React.CSSProperties = { ...wrapStyle };
      if (height) style.height = addUnit(height);
      if (maxHeight) style.maxHeight = addUnit(maxHeight);
      return style;
    }, [height, maxHeight, wrapStyle]);

    const wrapClassName = React.useMemo(() => {
      return [
        wrapClass,
        ns.e('wrap'),
        !native ? ns.em('wrap', 'hidden-default') : '',
      ]
        .filter(Boolean)
        .join(' ');
    }, [wrapClass, ns, native]);

    const resizeClassName = React.useMemo(() => {
      return [ns.e('view'), viewClass].filter(Boolean).join(' ');
    }, [ns, viewClass]);

    // Calculate arrived states
    const calculateArrivedStates = useCallback(
      (
        wrapElement: HTMLDivElement,
        currentTop: number,
        currentLeft: number,
        prevTop: number,
        prevLeft: number,
      ) => {
        const tolerance = 1; // 添加1px的容差，避免浮点数精度问题

        return {
          bottom:
            currentTop + wrapElement.clientHeight >=
            wrapElement.scrollHeight - tolerance,
          top: currentTop <= tolerance,
          right:
            currentLeft + wrapElement.clientWidth >=
            wrapElement.scrollWidth - tolerance,
          left: currentLeft <= tolerance,
        };
      },
      [],
    );

    // Handle scroll
    const handleScroll = useCallback(() => {
      if (wrapRef.current) {
        barRef.current?.handleScroll(wrapRef.current);

        const prevTop = wrapScrollTop.current;
        const prevLeft = wrapScrollLeft.current;
        wrapScrollTop.current = wrapRef.current.scrollTop;
        wrapScrollLeft.current = wrapRef.current.scrollLeft;

        const arrivedStates = calculateArrivedStates(
          wrapRef.current,
          wrapScrollTop.current,
          wrapScrollLeft.current,
          prevTop,
          prevLeft,
        );

        // 更新方向判断逻辑
        let currentDirection = direction.current;
        if (
          Math.abs(prevTop - wrapScrollTop.current) >
          Math.abs(prevLeft - wrapScrollLeft.current)
        ) {
          currentDirection = wrapScrollTop.current > prevTop ? 'bottom' : 'top';
        } else if (prevLeft !== wrapScrollLeft.current) {
          currentDirection =
            wrapScrollLeft.current > prevLeft ? 'right' : 'left';
        }
        direction.current = currentDirection;

        onScroll?.({
          scrollTop: wrapScrollTop.current,
          scrollLeft: wrapScrollLeft.current,
        });

        // 检查是否到达边界并触发 onEndReached
        if (arrivedStates[currentDirection]) {
          onEndReached?.(currentDirection);
        }
      }
    }, [onScroll, onEndReached, calculateArrivedStates]);

    // ScrollTo overloads
    const scrollTo = useCallback(
      ((arg1: unknown, arg2?: number) => {
        if (!wrapRef.current) {
          console.warn('Scrollbar wrap element is not available');
          return;
        }

        try {
          if (isObject(arg1)) {
            wrapRef.current.scrollTo(arg1 as ScrollToOptions);
          } else if (isNumber(arg1) && isNumber(arg2)) {
            wrapRef.current.scrollTo(arg1, arg2);
          } else {
            console.warn('Invalid arguments for scrollTo');
          }
        } catch (error) {
          console.error('ScrollTo failed:', error);
        }
      }) as ScrollbarRef['scrollTo'],
      [],
    );

    const setScrollTop = useCallback((value: number) => {
      if (!isNumber(value)) {
        console.warn('ElScrollbar: value must be a number');
        return;
      }
      if (wrapRef.current) {
        wrapRef.current.scrollTop = value;
      }
    }, []);

    const setScrollLeft = useCallback((value: number) => {
      if (!isNumber(value)) {
        console.warn('ElScrollbar: value must be a number');
        return;
      }
      if (wrapRef.current) {
        wrapRef.current.scrollLeft = value;
      }
    }, []);

    const update = useCallback(() => {
      barRef.current?.update();
    }, []);

    const dimensions = useResizeObserver(resizeRef, !noresize);
    useEventListener(!noresize ? window : null, 'resize', update);

    // Setup resize observers
    useEffect(() => {
      if (dimensions && !noresize) {
        update();
      }
    }, [dimensions, noresize, update]);

    // Watch height changes
    useEffect(() => {
      if (!native) {
        // Use setTimeout to simulate nextTick
        setTimeout(() => {
          update();
          if (wrapRef.current) {
            barRef.current?.handleScroll(wrapRef.current);
          }
        }, 0);
      }
    }, [maxHeight, height, native, update]);

    // Initial update on mount
    useEffect(() => {
      if (!native) {
        setTimeout(() => {
          update();
        }, 0);
      }
    }, [native, update]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        stopResizeObserver.current?.();
        stopResizeListener.current?.();
      };
    }, []);

    // Context value
    const contextValue = React.useMemo(
      () => ({
        scrollbarElement: scrollbarRef.current,
        wrapElement: wrapRef.current,
      }),
      [scrollbarRef.current, wrapRef.current],
    );

    // Expose methods
    React.useImperativeHandle(
      ref,
      () => ({
        wrapRef,
        update,
        scrollTo,
        setScrollTop,
        setScrollLeft,
        handleScroll,
      }),
      [update, scrollTo, setScrollTop, setScrollLeft, handleScroll],
    );

    return (
      <ScrollbarContext.Provider value={contextValue}>
        <div ref={scrollbarRef} className={ns.b()}>
          <div
            ref={wrapRef}
            className={wrapClassName}
            style={computedWrapStyle}
            tabIndex={tabindex}
            onScroll={handleScroll}
          >
            <div
              id={id}
              ref={resizeRef}
              className={resizeClassName}
              style={viewStyle}
              role={role}
              aria-label={ariaLabel}
              aria-orientation={ariaOrientation}
            >
              {children}
            </div>
          </div>
          {!native && <Bar ref={barRef} always={always} minSize={minSize} />}
        </div>
      </ScrollbarContext.Provider>
    );
  },
);

Scrollbar.displayName = 'Scrollbar';

export default Scrollbar;
