/**
 * Filters.js
 *
 * Horizontal row of category filter chips.
 * Tapping a chip toggles that category on/off.
 * When no categories are selected all events show.
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { CATEGORIES, CATEGORY_META } from '../data/events';

const ALL_CATEGORIES = Object.values(CATEGORIES);

const Filters = memo(({ selectedCategories, onToggleCategory }) => {
  const allActive = selectedCategories.length === 0;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {/* "All" chip */}
        <TouchableOpacity
          style={[styles.chip, allActive && styles.chipActive]}
          onPress={() => {
            // Clear all filters → show everything
            ALL_CATEGORIES.forEach((c) => {
              if (selectedCategories.includes(c)) onToggleCategory(c);
            });
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, allActive && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        {ALL_CATEGORIES.map((cat) => {
          const meta    = CATEGORY_META[cat];
          const active  = selectedCategories.includes(cat);
          const color   = meta.color;

          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                active && { backgroundColor: color + '33', borderColor: color },
              ]}
              onPress={() => onToggleCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{meta.emoji}</Text>
              <Text
                style={[
                  styles.chipText,
                  active && { color: color, fontWeight: '700' },
                ]}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

export default Filters;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#0D0D1A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141428',
    borderWidth: 1,
    borderColor: '#2A2A4A',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  chipActive: {
    backgroundColor: '#FFFFFF22',
    borderColor: '#AAAACC',
  },
  emoji: {
    fontSize: 12,
  },
  chipText: {
    color: '#7777AA',
    fontSize: 11,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#DDDDFF',
    fontWeight: '700',
  },
});
