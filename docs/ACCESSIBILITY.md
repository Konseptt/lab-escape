# Accessibility checklist

Target: WCAG 2.2 AA. Status reflects the current build.

## Perception

- [x] Text contrast ≥ 4.5:1 (`--foreground` on `--background` ≈ 13:1;
      `--muted-foreground` ≈ 5.6:1; `--faint` reserved for decorative meta).
- [x] Accent-on-dark and accent-fill button text checked ≥ 4.5:1.
- [x] Color never sole carrier: difficulty meters pair marks with labels,
      timeline cells have per-cell `aria-label`s, Stroop response keys carry
      color swatch + name + keycap.
- [x] Colorblind-safe toggle adds shape/label redundancy in color tasks.
- [x] High-contrast and large-stimulus modes in Settings and in-game panel.
- [x] `prefers-reduced-motion` honored globally; in-app override
      (`[data-motion="reduced"]`) collapses all animation.
- [x] No flashing content above 3 Hz (flicker paradigm alternates at
      ~2.8 Hz with low-luminance glyphs; parameters clamped in config).

## Operation

- [x] Full keyboard support: every engine has keyboard responses
      (R/G/B/Y, 1–9, O/N, Enter/Backspace); pads/buttons mirror them.
- [x] Skip-to-content link on the app shell.
- [x] Visible focus (`outline-ring`, 2px) on all interactive elements.
- [x] Pause is always one interaction away; timing suspends on pause.
- [x] No time limits on menu/response screens outside measured windows;
      measured windows are the experiment itself and are disclosed.
- [x] Touch targets ≥ 44px in game surfaces.

## Understanding

- [x] Every room states purpose, duration, difficulty, and data collected
      before start.
- [x] Practice trials with corrective feedback precede scored trials.
- [x] Errors use plain language and propose the next step.
- [x] Form fields have visible labels, `autocomplete`, and inline errors
      announced via `role="alert"`.

## Robustness

- [x] Landmarks: `header/nav/main/footer`, one `h1` per page, ordered
      headings.
- [x] Live regions: HUD objective (`aria-live="polite"`), stimulus stages
      announce phase changes.
- [x] Progress bars expose `role="progressbar"` + value attributes.
- [x] Charts are SVG with `role="img"` + descriptive labels; underlying
      data always available in adjacent tables or exports.
- [x] Dialogs (Radix) trap focus, restore on close, close on Escape.

## Known gaps / next

- [ ] Screen-reader-optimized alternative for the motion-tracking task
      (inattentional blindness is inherently visual; provide an auditory
      analog task as an alternative room).
- [ ] Localization: strings are centralized in content modules but not yet
      extracted to a message catalog (language setting is plumbed).
- [ ] Formal audit with NVDA + VoiceOver across the full play loop.
