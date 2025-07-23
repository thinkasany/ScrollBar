import React from 'react';
export interface ScrollbarContext {
  scrollbarElement: HTMLDivElement | null;
  wrapElement: HTMLDivElement | null;
}

export const ScrollbarContext = React.createContext<ScrollbarContext | null>(
  null,
);
