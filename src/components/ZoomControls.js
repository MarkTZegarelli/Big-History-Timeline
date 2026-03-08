/**
 * ZoomControls.js
 *
 * Displays the current zoom level and provides + / – buttons as a fallback
 * for devices where pinch gestures are unavailable.
 * Also shows a compact "Reset" button to return to full-universe view.
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MIN_ZOOM, MAX_ZOOM } from '../utils/timeUtils';

const ZOOM_STEP = 3; // multiply/divide by this on each button tap

function formatZoom(zoom) {
  if (zoom >= 1_000_000) return `${(zoom / 1_000_000).toFixed(1)}M×`;
  if (zoom >= 1_000)     return `${(zoom / 1_000).toFixed(1)}K×`;
  if (zoom >= 10)        return `${zoom.toFixed(0)}×`;
  return `${zoom.toFixed(1)}×`;
}

const ZoomControls = memo(({ zoom, onZoomChange }) => {
  const canZoomOut = zoom > MIN_ZOOM;
  const canZoomIn  = zoom < MAX_ZOOM;

  const zoomIn  = () => onZoomChange(Math.min(MAX_ZOOM, zoom * ZOOM_STEP));
  const zoomOut = () => onZoomChange(Math.max(MIN_ZOOM, zoom / ZOOM_STEP));
  const reset   = () => onZoomChange(MIN_ZOOM);

  return (
    <View style={styles.container}>
      {/* Reset */}
      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={reset}
        disabled={!canZoomOut}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, !canZoomOut && styles.disabled]}>⌂</Text>
      </TouchableOpacity>

      {/* Zoom out */}
      <TouchableOpacity
        style={[styles.button, !canZoomOut && styles.buttonDisabled]}
        onPress={zoomOut}
        disabled={!canZoomOut}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, !canZoomOut && styles.disabled]}>−</Text>
      </TouchableOpacity>

      {/* Zoom level label */}
      <View style={styles.zoomLabel}>
        <Text style={styles.zoomText}>{formatZoom(zoom)}</Text>
        <Text style={styles.zoomHint}>pinch to zoom</Text>
      </View>

      {/* Zoom in */}
      <TouchableOpacity
        style={[styles.button, !canZoomIn && styles.buttonDisabled]}
        onPress={zoomIn}
        disabled={!canZoomIn}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, !canZoomIn && styles.disabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
});

export default ZoomControls;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,13,26,0.9)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E3A',
    borderWidth: 1,
    borderColor: '#3A3A5A',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  resetButton: {
    backgroundColor: '#1A1A30',
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    color: '#CCCCEE',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  disabled: {
    color: '#555577',
  },
  zoomLabel: {
    alignItems: 'center',
    minWidth: 64,
    marginHorizontal: 4,
  },
  zoomText: {
    color: '#AAAACC',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  zoomHint: {
    color: '#55556A',
    fontSize: 8,
    marginTop: 1,
  },
});
