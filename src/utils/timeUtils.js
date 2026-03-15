/**
 * timeUtils.js
 * Core utilities for mapping between cosmic time and screen pixels.
 *
 * Coordinate convention:
 *   Left  (position 0)            → Big Bang (13.8B years ago)
 *   Right (position timelineWidth) → Today   (0 years ago)
 */

export const TOTAL_YEARS = 13_800_000_000; // 13.8 billion years
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 50_000_000; // ~sub-year precision per pixel
export const SIDE_PAD  = 80; // px of breathing room before Big Bang and after Today

// ---------------------------------------------------------------------------
// Position ↔ Time conversions
// ---------------------------------------------------------------------------

/**
 * Convert a "years ago" value to a pixel x-position on the timeline.
 */
export function yearToPosition(yearsAgo, timelineWidth) {
  const clamped = Math.max(0, Math.min(TOTAL_YEARS, yearsAgo));
  return (1 - clamped / TOTAL_YEARS) * timelineWidth;
}

/**
 * Convert a pixel x-position to "years ago".
 */
export function positionToYears(position, timelineWidth) {
  if (timelineWidth === 0) return TOTAL_YEARS;
  return (1 - position / timelineWidth) * TOTAL_YEARS;
}

// ---------------------------------------------------------------------------
// Human-readable formatting
// ---------------------------------------------------------------------------

export function formatYearsAgo(yearsAgo) {
  if (yearsAgo === 0) return 'Today';
  if (yearsAgo < 0) return `${formatLargeNumber(Math.abs(yearsAgo))} years from now`;

  if (yearsAgo >= 1_000_000_000) {
    const v = yearsAgo / 1_000_000_000;
    return `${trimDecimals(v, 2)}B yrs ago`;
  }
  if (yearsAgo >= 1_000_000) {
    const v = yearsAgo / 1_000_000;
    return `${trimDecimals(v, 1)}M yrs ago`;
  }
  if (yearsAgo >= 1_000) {
    const v = yearsAgo / 1_000;
    return `${trimDecimals(v, 1)}K yrs ago`;
  }
  return `${Math.round(yearsAgo)} yrs ago`;
}

/** Longer form used in note detail views. */
export function formatYearsAgoLong(yearsAgo) {
  if (yearsAgo === 0) return 'Today';

  if (yearsAgo >= 1_000_000_000) {
    const v = yearsAgo / 1_000_000_000;
    return `${trimDecimals(v, 3)} billion years ago`;
  }
  if (yearsAgo >= 1_000_000) {
    const v = yearsAgo / 1_000_000;
    return `${trimDecimals(v, 2)} million years ago`;
  }
  if (yearsAgo >= 1_000) {
    const v = yearsAgo / 1_000;
    return `${trimDecimals(v, 1)} thousand years ago`;
  }
  return `${Math.round(yearsAgo)} years ago`;
}

/**
 * Parse a user-entered string into a years-ago number.
 * Accepts: "13.8B", "541M", "10K", "250", "0"
 */
export function parseYearsAgo(str) {
  if (!str || str.trim() === '') return NaN;
  const s = str.trim().toUpperCase().replace(/,/g, '').replace(/\s/g, '');

  const suffixMap = { B: 1_000_000_000, M: 1_000_000, K: 1_000 };
  for (const [suffix, multiplier] of Object.entries(suffixMap)) {
    if (s.endsWith(suffix)) {
      const num = parseFloat(s.slice(0, -1));
      return isNaN(num) ? NaN : num * multiplier;
    }
  }
  return parseFloat(s);
}

// ---------------------------------------------------------------------------
// Zoom helpers
// ---------------------------------------------------------------------------

/**
 * Compute the zoom level that fits a given time span (~65% of the viewport).
 * The 0.65 factor leaves breathing room so the span isn't wall-to-wall.
 */
export function zoomForSpan(spanYears) {
  if (!spanYears || spanYears <= 0) return MIN_ZOOM;
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(TOTAL_YEARS * 0.65 / spanYears)));
}

// ---------------------------------------------------------------------------
// Timeline tick generation
// ---------------------------------------------------------------------------

/**
 * Compact tick label that shows only the magnitude and unit.
 * Transitions cleanly: 13.8B → 1B → 500M → 1M → 500K → 1K → 500 yr → 1 yr → Today
 * Never says "X years ago" — that language belongs to note cards, not scale marks.
 */
export function formatTickLabel(yearsAgo) {
  if (yearsAgo === 0) return 'Today';

  if (yearsAgo >= 1_000_000_000) {
    const v = Math.round((yearsAgo / 1_000_000_000) * 10) / 10;
    return `${v % 1 === 0 ? Math.round(v) : v}B`;
  }
  if (yearsAgo >= 1_000_000) {
    const v = Math.round((yearsAgo / 1_000_000) * 10) / 10;
    return `${v % 1 === 0 ? Math.round(v) : v}M`;
  }
  if (yearsAgo >= 1_000) {
    const v = Math.round((yearsAgo / 1_000) * 10) / 10;
    return `${v % 1 === 0 ? Math.round(v) : v}K`;
  }
  return `${Math.round(yearsAgo)} yr`;
}

/**
 * Choose the best tick interval (in years) for the current zoom so ticks
 * appear roughly every 80–160 px, always landing on a round unit boundary
 * (1/2/5 × power of 10) so labels read naturally as the scale changes.
 */
export function getTickInterval(timelineWidth) {
  const yearsPerPixel = TOTAL_YEARS / timelineWidth;
  const target = yearsPerPixel * 100; // aim for a tick every ~100 px

  // 1-2-5 ladder across every decade from 1 yr to 10B yr
  const candidates = [
    10_000_000_000,
     5_000_000_000,
     2_000_000_000,
     1_000_000_000,
       500_000_000,
       200_000_000,
       100_000_000,
        50_000_000,
        20_000_000,
        10_000_000,
         5_000_000,
         2_000_000,
         1_000_000,
           500_000,
           200_000,
           100_000,
            50_000,
            20_000,
            10_000,
             5_000,
             2_000,
             1_000,
               500,
               200,
               100,
                50,
                20,
                10,
                 5,
                 2,
                 1,
  ];

  for (const c of candidates) {
    if (c <= target) return c;
  }
  return 1;
}

/**
 * Generate ticks visible within the current viewport.
 * Only produces evenly-spaced scale marks — never event positions.
 */
export function generateTicks(timelineWidth, scrollOffset, screenWidth) {
  const interval = getTickInterval(timelineWidth);

  // Subtract SIDE_PAD so the viewport maps correctly onto the logical year range
  const leftPos  = scrollOffset - SIDE_PAD;
  const rightPos = scrollOffset + screenWidth - SIDE_PAD;

  // Raw (unclamped) years at each viewport edge.
  // rightPos may extend past Today (negative years) and leftPos past the Big Bang.
  const rawRightYears = positionToYears(leftPos,  timelineWidth); // may exceed TOTAL_YEARS
  const rawLeftYears  = positionToYears(rightPos, timelineWidth); // may be negative

  // Clamp the loop range to [0, TOTAL_YEARS] so we never produce duplicate ticks
  // by clamping out-of-range y values.
  const start = Math.floor(Math.max(0,           rawLeftYears)  / interval) * interval;
  const end   = Math.ceil (Math.min(TOTAL_YEARS, rawRightYears) / interval) * interval;

  const ticks = [];

  // Boundary: Today (yearsAgo = 0) — added once when right side of timeline is in view
  if (rawLeftYears <= 0) {
    ticks.push({ yearsAgo: 0, position: yearToPosition(0, timelineWidth), label: formatTickLabel(0) });
  }

  // Interior ticks — skip exact boundary values (already handled above/below)
  for (let y = start; y <= end + interval * 0.01; y += interval) {
    if (y <= 0 || y >= TOTAL_YEARS) continue;
    ticks.push({ yearsAgo: y, position: yearToPosition(y, timelineWidth), label: formatTickLabel(y) });
  }

  // Boundary: Big Bang (yearsAgo = TOTAL_YEARS) — added once when left side is in view
  if (rawRightYears >= TOTAL_YEARS) {
    ticks.push({ yearsAgo: TOTAL_YEARS, position: yearToPosition(TOTAL_YEARS, timelineWidth), label: formatTickLabel(TOTAL_YEARS) });
  }

  return ticks;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function trimDecimals(value, maxDecimals) {
  const str = value.toFixed(maxDecimals);
  return parseFloat(str).toString(); // remove trailing zeros
}

function formatLargeNumber(n) {
  if (n >= 1_000_000_000) return `${trimDecimals(n / 1_000_000_000, 2)}B`;
  if (n >= 1_000_000)     return `${trimDecimals(n / 1_000_000, 1)}M`;
  if (n >= 1_000)         return `${trimDecimals(n / 1_000, 1)}K`;
  return String(Math.round(n));
}
