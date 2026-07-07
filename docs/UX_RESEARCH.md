# UX research principles in Lab Escape

How the product applies established UX research to the training loop.

## Mental model: study visit

Users are not “playing levels.” They are running **reps** through a protocol:

1. **Briefing** — read objectives and variables  
2. **Session** — measured trials  
3. **Debrief** — personal data + session notes  
4. **Literature** — original paper  

The **Subject pathway** component (`src/components/subject-pathway.tsx`) makes this model visible on every major screen so users always know where they are (recognition over recall).

## Patterns implemented

| Principle | Implementation |
|-----------|----------------|
| **Hick's law** (fewer choices) | `resolveNextAction()` returns one primary CTA per screen |
| **Fitts's law** | “Continue” button fixed in `NextActionBar`, header actions on the right |
| **Goal-gradient effect** | Training checklist with % complete bar |
| **Zeigarnik effect** | Incomplete checklist stays visible until dismissed or 100% |
| **Peak-end rule** | Debrief + session notes + explicit “next step” after each rep |
| **Progressive disclosure** | First visit checklist; wing unlocks; briefing before play |
| **Expectation setting** | Every next action includes a *why* line |
| **Error prevention** | Guest notice explains data scope before users invest time |
| **Consistency** | Same four-step pathway on training, experiments, results |

## Components

| File | Role |
|------|------|
| `src/lib/ux/journey.ts` | Next-action logic + checklist items |
| `src/lib/ux/progress.ts` | Milestone flags in `localStorage` |
| `src/components/ux/next-action-bar.tsx` | Single recommended CTA |
| `src/components/ux/training-checklist.tsx` | First-visit onboarding |
| `src/components/ux/guest-notice.tsx` | Guest data-scope banner |
| `src/components/ux/ux-milestone.tsx` | Marks briefing/debrief/science views |

## Milestone storage

Key: `lab-escape:ux`

```json
{
  "briefingViewed": ["invisible-gorilla"],
  "debriefViewed": ["session-id"],
  "scienceViewed": ["invisible-gorilla"],
  "checklistDismissed": false
}
```

Milestones fire `lab-escape:ux` so `useUxFlags()` updates next-action without a full reload.

## Next-action priority

1. No sessions → briefing for A-01  
2. Latest session debrief not viewed → results  
3. Literature not read for that room → science page  
4. Focus room briefing not read → experiment intro  
5. Else → play focus room  

## Future UX work

- Spaced-repetition “rep due” dates on training log  
- Pre-session prediction (“expected accuracy”) for calibration feedback  
- Instructor cohort view (aggregate only, no PII)  
- Reduced-motion path testing with real participants  
- Usability tests: time-to-first-rep, debrief completion rate, literature click-through  

## References (concepts)

- Nielsen Norman Group — recognition vs recall, progressive disclosure  
- Hick, W. E. (1952) — choice reaction time  
- Fitts, P. M. (1954) — target acquisition  
- Zeigarnik, B. (1927) — incomplete tasks  
- Kahneman — peak-end rule (experiential memory)
