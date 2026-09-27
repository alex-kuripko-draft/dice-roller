# Dice Roller — design prototype (CP-8)

Interactive, browser-only reference for [CP-7](https://testing-alex.atlassian.net/browse/CP-7)
(roll dice and see history). No build step, no server, no dependencies beyond
a Google Fonts stylesheet link.

## Run it

Open `design/prototype/index.html` directly in a browser, or serve the
folder locally, e.g.:

```
npx serve design/prototype
```

## Visual direction

Dice Roller is a new product with no prior UI, so this establishes its
visual identity: a felt gaming tabletop with a parchment scorecard tray,
sibling in spirit to Tip Split's paper-receipt concept but a distinct
palette and type pairing (Space Grotesk / JetBrains Mono, dark green felt,
amber die tiles, a crimson sum accent). **This is a proposed new visual
direction and needs Alex's approval before it is treated as the product's
design system.**

## What's real vs. mocked

- `script.js` rolls real random values (`Math.random`) so every UI state is
  reachable by interacting with the page — this is not the pure,
  seeded-random, unit-tested logic the Developer will build in `src/`.
  Treat it as a UI/behavior reference only, not a source to copy verbatim.
- Nothing is sent to a network or saved: refreshing the page resets all
  state. The banner at the top of the page states this for reviewers.

## Screens / journeys covered

Single page, no navigation:

1. Set the number of dice (N, 1–20) and sides (M, 2–100), initial 2d6, and
   press Roll → the latest roll shows the `NdM` label, each die's value and
   the roll sum.
2. Each roll is added to the top of the history (label, values, sum); a
   running total across the history is always visible.
3. Clear history → history and latest result are cleared, running total
   resets to 0.

## Interface states included

- **Empty**: no rolls yet, invitation text, running total 0, Clear history
  disabled.
- **Result**: latest roll plus a short history. Roll repeatedly to build a
  long, scrolling history (the list caps at a fixed height with internal
  scroll), and try N=20, M=100 to see a 20-value roll wrap across lines.
- **Validation**: empty, non-numeric, non-whole, or out-of-range N or M
  shows an inline message next to that field (`role="alert"`,
  `aria-describedby`); Roll produces nothing while either field is invalid.
  Fixing the field clears its message immediately.
- **No loading state**: rolling is synchronous, client-side logic.

## Responsive behavior

- Single-column layout at all sizes, per CP-8.
- Checked at 375px, 768px, and 1280px viewport widths. Below 480px the tray
  fills the available width with tighter side padding; at 480px and up it
  becomes a fixed max-width card centered on the felt background, with more
  vertical breathing room as the viewport grows.
- Die tiles and history rows wrap onto additional lines rather than
  overflowing when N or M is large (e.g. 20d100).

## Accessibility notes

- Semantic `<label for>` on both inputs; Roll and Clear history are native
  `<button>` elements, fully keyboard-operable.
- Visible focus rings (`outline`) on every interactive element.
- The result region is `aria-live="polite"` so the latest roll is announced
  without interrupting the user.
- Validation messages are tied to their field via `aria-describedby`,
  announced via `role="alert"`, and also flip `aria-invalid` on the input.
- Color is never the only signal: every error state also has message text.

## Outstanding decisions

- Interface copy is in English by default (no language was specified in
  CP-7/CP-8 or the Confluence project context). Flag if Alex wants a
  different language for the shipped product.
- The felt/parchment visual direction is new and proposed here for the
  first time — needs Alex's explicit approval (see above).
