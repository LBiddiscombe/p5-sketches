# p5-sketches — agent guide

## Structure

Each sketch is a self-contained folder with `index.html` + `sketch.js`.  
Shared helper classes live in `/helpers/` and are loaded via `<script src="/helpers/xxx.js">` in HTML.

| Directory | Purpose |
|-----------|---------|
| `_template/` | Starter template — copy as-is for new sketches |
| `helpers/` | Mover, Particle, Spring, Vehicle, Grid, QuadTree, openSimplexNoise |
| `animations/` | Animation-first sketches |
| `input/` | Interactive sketches — uses **q5.js + p5play v3** (CDN) |
| `motion/` | Physics / Nature of Code experiments |
| `noise/` | Noise algorithm demos |
| `trees/` | Tree generation (fractal, L-system, random walk) |

## Rendering modes

**Most sketches:** local `lib/p5.min.js` via `<script src="/lib/p5.min.js">`  
**p5play sketches:** q5.js + p5play v3 + planck.js from CDN. See `input/fishing-rod/index.html` for the exact CDN script order.

## Starting a new sketch

1. Copy `_template/` folder into the appropriate category directory.
2. Open `index.html`, update title, and add any required `<script>` tags for helpers.
3. Edit `sketch.js` — always start with `document.title = 'Title';`.

## HTML conventions

- Body: dark background `#1b1b1b`, grid-centered via CSS in `<style>` (see any index.html)
- Script order: p5 library → sketch → helpers
- `src` paths for helpers use absolute path from root: `/helpers/mover.js`

## Sketch conventions

- `document.title = 'My Sketch';` as first line of `sketch.js`
- p5.js global mode: `setup()`, `draw()`, `createCanvas()`, `background()`, etc.
- State lives in module-scoped globals: `let mover;`
- Can use `let`-style private globals for movement state variables
- p5play sketches: use `Sprite`, `Group`, `camera`, `allSprites`
- p5play animation loop: `setup()` creates sprites, `update()` runs physics, `draw()` renders

## TypeScript / Intellisense

`tsconfig.json` enables `@types/p5` global types for JS files. All code is plain JS (`.js`), not TypeScript.

## Build / test / lint

None. No build step, no test runner, no linter, no formatter. Serve with any static file server.
