/**
 * Timeline.jsx
 *
 * Horizontal scrollable timeline with zoom support.
 *
 * Zoom:   Wheel (desktop, right-anchored) or pinch gesture (touch)
 * Scroll: native horizontal scroll (trackpad / scrollbar / drag)
 * Add:    click anywhere on the track to create a note
 */

import React, { useRef, useState, useCallback, useMemo, useEffect, useLayoutEffect } from 'react';
import TimelineNote   from './TimelineNote';
import TimelineHeader from './TimelineHeader';
import ZoomControls   from './ZoomControls';
import {
  TOTAL_YEARS,
  MIN_ZOOM,
  MAX_ZOOM,
  SIDE_PAD,
  yearToPosition,
  positionToYears,
} from '../utils/timeUtils';

const HEADER_H     = 38;
const NOTE_ABOVE_H = 140;
const NOTE_BELOW_H = 140;
const TRACK_H      = 4;

const ERA_BANDS = [
  { label: 'Cosmic',     startYears: 13_800_000_000, endYears: 4_600_000_000, color: '#1A1033' },
  { label: 'Geological', startYears:  4_600_000_000, endYears:   541_000_000, color: '#1A2A1A' },
  { label: 'Biological', startYears:    541_000_000, endYears:     2_800_000, color: '#1A2A18' },
  { label: 'Human',      startYears:      2_800_000, endYears:             0, color: '#1A1A28' },
];

// Browsers cap DOM element size at ~15-33 M px depending on engine.
// Keep a conservative limit so timelineWidth never exceeds it.
const DOM_PX_LIMIT = 14_000_000; // px — safe for Chrome, Firefox, Safari

function clampZoom(z, maxZ = MAX_ZOOM) {
  return Math.max(MIN_ZOOM, Math.min(maxZ, z));
}

/** Largest zoom that keeps timelineWidth within DOM_PX_LIMIT for a given base. */
function safeMaxZoom(base) {
  return Math.floor(DOM_PX_LIMIT / Math.max(1, base));
}

export default function Timeline({ notes, onNotePress, onTimelinePress, autoZoom }) {
  const [zoom, setZoom]               = useState(MIN_ZOOM);
  const [scrollOffset, setScrollOffset] = useState(0);

  const zoomRef        = useRef(MIN_ZOOM);
  const scrollRef      = useRef(0);
  const containerRef   = useRef(null);
  const screenWidthRef = useRef(window.innerWidth);
  const pinchRef       = useRef(null);
  const isPinching     = useRef(false);

  // Keep screenWidth in sync with window size
  useEffect(() => {
    const handleResize = () => { screenWidthRef.current = window.innerWidth; };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to apply after the next DOM commit (used by button zoom).
  const pendingScrollRef = useRef(null);

  // useLayoutEffect fires synchronously after React commits the new content
  // width — before the browser paints — so scrollLeft is never clamped to
  // the old (smaller) maximum the way it would be with requestAnimationFrame.
  useLayoutEffect(() => {
    if (pendingScrollRef.current !== null && containerRef.current) {
      containerRef.current.scrollLeft = pendingScrollRef.current;
      pendingScrollRef.current = null;
    }
  });

  const updateZoom = useCallback((newZoom) => {
    const base = Math.max(1, screenWidthRef.current - 2 * SIDE_PAD);
    const z    = clampZoom(newZoom, safeMaxZoom(base));
    // Pin "Today" (right end) to the right edge of the viewport
    pendingScrollRef.current = Math.max(0, base * z + 2 * SIDE_PAD - screenWidthRef.current);
    zoomRef.current = z;
    setZoom(z);
  }, []);

  // When the parent requests a specific zoom (e.g. from a filter selection), apply it.
  useEffect(() => {
    if (autoZoom != null) updateZoom(autoZoom);
  }, [autoZoom, updateZoom]);

  // At zoom=1 the full content (timeline + 2×SIDE_PAD) fits exactly in the viewport.
  const timelineWidth = Math.max(1, screenWidthRef.current - 2 * SIDE_PAD) * zoom;

  // ── Era bands ─────────────────────────────────────────────────────────────

  const eraBands = useMemo(() => {
    return ERA_BANDS.map((band) => ({
      ...band,
      left:  yearToPosition(band.startYears, timelineWidth) + SIDE_PAD,
      width: yearToPosition(band.endYears,   timelineWidth) - yearToPosition(band.startYears, timelineWidth),
    }));
  }, [timelineWidth]);

  // ── Wheel zoom (non-passive so we can preventDefault) ────────────────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      // Let trackpad horizontal swipes scroll the timeline naturally.
      // Only intercept primarily-vertical wheel motion for zoom.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      e.preventDefault();

      const FACTOR  = e.deltaY > 0 ? 1 / 1.25 : 1.25;
      const base    = Math.max(1, screenWidthRef.current - 2 * SIDE_PAD);
      const newZoom = clampZoom(zoomRef.current * FACTOR, safeMaxZoom(base));

      // Right-anchored: keep Today at the right edge of the viewport
      pendingScrollRef.current = Math.max(0, base * newZoom + 2 * SIDE_PAD - screenWidthRef.current);
      zoomRef.current = newZoom;
      setZoom(newZoom);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ── Touch handling (non-passive so preventDefault works) ────────────────
  // Registered via addEventListener so we can pass { passive: false }.
  // React synthetic touch props are passive and cannot call preventDefault,
  // which would let the browser hijack pinch-zoom and vertical scroll.

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Track single-touch start position to detect vertical drags
    let t1StartX = 0, t1StartY = 0, t1Locked = null; // null | 'h' | 'v'

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        t1StartX = e.touches[0].clientX;
        t1StartY = e.touches[0].clientY;
        t1Locked = null;
      }
      if (e.touches.length === 2) {
        e.preventDefault(); // block browser pinch-zoom from the first frame
        isPinching.current = true;
        const a = e.touches[0], b = e.touches[1];
        pinchRef.current = {
          initialDist:    Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
          initialZoom:    zoomRef.current,
          midX:           (a.clientX + b.clientX) / 2 - el.getBoundingClientRect().left,
          initialScrollX: el.scrollLeft,
        };
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1 && t1Locked === null) {
        const dx = Math.abs(e.touches[0].clientX - t1StartX);
        const dy = Math.abs(e.touches[0].clientY - t1StartY);
        if (dx > 4 || dy > 4) t1Locked = dx >= dy ? 'h' : 'v';
      }
      // Block vertical single-finger scroll bubbling up to the page
      if (e.touches.length === 1 && t1Locked === 'v') {
        e.preventDefault();
        return;
      }
      // Block all browser handling of multi-touch (pinch-zoom, page scroll)
      if (e.touches.length >= 2) {
        e.preventDefault();
      }
      if (!isPinching.current || !pinchRef.current || e.touches.length < 2) return;

      const a = e.touches[0], b = e.touches[1];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const { initialDist, initialZoom, midX, initialScrollX } = pinchRef.current;
      const base       = Math.max(1, screenWidthRef.current - 2 * SIDE_PAD);
      const newZoom    = clampZoom(initialZoom * (dist / initialDist), safeMaxZoom(base));
      const fixedFrac  = (initialScrollX + midX) / (base * initialZoom);
      const newScrollX = Math.max(0, fixedFrac * (base * newZoom) - midX);
      zoomRef.current  = newZoom;
      setZoom(newZoom);
      requestAnimationFrame(() => {
        if (containerRef.current) containerRef.current.scrollLeft = newScrollX;
      });
    };

    const onTouchEnd = () => {
      isPinching.current = false;
      pinchRef.current   = null;
      t1Locked           = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  // ── Scroll tracking for header ticks ─────────────────────────────────────

  const handleScroll = useCallback((e) => {
    scrollRef.current = e.currentTarget.scrollLeft;
    setScrollOffset(e.currentTarget.scrollLeft);
  }, []);

  // ── Click on track to add a note ─────────────────────────────────────────

  const handleTrackClick = useCallback((e) => {
    if (isPinching.current) return;
    const rect    = containerRef.current.getBoundingClientRect();
    const absX     = containerRef.current.scrollLeft + (e.clientX - rect.left) - SIDE_PAD;
    const tw       = Math.max(1, screenWidthRef.current - 2 * SIDE_PAD) * zoomRef.current;
    const yearsAgo = positionToYears(absX, tw);
    onTimelinePress(Math.max(0, Math.min(TOTAL_YEARS, yearsAgo)));
  }, [onTimelinePress]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.wrapper}>

      {/* Tick-mark header — fixed above the scroll area, doesn't move horizontally */}
      <div style={styles.header}>
        <TimelineHeader
          timelineWidth={timelineWidth}
          scrollOffset={scrollOffset}
          screenWidth={screenWidthRef.current}
        />
      </div>

      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="timeline-scroll"
        style={styles.scrollContainer}
        onScroll={handleScroll}
      >
        {/* Full-width content */}
        <div style={{ ...styles.content, width: timelineWidth + 2 * SIDE_PAD }}>

          {/* Era colour bands behind the track */}
          <div style={styles.eraBandRow}>
            {eraBands.map((b) => (
              <div
                key={b.label}
                style={{
                  position: 'absolute',
                  left: b.left,
                  width: Math.abs(b.width),
                  top: 0,
                  bottom: 0,
                  backgroundColor: b.color,
                  opacity: 0.5,
                }}
              />
            ))}
          </div>

          {/* Notes above + track + notes below */}
          <div style={styles.trackAndNotesArea} onClick={handleTrackClick}>

            {/* Notes above */}
            <div style={styles.notesAbove}>
              {notes
                .filter((_, i) => i % 2 === 0)
                .map((note) => (
                  <TimelineNote
                    key={note.id}
                    note={note}
                    position={yearToPosition(note.yearsAgo, timelineWidth) + SIDE_PAD}
                    isAbove
                    onPress={() => { onNotePress(note); }}
                  />
                ))}
            </div>

            {/* Timeline track */}
            <div style={styles.track}>
              <div style={{ ...styles.trackLine, left: SIDE_PAD, right: SIDE_PAD }} />
              <div style={{ ...styles.endMarker, right: SIDE_PAD, backgroundColor: '#FF4444' }} title="Today" />
              <div style={{ ...styles.endMarker, left: SIDE_PAD,  backgroundColor: '#7B68EE' }} title="Big Bang" />
            </div>

            {/* Notes below */}
            <div style={styles.notesBelow}>
              {notes
                .filter((_, i) => i % 2 === 1)
                .map((note) => (
                  <TimelineNote
                    key={note.id}
                    note={note}
                    position={yearToPosition(note.yearsAgo, timelineWidth) + SIDE_PAD}
                    isAbove={false}
                    onPress={() => { onNotePress(note); }}
                  />
                ))}
            </div>
          </div>

          {/* Era label strip */}
          <div style={styles.eraLabelRow}>
            {eraBands.map((b) => (
              Math.abs(b.width) > 60 && (
                <div
                  key={b.label}
                  style={{
                    position: 'absolute',
                    left: b.left,  // already includes SIDE_PAD offset from eraBands memo
                    width: Math.abs(b.width),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={styles.eraLabel}>{b.label}</span>
                </div>
              )
            ))}
          </div>

          {/* Tap hint */}
          {zoom <= 1.2 && (
            <div style={styles.tapHint} aria-hidden>
              Scroll to zoom · pinch to zoom · Click track to add note
            </div>
          )}
        </div>
      </div>

      {/* Zoom controls overlay */}
      <div style={styles.zoomOverlay}>
        <ZoomControls zoom={zoom} onZoomChange={updateZoom} />
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    flex: 1,
    minHeight: 0,          // don't let content push the flex item taller
    position: 'relative',
    backgroundColor: '#0D0D1A',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: HEADER_H,
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0D0D1A',
    borderBottom: '1px solid #1A1A2E',
  },
  scrollContainer: {
    flex: 1,
    height: 0,             // flex-grow sets the height; content can't override it
    overflowX: 'scroll',
    overflowY: 'hidden',
    cursor: 'crosshair',
  },
  content: {
    height: '100%',        // fill the scroll container exactly — no vertical growth
    backgroundColor: '#0D0D1A',
    position: 'relative',
  },
  eraBandRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: NOTE_ABOVE_H + TRACK_H + 20 + NOTE_BELOW_H,
    pointerEvents: 'none',
  },
  trackAndNotesArea: {
    marginTop: 0,
    cursor: 'crosshair',
  },
  notesAbove: {
    height: NOTE_ABOVE_H,
    position: 'relative',
    overflow: 'visible',
  },
  track: {
    height: TRACK_H + 16,
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    cursor: 'crosshair',
  },
  trackLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_H,
    backgroundColor: '#FFD700',
    boxShadow: '0 0 8px 2px rgba(255,215,0,0.5)',
  },
  endMarker: {
    position: 'absolute',
    width: 3,
    height: 24,
    top: '50%',
    transform: 'translateY(-50%)',
    borderRadius: 2,
  },
  notesBelow: {
    height: NOTE_BELOW_H,
    position: 'relative',
    overflow: 'visible',
  },
  eraLabelRow: {
    position: 'relative',
    height: 20,
    marginTop: 4,
  },
  eraLabel: {
    color: '#333355',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  tapHint: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#333355',
    fontSize: 10,
    pointerEvents: 'none',
  },
  zoomOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    zIndex: 10,
  },
};
