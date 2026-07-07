/** Collectible evidence items surfaced in the minimal game HUD. */
export interface InventoryItem {
  id: string;
  label: string;
  detail: string;
}

/** Starting kit per room, thematic objects, not power-ups. */
export const ROOM_STARTING_ITEMS: Record<string, InventoryItem[]> = {
  "invisible-gorilla": [
    { id: "tally-counter", label: "Tally counter", detail: "Tracks bounce counts during observation blocks." },
  ],
  "change-blindness": [
    { id: "viewfinder", label: "Viewfinder", detail: "Marks cells for comparison across alternations." },
  ],
  "magic-number-seven": [
    { id: "symbol-pad", label: "Symbol pad", detail: "Nine glyphs for recall entry." },
  ],
  "false-memory": [
    { id: "case-file", label: "Case file", detail: "Evidence lists for study and testimony." },
  ],
  "framing-effect": [
    { id: "protocol-card", label: "Protocol card", detail: "Decision scenarios with matched gain/loss pairs." },
  ],
  "reward-corridor": [
    { id: "charge-meter", label: "Charge meter", detail: "Door charge from panel pulls." },
  ],
  "stroop-lock": [
    { id: "ink-key", label: "Ink key", detail: "R / G / B / Y response mapping." },
  ],
  "affective-gate": [
    { id: "ink-key", label: "Ink key", detail: "Same mapping, words carry charge now." },
  ],
  "conformity-chamber": [
    { id: "panel-transcript", label: "Panel transcript", detail: "Prior participants' answers, shown before yours." },
  ],
  "authority-protocol": [
    { id: "operator-badge", label: "Operator badge", detail: "Console access for the escalation protocol." },
  ],
};

export function startingItems(roomSlug: string): InventoryItem[] {
  return ROOM_STARTING_ITEMS[roomSlug] ?? [
    { id: "subject-id", label: "Subject ID", detail: "Anonymous session identifier." },
  ];
}
