# Site design: Swiss direction (from 28 Oct 2026)

Replaces the Earth editorial look from `red-earth-kindergarten/moodboard/THEME.md` for this website.
Mechanics studied frame by frame from danielebuser.com (Awwwards nominee, Oct 2026) and rebuilt here;
no code, copy, images or paid fonts were taken from it.

## Type
- One family: Inter Variable, with the optical-size axis on, so large sizes get the Display cut.
- Headlines run near full width: `clamp(64px, 13.5vw, 230px)`, line height 0.86, tracking -0.05em, each ending in an accent mark (`.` or the year tick).
- Labels and nav: 13–15px uppercase. Body: 17px.

## Colour
| Token | Hex | Use |
|---|---|---|
| paper | #F6F6F6 | page |
| ink | #0A0A0A | text, the Say Hello section (18.3:1) |
| card | #1C1C1C | project card frames |
| accent | #FF4500 | cursor dot, year tick, full stops; large marks only (3.2:1) |
| brick | #C93500 | hover and small accent text (4.9:1) |
| olive | #666666 | secondary text (5.3:1) |
| kraft | #EBEBEB | panels |

## Mechanics
1. **Say Hello.** A full-screen near-black section the page scrolls into, with a hard edge (no colour fade).
2. **Cursor dot.** 12px accent dot following the mouse, 20px over links. The system cursor is hidden, but only once the dot runs, only for a fine pointer, never with reduced motion.
3. **Load.** Header fades in; the first headline inks from grey to black (readable from the first frame); the rest of the first screen rises in order.
4. **Page change.** Cross-document view transitions crossfade between pages (no JavaScript).
5. **Cards.** Dark frame, title left, tags stacked right in uppercase. On hover or focus the picture blurs into a second picture (`cover_hover` in the project's `portfolio.yaml`).
6. **Fixed header and corner.** Both use `mix-blend-difference`, so they read over light pages, photos and the dark section.
7. **Grid.** Faint 12-column lines behind every page, drawn in once on load.

Reduced motion: every animation above is off; nothing is hidden.
