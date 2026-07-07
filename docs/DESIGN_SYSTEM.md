# Design system

The visual language of a well-run laboratory: near-black surfaces, one
signal color, monospaced instrumentation labels, serif editorial headlines.
Calm by default; the accent is spent only on interaction.

## Tokens

Defined in `src/app/globals.css` as CSS custom properties (OKLCH).

### Color

| Token                | Value (oklch)          | Use                                    |
| -------------------- | ---------------------- | -------------------------------------- |
| `--background`       | `0.156 0.003 85`       | App canvas (warm near-black)           |
| `--surface`          | `0.184 0.0035 85`      | Cards, stage panels                    |
| `--raised`           | `0.216 0.004 85`       | Popovers, dialogs                      |
| `--foreground`       | `0.928 0.004 85`       | Primary text (soft white)              |
| `--muted-foreground` | `0.64 0.006 85`        | Secondary text                         |
| `--faint`            | `0.465 0.005 85`       | Tertiary text, metadata                |
| `--primary`          | `0.69 0.188 42`        | **The** accent (signal orange)         |
| `--success`          | `0.73 0.125 155`       | Correct/cleared states only            |
| `--destructive`      | `0.64 0.185 26`        | Errors, destructive actions            |
| `--border`           | `white @ 8%`           | Hairlines everywhere                   |

Rules: the accent appears only on buttons, selection, progress, live/
interactive objects, and key data series. Charts use accent + neutral ramp.
Never more than one saturated hue per view.

### Typography

| Role      | Face                  | Notes                                    |
| --------- | --------------------- | ---------------------------------------- |
| Display   | Instrument Serif      | `.text-display`, headlines only, ≥30px   |
| UI/body   | Geist Sans            | −1.5% tracking on headings               |
| Data/meta | Geist Mono            | `.label-micro` (11px caps, +14% tracking), all numerals `tabular-nums` |

Scale (rem): 0.6875 (micro) · 0.8125 (ui) · 0.9375 (body) · 1.125 · 1.5 ·
1.875 · 3 · 4.5 · clamp hero. Line-height 1.02 for display, 1.6 for body.

### Spacing & grid

4px base. Common steps: 4, 8, 12, 16, 20, 24, 32, 48, 64, 96.
Content max-widths: 72rem (marketing), 72/64/48rem (app pages by density).
Stat/data blocks compose as bordered cells over a 1px `bg-border` gap grid
(`grid gap-px bg-border` → cells `bg-background`), which produces perfectly
aligned hairline tables without double borders.

### Shape & depth

Radius: 0 on layout containers and cells; `--radius: 6px` only on small
interactive controls (via primitives). **No shadows**, depth is expressed
with the three surface levels and hairlines. The `.fiducial` utility adds
calibration corner ticks to highlight blocks.

### Iconography

Lucide, `strokeWidth 1.75`, 14–16px, always `text-faint`/`muted` unless the
element is active. Icons never carry meaning alone (labels or `aria-label`
required).

## Motion

- Entrances: 8px rise + fade, 400–500ms, `cubic-bezier(0.22,1,0.36,1)`, once.
- Interactions: spring `stiffness 480 / damping 42`; `whileTap scale 0.97`.
- Progress/charts: width/pathLength tweens ≤ 1.1s.
- Both `prefers-reduced-motion` and the in-app toggle set
  `[data-motion="reduced"]`, which zeroes durations globally.
- Stimulus presentation timing is *never* animated, experiment timers are
  independent of the motion system.

## Component inventory

Primitives (`src/components/ui`, Radix-based): button, input, textarea,
label, select, checkbox, radio, switch, slider, dialog, sheet, tooltip,
dropdown, tabs, table, badge, card, progress, skeleton, scroll-area, sonner.

Product components: `PageHeader`, `Stat`, `EmptyState`, `RoomCard` +
`DifficultyMeter`, `Logo`, charts (`LineChart`, `BarChart`, `RadarChart`,
`Sparkline`), `Reveal`/`RevealGroup`, game primitives (`Stage`, `Fixation`,
`ResponseKey`, `Interstitial`), `GameHud`.

## Voice

Copy reads like a well-written lab manual with a dry wit: precise, second
person, no exclamation marks, no gamer slang. Numbers are shown with their
units; claims cite the original study.
