import React from 'react';
import Scrollbar, { type ScrollbarRef } from '../../src';
import '../../assets/style.less';

export default function App() {
  const [num, setNum] = React.useState(30);
  const [loading, setLoading] = React.useState(false);
  const scrollbarRef = React.useRef<ScrollbarRef>(null);

  const loadMore = React.useCallback(
    (direction) => {
      if (direction === 'bottom' && !loading) {
        console.log('Loading more items...', num); // 调试日志
        setLoading(true);

        // 模拟异步加载
        setTimeout(() => {
          setNum((prev) => prev + 5);
          setLoading(false);
        }, 500); // 增加延时以便观察效果
      }
    },
    [loading, num],
  );

  return (
    <div>
      <div className="wrapper">
        <Scrollbar height="400px" onEndReached={loadMore}>
          {Array.from({ length: num }, (_, index) => (
            <p key={index} className="scrollbar-demo-item">
              {index + 1}
            </p>
          ))}
        </Scrollbar>
      </div>
    </div>
  );
}
