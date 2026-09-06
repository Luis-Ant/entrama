# Entrama UI/UX & Delight Master Upgrade Plan

> **Goal**: Transform Entrama into the most responsive, elegant, comfortable, and visually refined bilingual typing platform in the world.

---

## 1. Executive Summary & Design Vision

Entrama blends the tactile precision of a dedicated mechanical typing instrument with the editorial warmth of a boutique publication. Every keystroke should feel responsive, delightful, and completely natural.

### Core Experience Pillars

1. **Sensory Immersion & Tactility**: Fluid caret animations, subtle character illumination, and optional synthesized acoustic feedback (zero-dependency Web Audio API switch sounds).
2. **Adaptive Aesthetics & Themes**: Multiple crafted themes (_Warm Editorial_, _Midnight Terminal_, _Nordic Frost_, _Forest Zen_) and font selectors (Monospace, Editorial Serif, Clean Sans).
3. **Frictionless & Enlightening Onboarding**: Interactive visual keyboard previews, hand-and-finger posture guides with active key illumination, and instant one-click bypass for testing.
4. **Empowering Analytics & Live Metrics**: Real-time WPM sparklines, accuracy streaks, and an interactive local history dashboard displaying personal bests and progress over time.
5. **Private & Offline-First Integrity**: Zero telemetry leaks, zero external font/audio CDN dependencies, instantaneous offline loading via PWA.

---

## 2. Comprehensive Architectural Breakdown

### 2.1 Theme & Typography Engine (`src/styles/` & `src/app/theme.ts`)

- **Theme Tokens**:
  - `editorial` (Warm paper, espresso ink, terracotta accent).
  - `midnight` (Deep obsidian, neon cyan/green accent, dark panel).
  - `nordic` (Slate blue, frost gray, ice blue accent).
  - `forest` (Deep pine, matcha highlight, sage muted).
- **Font Families**:
  - `mono` (JetBrains Mono / Fira Code / ui-monospace).
  - `serif` (Iowan Old Style / Merriweather / Georgia).
  - `sans` (Inter / Aptos / system-ui).
- **Persistent Preferences**: Stored locally in Dexie `preferences` table.

### 2.2 Web Audio Mechanical Feedback Synthesizer (`src/app/audio/`)

- Zero external audio files or downloads.
- Generates clean, click/thump acoustic impulses with dynamic pitch variation using native `AudioContext`, oscillators, and gain decay envelopes.
- Sound profiles:
  - `mechanical-linear` (Deep smooth thud).
  - `mechanical-clicky` (Sharp crisp click).
  - `soft-bubble` (Gentle pop).
  - `mute` (Silent default).

### 2.3 Interactive Visual Keyboard & Finger Placement Guide (`src/app/keyboard/`)

- Dynamic SVG/CSS keyboard visualizer highlighting:
  - Home row foundation (`ASDF` / `JKL;`).
  - Finger-to-key color-coded mapping.
  - Active key depression animations when user types.

### 2.4 Live Practice Delight & Animations (`src/app/practice/`)

- **Smooth Caret**: Sub-pixel animated cursor gliding between letters.
- **Accuracy Streak Counter**: Dynamic multiplier / streak badge highlighting consecutive error-free keystrokes.
- **Live WPM Gauge & Sparkline**: Instantaneous typing cadence feedback.

### 2.5 Personal Records & History Dashboard (`src/app/dashboard/`)

- Overview of recent sessions queried from Dexie `typingSessions`.
- Metrics summary: Highest WPM, Average Accuracy, Total Time Practiced, Words Typed.
- Filter by category (Stories, Tech, Literature, Code) and duration preset.

---

## 3. SDD Work Units Roadmap

| Work Unit                                            | Scope                                                                                                        | Deliverables                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **WU 1: Design Tokens, Themes & Audio Engine**       | Theme provider, theme switcher, typography engine, Web Audio mechanical feedback                             | `theme.ts`, `audioSynthesizer.ts`, `ThemeSelector.tsx`, `SoundSelector.tsx`, unit tests |
| **WU 2: Interactive Keyboard & Enhanced Onboarding** | Visual keyboard component, finger-to-key glowing visualizer, enhanced posture cards                          | `VisualKeyboard.tsx`, `HandFingerGuide.tsx`, updated onboarding views, view tests       |
| **WU 3: Fluid Practice Shell & Live Sparklines**     | Smooth animated caret, streak indicator, real-time cadence sparkline, celebratory particle/finish animations | `SmoothCaret.tsx`, `StreakBadge.tsx`, `WpmSparkline.tsx`, `FreeTypingView.tsx` upgrades |
| **WU 4: History & Statistics Dashboard**             | Personal bests card, session history table, progress charts, Dexie querying                                  | `StatsDashboard.tsx`, `PersonalBestsCard.tsx`, integration in `App.tsx`                 |
| **WU 5: Integration & Verification**                 | Header navigation, full E2E & unit test suite (170+ tests), build & PWA validation                           | `App.tsx`, `App.test.tsx`, `sdd-verify`, `sdd-archive`                                  |

---

## 4. Verification & Quality Standards

- **Strict TDD**: All new mathematical engines, audio synthesizer state guards, and UI components verified with Vitest prior to integration.
- **Accessibility (WCAG 2.1 AA)**: Full keyboard navigation, `prefers-reduced-motion` compliance, ARIA live announcements for screen readers.
- **Zero-Dependency Security**: 100% bundled offline assets, zero CDN calls.
