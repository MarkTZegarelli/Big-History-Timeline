/**
 * TimelineHeader.js
 *
 * Renders tick marks and time labels along the top of the timeline track.
 * Only ticks within the current viewport are rendered for performance.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { generateTicks } from '../utils/timeUtils';

const TICK_HEIGHT = 10;

const TimelineHeader = memo(({ timelineWidth, scrollOffset, screenWidth }) => {
  const ticks = generateTicks(timelineWidth, scrollOffset, screenWidth);

  return (
    <View style={[styles.container, { width: timelineWidth }]}>
      {ticks.map((tick) => (
        <View
          key={`${tick.yearsAgo}`}
          style={[styles.tick, { left: tick.position }]}
        >
          <Text style={styles.label} numberOfLines={1}>
            {tick.label}
          </Text>
          <View style={styles.tickLine} />
        </View>
      ))}
    </View>
  );
});

export default TimelineHeader;

const styles = StyleSheet.create({
  container: {
    height: 38,
    position: 'relative',
    // sits directly above the timeline track
  },
  tick: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    // translate so the tick is centred on its position
    transform: [{ translateX: -40 }], // half the label width
    width: 80,
  },
  label: {
    fontSize: 9,
    color: '#8888AA',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  tickLine: {
    width: 1,
    height: TICK_HEIGHT,
    backgroundColor: '#44446A',
    marginTop: 2,
  },
});
