import React from 'react';
import Scrollbar from '../../src';

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100px',
  height: '50px',
  margin: '10px',
  textAlign: 'center',
  borderRadius: '4px',
  background: 'rgb(235.9, 245.3, 255)',
  color: '#409eff',
};
export default function App() {
  return (
    <div>
      <div className="wrapper">
        <Scrollbar>
          <div
            style={{
              display: 'flex',
              width: 'fit-content',
            }}
          >
            {Array.from({ length: 20 }, (_, index) => (
              <p key={index} style={itemStyle}>
                {index + 1}
              </p>
            ))}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
