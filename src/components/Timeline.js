/**
 * Timeline.js
 *
 * The main horizontal timeline container.
 *
 * Architecture
 * ────────────
 * ┌── gestureWrapper (View + PanResponder) ──────────────────────────────────┐
 * │ ┌── ScrollView (horizontal, scrollEnabled toggled during pinch) ─────┐  │
 * │ │  ┌── content (width = SCREEN_WIDTH × zoom) ──────────────────────┐ │  │
 * │ │  │  TimelineHeader   (tick marks)                                 │ │  │
 * │ │  │  ── Track ─────────────────────────────────────────────────── │ │  │
 * │ │  │  Notes (absolutely positioned)                                 │ │  │
 * │ │  └────────────────────────────────────────────────────────────────┘ │  │
 * │ └────────────────────────────────────────────────────────────────────┘  │
 * │  ZoomControls (overlay, bottom-right)                                    │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Pinch-to-zoom
 * ─────────────
 * PanResponder sits on the wrapper and captures two-finger touches *before*
 * ScrollView sees them (onStartShouldSetPanResponderCapture).  While pinching:
 *   1. ScrollView is disabled so it won't scroll on its own.
 *   2. We compute newZoom from the ratio of current/initial finger distance.
 *   3. We scroll programmatically to keep the pinch midpoint fixed in view.
 *
 * Single-finger scroll falls through to the ScrollView as normal.
 *
 * Tap-to-add
 * ──────────
 * A TouchableOpacity wraps the timeline track area.  Its onPress fires when
 * the gesture isn't a pinch, translating the tap's x position + current
 * scroll offset into a yearsAgo value passed to onTimelinePress.
 */

import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  View,
  ScrollView,
  PanResponder,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import TimelineNote   from './TimelineNote';
import TimelineHeader from './TimelineHeader';
import ZoomControls   from './ZoomControls';
import {
  TOTAL_YEARS,
  MIN_ZOOM,
  MAX_ZOOM,
  yearToPosition,
  positionToYears,
} from '../utils/timeUtils';
import { getCategoryColor } from '../data/events';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Heights
const HEADER_H       = 38;   // tick-mark row
const TRACK_H        = 4;    // the actual timeline line
const NOTE_ABOVE_H   = 140;  // space for notes pinned above the track
const NOTE_BELOW_H   = 140;  // space for notes pinned below the track
const CONTENT_HEIGHT = HEADER_H + NOTE_ABOVE_H + TRACK_H + NOTE_BELOW_H;

// Gradient-like era background colours (drawn as coloured segments on the track)
const ERA_BANDS = [
  { label: 'Cosmic',     startYears: 13_800_000_000, endYears: 4_600_000_000, color: '#1A1033' },
  { label: 'Geological', startYears:  4_600_000_000, endYears:   541_000_000, color: '#1A2A1A' },
  { label: 'Biological', startYears:    541_000_000, endYears:     2_800_000, color: '#1A2A18' },
  { label: 'Human',      startYears:      2_800_000, endYears:             0, color: '#1A1A28' },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function touchDistance(t1, t2) {
  const dx = t1.pageX - t2.pageX;
  const dy = t1.pageY - t2.pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

function touchMidX(t1, t2) {
  return (t1.pageX + t2.pageX) / 2;
}

function clampZoom(z) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
}

// ─── component ───────────────────────────────────────────────────────────────

export default function Timeline({ notes, onNotePress, onTimelinePress }) {
  // ── zoom state ──────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(MIN_ZOOM);

  /**
   * zoomRef mirrors zoom state so PanResponder callbacks (which close over
   * the initial zoom value at creation time) can always read the live zoom.
   */
  const zoomRef = useRef(MIN_ZOOM);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const updateZoom = useCallback((newZoom) => {
    const z = clampZoom(newZoom);
    zoomRef.current = z;
    setZoom(z);
  }, []);

  // ── scroll tracking ──────────────────────────────────────────────────────
  const scrollViewRef    = useRef(null);
  const scrollOffsetRef  = useRef(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // For re-rendering the header ticks when scroll changes we track it in state
  // but only at a throttled rate (via the onScroll event).
  const [headerScrollOffset, setHeaderScrollOffset] = useState(0);

  // ── pinch state (refs only — no renders needed during gesture) ───────────
  const pinchActiveRef = useRef(false);
  const pinchDataRef   = useRef({
    initialDistance: 1,
    initialZoom:     1,
    midX:            0,
    initialScrollX:  0,
  });

  // ── PanResponder ─────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      // Capture two-finger starts BEFORE ScrollView sees them
      onStartShouldSetPanResponderCapture: (evt) =>
        evt.nativeEvent.touches.length >= 2,

      // Also capture two-finger moves (in case ScrollView grabbed the start)
      onMoveShouldSetPanResponderCapture: (evt) =>
        evt.nativeEvent.touches.length >= 2,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length < 2) return;

        pinchActiveRef.current = true;
        pinchDataRef.current = {
          initialDistance: touchDistance(touches[0], touches[1]),
          initialZoom:     zoomRef.current,
          midX:            touchMidX(touches[0], touches[1]),
          initialScrollX:  scrollOffsetRef.current,
        };
        setScrollEnabled(false);
      },

      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (!pinchActiveRef.current || touches.length < 2) return;

        const { initialDistance, initialZoom, midX, initialScrollX } =
          pinchDataRef.current;

        const currentDist = touchDistance(touches[0], touches[1]);
        const scale       = currentDist / initialDistance;
        const newZoom     = clampZoom(initialZoom * scale);

        // Keep the point that was under the midpoint fixed on screen.
        // The "fixed fraction" is how far along the timeline the midpoint was.
        const oldWidth    = SCREEN_WIDTH * initialZoom;
        const newWidth    = SCREEN_WIDTH * newZoom;
        const fixedFrac   = (initialScrollX + midX) / oldWidth;
        const newScrollX  = Math.max(0, fixedFrac * newWidth - midX);

        zoomRef.current = newZoom;
        setZoom(newZoom);

        // Scroll without animation to stay in sync with the gesture
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollTo({ x: newScrollX, animated: false });
        });
      },

      onPanResponderRelease:   () => { pinchActiveRef.current = false; setScrollEnabled(true); },
      onPanResponderTerminate: () => { pinchActiveRef.current = false; setScrollEnabled(true); },
    })
  ).current;

  // ── derived values ───────────────────────────────────────────────────────
  const timelineWidth = Math.max(SCREEN_WIDTH, SCREEN_WIDTH * zoom);

  // Era bands computed once per zoom change
  const eraBands = useMemo(() => {
    return ERA_BANDS.map((band) => {
      const left  = yearToPosition(band.startYears, timelineWidth);
      const right = yearToPosition(band.endYears,   timelineWidth);
      return { ...band, left, width: right - left };
    });
  }, [timelineWidth]);

  // ── tap on the track → add a note ────────────────────────────────────────
  const handleTrackPress = useCallback(
    (evt) => {
      if (pinchActiveRef.current) return;
      const localX  = evt.nativeEvent.locationX;
      const absX    = scrollOffsetRef.current + localX;
      const yearsAgo = positionToYears(absX, timelineWidth);
      onTimelinePress(Math.max(0, Math.min(TOTAL_YEARS, yearsAgo)));
    },
    [timelineWidth, onTimelinePress]
  );

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.wrapper} {...panResponder.panHandlers}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          scrollOffsetRef.current = e.nativeEvent.contentOffset.x;
          setHeaderScrollOffset(e.nativeEvent.contentOffset.x);
        }}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ width: timelineWidth }}
      >
        {/* ── Full-width content ── */}
        <View style={[styles.content, { width: timelineWidth }]}>

          {/* Tick-mark header */}
          <TimelineHeader
            timelineWidth={timelineWidth}
            scrollOffset={headerScrollOffset}
            screenWidth={SCREEN_WIDTH}
          />

          {/* Era colour bands behind the track */}
          <View style={styles.eraBandRow}>
            {eraBands.map((b) => (
              <View
                key={b.label}
                style={[styles.eraBand, { left: b.left, width: b.width, backgroundColor: b.color }]}
              />
            ))}
          </View>

          {/* Tappable track + notes area */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleTrackPress}
            style={styles.trackAndNotesArea}
          >
            {/* Notes area ABOVE the track */}
            <View style={styles.notesAbove} pointerEvents="box-none">
              {notes
                .filter((_, i) => i % 2 === 0)
                .map((note, idx) => (
                  <TimelineNote
                    key={note.id}
                    note={note}
                    position={yearToPosition(note.yearsAgo, timelineWidth)}
                    index={0} // always "above" variant
                    onPress={() => onNotePress(note)}
                  />
                ))}
            </View>

            {/* The actual timeline track line */}
            <View style={styles.track}>
              {/* Glowing centre line */}
              <View style={styles.trackLine} />
              {/* Today marker */}
              <View style={[styles.todayMarker, { left: timelineWidth - 2 }]} />
              {/* Big Bang marker */}
              <View style={[styles.bigBangMarker, { left: 0 }]} />
            </View>

            {/* Notes area BELOW the track */}
            <View style={styles.notesBelow} pointerEvents="box-none">
              {notes
                .filter((_, i) => i % 2 === 1)
                .map((note, idx) => (
                  <TimelineNote
                    key={note.id}
                    note={note}
                    position={yearToPosition(note.yearsAgo, timelineWidth)}
                    index={1} // always "below" variant
                    onPress={() => onNotePress(note)}
                  />
                ))}
            </View>
          </TouchableOpacity>

          {/* Era labels along the bottom */}
          <EraLabels eraBands={eraBands} />

          {/* Tap hint (only at default zoom) */}
          {zoom <= 1.2 && (
            <View style={styles.tapHint} pointerEvents="none">
              <Text style={styles.tapHintText}>
                Tap anywhere on the track to add a note · Pinch or use +/− to zoom
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ZoomControls overlay */}
      <View style={styles.zoomOverlay}>
        <ZoomControls zoom={zoom} onZoomChange={updateZoom} />
      </View>
    </View>
  );
}

// ─── Era label strip ─────────────────────────────────────────────────────────

function EraLabels({ eraBands }) {
  return (
    <View style={styles.eraLabelRow}>
      {eraBands.map((b) => (
        <View
          key={b.label}
          style={[styles.eraLabelContainer, { left: b.left, width: b.width }]}
        >
          {b.width > 60 && (
            <Text style={styles.eraLabel} numberOfLines={1}>
              {b.label}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },

  // ── ScrollView content ──
  content: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    overflow: 'hidden',
  },

  // ── Era bands (sit behind the track) ──
  eraBandRow: {
    position: 'absolute',
    top: 38,     // below the header
    left: 0,
    right: 0,
    height: NOTE_ABOVE_H + TRACK_H + NOTE_BELOW_H,
  },
  eraBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    opacity: 0.5,
  },

  // ── Track + notes touch area ──
  trackAndNotesArea: {
    // sits below the header
    marginTop: HEADER_H,
  },

  notesAbove: {
    height: NOTE_ABOVE_H,
    position: 'relative',
  },

  track: {
    height: TRACK_H + 20, // extra vertical hitbox for tapping
    justifyContent: 'center',
  },
  trackLine: {
    height: TRACK_H,
    backgroundColor: '#FFD700', // gold
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  todayMarker: {
    position: 'absolute',
    width: 3,
    height: 24,
    backgroundColor: '#FF4444',
    top: -10,
    borderRadius: 2,
  },
  bigBangMarker: {
    position: 'absolute',
    width: 3,
    height: 24,
    backgroundColor: '#7B68EE',
    top: -10,
    borderRadius: 2,
  },

  notesBelow: {
    height: NOTE_BELOW_H,
    position: 'relative',
  },

  // ── Era label strip at the very bottom ──
  eraLabelRow: {
    position: 'relative',
    height: 20,
    marginTop: 4,
  },
  eraLabelContainer: {
    position: 'absolute',
    top: 0,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraLabel: {
    color: '#333355',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
  },

  // ── Tap hint ──
  tapHint: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapHintText: {
    color: '#333355',
    fontSize: 10,
    textAlign: 'center',
  },

  // ── ZoomControls overlay ──
  zoomOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 16,
  },
});
