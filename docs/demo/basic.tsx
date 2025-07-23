import React from 'react';
import Scrollbar from '../../src';
import '../../assets/style.less';

export default function App() {
  return (
    <div>
      <div className="wrapper">
        <Scrollbar height="400px" always>
          {Array.from({ length: 20 }, (_, index) => (
            <p key={index} className="scrollbar-demo-item">
              {index + 1}
            </p>
          ))}
        </Scrollbar>
      </div>
    </div>
  );
}
