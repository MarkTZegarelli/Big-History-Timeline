/**
 * ZoomControls.jsx
 * +/− buttons and a reset button for zoom. Doubles as the zoom level display.
 */

import React, { memo } from 'react';
import { MIN_ZOOM, MAX_ZOOM } from '../utils/timeUtils';

const ZOOM_STEP = 3;

function formatZoom(zoom) {
  if (zoom >= 1_000_000) return `${(zoom / 1_000_000).toFixed(1)}M×`;
  if (zoom >= 1_000)     return `${(zoom / 1_000).toFixed(1)}K×`;
  if (zoom >= 10)        return `${zoom.toFixed(0)}×`;
  return `${zoom.toFixed(1)}×`;
}

const ZoomControls = memo(({ zoom, onZoomChange }) => {
  const canOut = zoom > MIN_ZOOM;
  const canIn  = zoom < MAX_ZOOM;

  return (
    <div style={styles.container}>
      {/* Reset */}
      <button
        style={{ ...styles.btn, opacity: canOut ? 1 : 0.35 }}
        onClick={() => onZoomChange(MIN_ZOOM)}
        disabled={!canOut}
        title="Reset zoom"
      >
        ⌂
      </button>

      {/* Zoom out */}
      <button
        style={{ ...styles.btn, opacity: canOut ? 1 : 0.35 }}
        onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom / ZOOM_STEP))}
        disabled={!canOut}
        title="Zoom out"
      >
        −
      </button>

      {/* Zoom level */}
      <div style={styles.label}>
        <span style={styles.zoomText}>{formatZoom(zoom)}</span>
        <span style={styles.hint}>Ctrl+scroll</span>
      </div>

      {/* Zoom in */}
      <button
        style={{ ...styles.btn, opacity: canIn ? 1 : 0.35 }}
        onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom * ZOOM_STEP))}
        disabled={!canIn}
        title="Zoom in"
      >
        +
      </button>
    </div>
  );
});

export default ZoomControls;

const styles = {
  container: {
    display:         'flex',
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(13,13,26,0.92)',
    borderRadius:    20,
    padding:         '4px 8px',
    border:          '1px solid #2A2A4A',
    gap:             4,
    userSelect:      'none',
  },
  btn: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: '#1E1E3A',
    border:          '1px solid #3A3A5A',
    color:           '#CCCCEE',
    fontSize:        18,
    fontWeight:      600,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    cursor:          'pointer',
    lineHeight:      1,
    padding:         0,
    flexShrink:      0,
  },
  label: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    minWidth:       64,
    margin:         '0 4px',
  },
  zoomText: {
    color:         '#AAAACC',
    fontSize:      13,
    fontWeight:    700,
    letterSpacing: '0.5px',
  },
  hint: {
    color:    '#55556A',
    fontSize: 8,
    marginTop: 1,
  },
};
