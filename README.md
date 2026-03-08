# Big History Timeline

An interactive horizontal timeline for students of Big History, spanning the Big Bang (~13.8 billion years ago) to today.

---

## Features

| Feature | Detail |
|---|---|
| **Full cosmic scale** | Linear timeline from 13.8 Bya → Today |
| **Pinch-to-zoom** | Two-finger pinch expands/contracts the timeline in place |
| **Button zoom** | + / − / ⌂ buttons as fallback; zooms 3× per tap |
| **Horizontal scroll** | One-finger pan through any time period |
| **35 predefined events** | Curated Big History milestones with descriptions |
| **Add custom notes** | Tap anywhere on the track or press "+ Add Note" |
| **Edit & delete** | Tap any pin to view, edit description, or delete custom notes |
| **Category filters** | Filter by Cosmic · Geological · Biological · Human · Modern · My Notes |
| **Era colour bands** | Subtle background tints for each geological/historical era |
| **Major event markers** | Key events have larger, filled dots |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo`

### Install & Run
```bash
cd Big-History-Timeline
npm install
npx expo start
```
Then scan the QR code with **Expo Go** (iOS/Android) or press `i` for iOS simulator / `a` for Android.

---

## Project Structure

```
Big-History-Timeline/
├── App.js                        # Root component — state, filters, modal control
├── index.js                      # Expo entry point
├── app.json                      # Expo configuration (landscape orientation)
├── package.json
│
└── src/
    ├── components/
    │   ├── Timeline.js           # Horizontal timeline + pinch zoom + PanResponder
    │   ├── TimelineNote.js       # Individual event pin (dot + stem + label)
    │   ├── TimelineHeader.js     # Adaptive tick marks and time labels
    │   ├── ZoomControls.js       # +/− zoom buttons and zoom level display
    │   ├── Filters.js            # Category filter chip row
    │   └── AddNoteModal.js       # Create / edit / view note modal
    │
    ├── data/
    │   └── events.js             # 35 predefined Big History events + category metadata
    │
    └── utils/
        └── timeUtils.js          # yearToPosition, positionToYears, tick generation, formatting
```

---

## Architecture Notes

### Coordinate system
- **Left edge** (position 0) = Big Bang (13.8 billion years ago)
- **Right edge** (position `timelineWidth`) = Today (0 years ago)
- `timelineWidth = screenWidth × zoomLevel`

### Zoom
- Zoom range: `1×` (entire universe visible) → `50,000,000×` (sub-year precision)
- Pinch midpoint stays fixed on screen while zoom changes
- `zoomRef` keeps the PanResponder callbacks in sync with the latest zoom value without stale closures

### Tick marks (`TimelineHeader`)
- `generateTicks()` computes the best interval (e.g. 1B years at zoom 1, 50 years at zoom 1M)
- Only ticks within the current viewport are rendered — no off-screen work

### Note pins (`TimelineNote`)
- Even-indexed events pin **above** the track, odd-indexed pin **below**
- Positioned absolutely using `yearToPosition()` — stays correct at all zoom levels
- `isMajor` events have a filled dot and always show the time label

---

## Extending the App

### Add more events
Edit `src/data/events.js` — follow the existing object shape:
```js
{
  id: 'evt_unique',
  title: 'Event Name',
  description: 'Detailed description…',
  yearsAgo: 65_000_000,     // supports B / M / K shorthand in UI
  category: CATEGORIES.GEOLOGICAL,
  isPredefined: true,
  isMajor: false,
}
```

### Add persistence (AsyncStorage)
In `App.js`, replace `useState(INITIAL_NOTES)` with a `useEffect` that loads from
`@react-native-async-storage/async-storage` on mount, and saves on every `notes` change.

### Add a logarithmic scale option
Replace `yearToPosition` / `positionToYears` in `timeUtils.js` with log-scale versions.
Everything else adapts automatically.

### Add search / jump-to-event
A search bar that calls `scrollViewRef.scrollTo({ x: yearToPosition(event.yearsAgo, timelineWidth) })`
would let users jump directly to any event.

---

## Dependencies

| Package | Purpose |
|---|---|
| `expo` ~51 | Project tooling, native module bridge |
| `expo-status-bar` | Status bar theming |
| `react-native` 0.74 | Core framework |
| `@react-native-async-storage/async-storage` | (Optional) local note persistence |

No third-party gesture library is required — pinch-to-zoom is implemented with the built-in `PanResponder` API.
