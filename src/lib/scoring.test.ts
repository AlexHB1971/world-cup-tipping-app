import { scoreMatchPrediction } from "./scoring";

function assert(label: string, actual: number, expected: number) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

// Exact score
assert("exact score (win)", scoreMatchPrediction(3, 2, 3, 2), 5);
assert("exact score (draw)", scoreMatchPrediction(1, 1, 1, 1), 5);
assert("exact score (0-0)", scoreMatchPrediction(0, 0, 0, 0), 5);

// Goal difference (non-draw)
assert("goal diff +1", scoreMatchPrediction(3, 2, 2, 1), 2);
assert("goal diff -2", scoreMatchPrediction(0, 2, 1, 3), 2);

// Winner / draw (1 pt)
assert("winner only", scoreMatchPrediction(2, 0, 1, 0), 1);
assert("draw, not exact", scoreMatchPrediction(1, 1, 0, 0), 1);
assert("draw, not exact (other way)", scoreMatchPrediction(0, 0, 2, 2), 1);

// Wrong
assert("wrong outcome", scoreMatchPrediction(0, 2, 2, 0), 0);
assert("predicted draw, actual win", scoreMatchPrediction(1, 1, 2, 0), 0);
assert("predicted win, actual draw", scoreMatchPrediction(2, 0, 1, 1), 0);

console.log("All scoring tests passed.");
