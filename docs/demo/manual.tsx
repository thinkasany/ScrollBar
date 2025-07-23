import React from 'react';
import Scrollbar, { type ScrollbarRef } from '../../src';
import '../../assets/style.less';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

export default function App() {
  const scrollbarRef = React.useRef<ScrollbarRef>(null);

  return (
    <div>
      <div className="wrapper">
        <Scrollbar ref={scrollbarRef} height="400px" always>
          {Array.from({ length: 20 }, (_, index) => (
            <p key={index} className="scrollbar-demo-item">
              {index + 1}
            </p>
          ))}
        </Scrollbar>

        <Slider
          max={20 * 60} // items height and margin
          onChange={(e) => {
            if (scrollbarRef.current) {
              scrollbarRef.current.setScrollTop(e as number);
            }
          }}
        />
      </div>
    </div>
  );
}
