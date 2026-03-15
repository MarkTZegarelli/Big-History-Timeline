/**
 * TimelineHeader.jsx
 * Tick marks and time labels along the top of the timeline.
 * Only ticks within the current viewport are rendered.
 */

import React, { memo } from 'react';
import { generateTicks, SIDE_PAD } from '../utils/timeUtils';

const TimelineHeader = memo(({ timelineWidth, scrollOffset, screenWidth }) => {
  const ticks = generateTicks(timelineWidth, scrollOffset, screenWidth);

  // Show "Today" only when zoomed in (timeline wider than viewport).
  // At zoom=1 the full timeline fits on screen and "Today" among billion-year
  // tick marks looks out of place; the red end marker already marks it clearly.
  const showTodayLabel = timelineWidth > screenWidth;

  return (
    <div
      style={{
        height:   38,
        position: 'relative',
        width:    '100%',
      }}
    >
      {ticks.map((tick) => {
        // Skip "Today" tick entirely when not zoomed in
        if (tick.yearsAgo === 0 && !showTodayLabel) return null;
        return (
          <div
            key={tick.yearsAgo}
            style={{
              position:  'absolute',
              bottom:    0,
              // Convert content coords → viewport coords by subtracting scrollOffset
              left:      tick.position + SIDE_PAD - scrollOffset - 40,
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
        );
      })}
    </div>
  );
});

export default TimelineHeader;
