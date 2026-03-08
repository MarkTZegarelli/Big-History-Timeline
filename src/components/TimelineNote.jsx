/**
 * TimelineNote.jsx
 *
 * Single event pin. isAbove=true → label above track, isAbove=false → below.
 *
 * Layout (above):
 *   [label]
 *     │ stem
 *     ● dot   ← sits at the bottom of notesAbove, touching the track
 *
 * Layout (below):
 *     ● dot   ← sits at the top of notesBelow, touching the track
 *     │ stem
 *   [label]
 */

import React, { memo } from 'react';
import { getCategoryColor } from '../data/events';
import { formatYearsAgo }   from '../utils/timeUtils';

const STEM_H      = 60;
const DOT_R       = 5;
const MAJOR_DOT_R = 7;
const LABEL_W     = 120;

const TimelineNote = memo(({ note, position, isAbove, onPress }) => {
  const color = getCategoryColor(note.category);
  const dotR  = note.isMajor ? MAJOR_DOT_R : DOT_R;

  const handleClick = (e) => {
    e.stopPropagation(); // don't bubble to track (would open "add note")
    onPress();
  };

  const dot = (
    <div
      style={{
        width:        dotR * 2,
        height:       dotR * 2,
        borderRadius: dotR,
        backgroundColor: note.isMajor ? color : 'transparent',
        border:       `2px solid ${color}`,
        flexShrink:   0,
      }}
    />
  );

  const stem = (
    <div
      style={{
        width:           1.5,
        height:          STEM_H,
        backgroundColor: color,
        opacity:         0.6,
        flexShrink:      0,
      }}
    />
  );

  const label = (
    <div
      style={{
        backgroundColor: 'rgba(13,13,26,0.88)',
        border:          `1px solid ${color}`,
        borderRadius:    6,
        padding:         '3px 5px',
        maxWidth:        LABEL_W,
        textAlign:       'center',
      }}
    >
      <div
        style={{
          color,
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: '0.2px',
          lineHeight:    1.3,
          // Clamp to 2 lines
          display:       '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow:      'hidden',
        }}
      >
        {note.title}
      </div>
      {note.isMajor && (
        <div style={{ color: '#9999BB', fontSize: 8, marginTop: 1 }}>
          {formatYearsAgo(note.yearsAgo)}
        </div>
      )}
    </div>
  );

  return (
    <button
      onClick={handleClick}
      style={{
        position:       'absolute',
        left:           position - LABEL_W / 2,
        // Above: pin the bottom of the column to the bottom of notesAbove
        // Below: pin the top to the top of notesBelow
        ...(isAbove
          ? { bottom: 0, top: 'auto' }
          : { top: 0,    bottom: 'auto' }),
        width:          LABEL_W,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        background:     'none',
        border:         'none',
        padding:        0,
        cursor:         'pointer',
      }}
      title={note.title}
    >
      {isAbove
        ? <>{label}{stem}{dot}</>
        : <>{dot}{stem}{label}</>
      }
    </button>
  );
});

export default TimelineNote;
