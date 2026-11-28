// A 5 × 7 dot-matrix figure set, drawn for this theme. The homepage shows the latest entry's real serial number on it
// (an LED-board readout made of square dots); every cell of the board is drawn, lit or not.
const ROWS = 7;
const COLS = 5;
export const glyphs = {
  0: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  3: ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  4: ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  5: ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  6: ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  7: ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  8: [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  9: [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
};

// Lay a string of digits out on one board, one blank column between figures.
// Returns the board size and its rows; each row lists the columns of its lit and unlit cells.
export function dotMatrix(text, gap = 1) {
  const figures = [...String(text)];
  if (!figures.length) throw new Error("dotMatrix needs at least one figure");
  for (const figure of figures) if (!glyphs[figure]) throw new Error(`No dot-matrix figure for "${figure}"`);
  const width = figures.length * COLS + (figures.length - 1) * gap;
  const rows = [];
  for (let y = 0; y < ROWS; y++) {
    const on = [];
    const off = [];
    figures.forEach((figure, index) => {
      const left = index * (COLS + gap);
      [...glyphs[figure][y]].forEach((cell, x) => (cell === "#" ? on : off).push(left + x));
    });
    rows.push({ y, on, off });
  }
  return { width, height: ROWS, rows };
}

// Where a lit cell starts when the board gathers on opening: a point scattered over the board and a little beyond it,
// given as the offset from the cell's own place, in board cells. The scatter is fixed for each cell (no randomness at
// build or run time), so the page is the same on every build. `delay` (0–90 ms) keeps cells of one row from arriving
// in lockstep.
export function gatherFrom(x, y, width, height = ROWS) {
  const mix = (value) => {
    let h = Math.imul(value ^ 0x9e3779b9, 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const seed = x * 131 + y * 7919;
  const round = (value) => Math.round(value * 10) / 10;
  return {
    dx: round(-2 + mix(seed) * (width + 4) - x),
    dy: round(-2.5 + mix(seed + 1) * (height + 5) - y),
    delay: Math.round(mix(seed + 2) * 90),
  };
}
