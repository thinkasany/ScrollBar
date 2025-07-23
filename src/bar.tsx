import React from 'react';
import Thumb from './Thumb';
import { GAP } from './util';
import { ScrollbarContext } from './context';

interface BarProps {
  minSize?: number;
  always?: boolean;
}

export interface BarRef {
  handleScroll: (wrap: HTMLDivElement) => void;
  update: () => void;
}

const Bar = React.forwardRef<BarRef, BarProps>(
  ({ minSize = 12, always = false }, ref) => {
    // 获取 scrollbar 上下文
    const scrollbar = React.useContext(ScrollbarContext);

    // 状态管理（相当于 Vue 的 ref）
    const moveX = React.useRef(0);
    const moveY = React.useRef(0);
    const sizeWidth = React.useRef('');
    const sizeHeight = React.useRef('');
    const ratioY = React.useRef(1);
    const ratioX = React.useRef(1);

    // 强制重渲染的 hook
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    // 防止除零的安全除法
    const safeDiv = (a: number, b: number) => (b === 0 ? 1 : a / b);

    const handleScroll = (wrap: HTMLDivElement) => {
      if (wrap) {
        const offsetHeight = wrap.offsetHeight - GAP;
        const offsetWidth = wrap.offsetWidth - GAP;

        moveY.current =
          offsetHeight === 0
            ? 0
            : ((wrap.scrollTop * 100) / offsetHeight) * ratioY.current;
        moveX.current =
          offsetWidth === 0
            ? 0
            : ((wrap.scrollLeft * 100) / offsetWidth) * ratioX.current;

        forceUpdate(); // 触发重渲染
      }
    };

    const update = () => {
      const wrap = scrollbar?.wrapElement;
      if (!wrap) return;

      const offsetHeight = wrap.offsetHeight - GAP;
      const offsetWidth = wrap.offsetWidth - GAP;

      const originalHeight = safeDiv(offsetHeight ** 2, wrap.scrollHeight);
      const originalWidth = safeDiv(offsetWidth ** 2, wrap.scrollWidth);
      const height = Math.max(originalHeight, minSize);
      const width = Math.max(originalWidth, minSize);

      // 计算比例，防止分母为 0
      const h1 = offsetHeight - originalHeight;
      const h2 = offsetHeight - height;
      const w1 = offsetWidth - originalWidth;
      const w2 = offsetWidth - width;

      ratioY.current = safeDiv(originalHeight, h1) / safeDiv(height, h2);
      ratioX.current = safeDiv(originalWidth, w1) / safeDiv(width, w2);

      sizeHeight.current = height + GAP < offsetHeight ? `${height}px` : '';
      sizeWidth.current = width + GAP < offsetWidth ? `${width}px` : '';

      forceUpdate(); // 触发重渲染
    };

    // 暴露方法给父组件（相当于 Vue 的 defineExpose）
    React.useImperativeHandle(ref, () => ({
      handleScroll,
      update,
    }));

    return (
      <>
        <Thumb
          move={moveX.current}
          ratio={ratioX.current}
          size={sizeWidth.current}
          always={always}
        />
        <Thumb
          move={moveY.current}
          ratio={ratioY.current}
          size={sizeHeight.current}
          vertical
          always={always}
        />
      </>
    );
  },
);

Bar.displayName = 'Bar';

export default Bar;
