/**
 * TimelineHeader.jsx
 * Tick marks and time labels along the top of the timeline.
 * Only ticks within the current viewport are rendered.
 */

import React, { memo } from 'react';
import { generateTicks } from '../utils/timeUtils';

const TimelineHeader = memo(({ timelineWidth, scrollOffset, screenWidth }) => {
  const ticks = generateTicks(timelineWidth, scrollOffset, screenWidth);

  return (
    <div
      style={{
        height:   38,
        position: 'relative',
        width:    timelineWidth,
      }}
    >
      {ticks.map((tick) => (
        <div
          key={tick.yearsAgo}
          style={{
            position:  'absolute',
            bottom:    0,
            left:      tick.position - 40, // centre the 80px label on the tick
            width:     80,
            display:   'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 9, color: '#8888AA', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>
            {tick.label}
          </span>
          <div style={{ width: 1, height: 10, backgroundColor: '#44446A', marginTop: 2 }} />
        </div>
      ))}
    </div>
  );
});

export default TimelineHeader;
