import React from 'react';
export interface ThumbProps {
  vertical?: boolean;
  size?: string;
  move?: number;
  ratio: number;
  always?: boolean;
}

export interface BarProps {
  always?: boolean;
  minSize: number;
}

export type ScrollbarDirection = 'top' | 'bottom' | 'left' | 'right';

export interface ScrollbarProps {
  height?: string | number;
  maxHeight?: string | number;
  native?: boolean;
  wrapStyle?: React.CSSProperties;
  wrapClass?: string;
  viewClass?: string;
  viewStyle?: React.CSSProperties;
  noresize?: boolean;
  tag?: keyof JSX.IntrinsicElements;
  always?: boolean;
  minSize?: number;
  tabindex?: number;
  id?: string;
  role?: string;
  ariaLabel?: string;
  ariaOrientation?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
  onScroll?: (event: { scrollTop: number; scrollLeft: number }) => void;
  onEndReached?: (direction: ScrollbarDirection) => void;
}
