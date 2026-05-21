import { scoreMatchPrediction } from "./scoring";

function assert(label: string, actual: number, expected: number) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

assert("exact score", scoreMatchPrediction(3, 2, 3, 2), 5);
assert("goal difference", scoreMatchPrediction(3, 2, 2, 1), 2);
assert("winner only", scoreMatchPrediction(2, 0, 1, 0), 1);
assert("wrong", scoreMatchPrediction(0, 2, 2, 0), 0);
assert("draw winner", scoreMatchPrediction(1, 1, 0, 0), 2);

console.log("All scoring tests passed.");
