/**
 * Filters.jsx
 *
 * Category filter chips grouped by scope:
 *   Science (Cosmic · Geological · Biological) — natural history
 *   History (🌏 World  ⊃  ⚜️ Western  ⊃  🦅 US) — nested by scope
 *   My Notes
 */

import React, { memo } from 'react';
import { CATEGORIES, CATEGORY_META } from '../data/events';

// Science / natural-history categories (flat row)
const SCIENCE_CATS = [CATEGORIES.COSMIC, CATEGORIES.GEOLOGICAL, CATEGORIES.BIOLOGICAL];

// Historical categories ordered outer → inner; indented in the UI
const HISTORY_CATS = [
  { cat: CATEGORIES.WORLD,   indent: 0 },
  { cat: CATEGORIES.WESTERN, indent: 1 },
  { cat: CATEGORIES.US,      indent: 2 },
];

const Filters = memo(({ selectedCategories, onToggleCategory }) => {
  const allActive = selectedCategories.length === 0;

  const clearAll = () => {
    [...selectedCategories].forEach((c) => onToggleCategory(c));
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.row}>
        {/* "All" chip */}
        <Chip
          label="All"
          active={allActive}
          color="#AAAACC"
          onClick={clearAll}
        />

        {/* Divider */}
        <div style={styles.divider} />

        {/* Science categories */}
        {SCIENCE_CATS.map((cat) => {
          const meta   = CATEGORY_META[cat];
          const active = selectedCategories.includes(cat);
          return (
            <Chip
              key={cat}
              emoji={meta.emoji}
              label={meta.label}
              active={active}
              color={meta.color}
              onClick={() => onToggleCategory(cat)}
            />
          );
        })}

        {/* Divider */}
        <div style={styles.divider} />

        {/* Historical categories — nested */}
        {HISTORY_CATS.map(({ cat, indent }) => {
          const meta   = CATEGORY_META[cat];
          const active = selectedCategories.includes(cat);
          return (
            <div
              key={cat}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        4,
                marginLeft: indent * 8,
              }}
            >
              {/* Nesting indicator */}
              {indent > 0 && (
                <span style={{ color: '#33334A', fontSize: 10, userSelect: 'none' }}>
                  {'›'.repeat(indent)}
                </span>
              )}
              <Chip
                emoji={meta.emoji}
                label={meta.label}
                active={active}
                color={meta.color}
                onClick={() => onToggleCategory(cat)}
              />
            </div>
          );
        })}

        {/* Divider */}
        <div style={styles.divider} />

        {/* My Notes */}
        {(() => {
          const meta   = CATEGORY_META[CATEGORIES.CUSTOM];
          const active = selectedCategories.includes(CATEGORIES.CUSTOM);
          return (
            <Chip
              emoji={meta.emoji}
              label={meta.label}
              active={active}
              color={meta.color}
              onClick={() => onToggleCategory(CATEGORIES.CUSTOM)}
            />
          );
        })()}
      </div>
    </div>
  );
});

export default Filters;

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ emoji, label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:         'flex',
        flexDirection:   'row',
        alignItems:      'center',
        gap:             4,
        backgroundColor: active ? color + '33' : '#141428',
        border:          `1px solid ${active ? color : '#2A2A4A'}`,
        borderRadius:    14,
        padding:         '4px 10px',
        cursor:          'pointer',
        whiteSpace:      'nowrap',
        flexShrink:      0,
        transition:      'background-color 0.15s, border-color 0.15s',
      }}
    >
      {emoji && <span style={{ fontSize: 12 }}>{emoji}</span>}
      <span
        style={{
          color:      active ? color : '#7777AA',
          fontSize:   11,
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    backgroundColor: '#0D0D1A',
    borderBottom:    '1px solid #1A1A2E',
    padding:         '6px 0',
    flexShrink:      0,
    overflowX:       'auto',
  },
  row: {
    display:     'flex',
    flexDirection: 'row',
    padding:     '0 10px',
    gap:         6,
    alignItems:  'center',
    minWidth:    'max-content',
  },
  divider: {
    width:           1,
    height:          20,
    backgroundColor: '#2A2A4A',
    marginLeft:      2,
    marginRight:     2,
    flexShrink:      0,
  },
};
