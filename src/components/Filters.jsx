/**
 * Filters.jsx
 * Horizontal row of category filter chips.
 */

import React, { memo } from 'react';
import { CATEGORIES, CATEGORY_META } from '../data/events';

const ALL_CATEGORIES = Object.values(CATEGORIES);

const Filters = memo(({ selectedCategories, onToggleCategory }) => {
  const allActive = selectedCategories.length === 0;

  const clearAll = () => {
    selectedCategories.forEach((c) => onToggleCategory(c));
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.row}>
        {/* "All" chip */}
        <button
          style={{
            ...styles.chip,
            ...(allActive ? styles.chipActive : {}),
          }}
          onClick={clearAll}
        >
          <span style={{ ...styles.chipText, ...(allActive ? styles.chipTextActive : {}) }}>
            All
          </span>
        </button>

        {ALL_CATEGORIES.map((cat) => {
          const meta   = CATEGORY_META[cat];
          const active = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              style={{
                ...styles.chip,
                ...(active
                  ? { backgroundColor: meta.color + '33', borderColor: meta.color }
                  : {}),
              }}
              onClick={() => onToggleCategory(cat)}
            >
              <span style={styles.emoji}>{meta.emoji}</span>
              <span
                style={{
                  ...styles.chipText,
                  ...(active ? { color: meta.color, fontWeight: 700 } : {}),
                }}
              >
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default Filters;

const styles = {
  wrapper: {
    backgroundColor: '#0D0D1A',
    borderBottom:    '1px solid #1A1A2E',
    padding:         '6px 0',
    flexShrink:      0,
    overflowX:       'auto',
  },
  row: {
    display:    'flex',
    flexDirection: 'row',
    padding:    '0 10px',
    gap:        6,
    alignItems: 'center',
    minWidth:   'max-content',
  },
  chip: {
    display:         'flex',
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: '#141428',
    border:          '1px solid #2A2A4A',
    borderRadius:    14,
    padding:         '4px 10px',
    cursor:          'pointer',
    whiteSpace:      'nowrap',
  },
  chipActive: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderColor:     '#AAAACC',
  },
  emoji: {
    fontSize: 12,
  },
  chipText: {
    color:      '#7777AA',
    fontSize:   11,
    fontWeight: 500,
  },
  chipTextActive: {
    color:      '#DDDDFF',
    fontWeight: 700,
  },
};
