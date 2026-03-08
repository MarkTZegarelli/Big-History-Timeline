/**
 * TimelineNote.js
 *
 * Renders a single event pin on the timeline.
 * Pins alternate above/below the track based on their index so labels
 * don't collide with each other at low zoom.
 *
 * Layout (above example):
 *
 *   [title label]
 *        │  ← stem line
 *        ●  ← dot on the track
 *
 * Below is the mirror image.
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getCategoryColor } from '../data/events';
import { formatYearsAgo } from '../utils/timeUtils';

// Height of the stem line connecting the dot to the label
const STEM_ABOVE = 64;
const STEM_BELOW = 64;
const DOT_RADIUS = 5;
const MAJOR_DOT_RADIUS = 7;

const TimelineNote = memo(({ note, position, index, onPress }) => {
  const isAbove = index % 2 === 0;
  const color    = getCategoryColor(note.category);
  const dotR     = note.isMajor ? MAJOR_DOT_RADIUS : DOT_RADIUS;
  const stemH    = isAbove ? STEM_ABOVE : STEM_BELOW;

  // Absolute container sits on the track centre line.
  // We shift left by half the label width so the dot is centred.
  const containerStyle = [
    styles.container,
    {
      left: position - 60, // 60 = half of labelWidth (120)
      top: isAbove
        ? -(stemH + dotR + 2 + 28) // clear the track upward (28 ≈ label height)
        : dotR + 2,                 // sit just below the track dot
    },
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
    >
      {isAbove ? (
        <>
          {/* Label above */}
          <View style={[styles.labelBox, { borderColor: color }]}>
            <Text style={[styles.labelTitle, { color }]} numberOfLines={2}>
              {note.title}
            </Text>
            {note.isMajor && (
              <Text style={styles.labelTime} numberOfLines={1}>
                {formatYearsAgo(note.yearsAgo)}
              </Text>
            )}
          </View>

          {/* Stem */}
          <View style={[styles.stem, { height: stemH, backgroundColor: color, opacity: 0.6 }]} />

          {/* Dot (rendered at bottom so it aligns with the track) */}
          <View
            style={[
              styles.dot,
              {
                width: dotR * 2,
                height: dotR * 2,
                borderRadius: dotR,
                backgroundColor: note.isMajor ? color : 'transparent',
                borderWidth: 2,
                borderColor: color,
              },
            ]}
          />
        </>
      ) : (
        <>
          {/* Dot at top, stem downward, label at bottom */}
          <View
            style={[
              styles.dot,
              {
                width: dotR * 2,
                height: dotR * 2,
                borderRadius: dotR,
                backgroundColor: note.isMajor ? color : 'transparent',
                borderWidth: 2,
                borderColor: color,
              },
            ]}
          />
          <View style={[styles.stem, { height: stemH, backgroundColor: color, opacity: 0.6 }]} />
          <View style={[styles.labelBox, { borderColor: color }]}>
            <Text style={[styles.labelTitle, { color }]} numberOfLines={2}>
              {note.title}
            </Text>
            {note.isMajor && (
              <Text style={styles.labelTime} numberOfLines={1}>
                {formatYearsAgo(note.yearsAgo)}
              </Text>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
});

export default TimelineNote;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 120,
    alignItems: 'center',
  },
  labelBox: {
    backgroundColor: 'rgba(13,13,26,0.88)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 3,
    maxWidth: 120,
    alignItems: 'center',
  },
  labelTitle: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  labelTime: {
    fontSize: 8,
    color: '#9999BB',
    textAlign: 'center',
    marginTop: 1,
  },
  stem: {
    width: 1.5,
  },
  dot: {
    // sized dynamically above
  },
});
