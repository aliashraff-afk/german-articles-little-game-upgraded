const test = require("node:test");
const assert = require("node:assert/strict");
const Logic = require("../js/logic.js");
const { WORDS, RULES } = require("../js/words.js");

// A small predictable random generator, so shuffles are repeatable in tests.
function seededRng(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

test("shuffle keeps every item and does not change the input", () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const copyOfInput = [...input];
  const result = Logic.shuffle(input, seededRng(1));

  assert.deepEqual(input, copyOfInput);
  assert.deepEqual([...result].sort((a, b) => a - b), copyOfInput);
});

test("shuffle gives the same order for the same random generator", () => {
  const a = Logic.shuffle([1, 2, 3, 4, 5, 6], seededRng(42));
  const b = Logic.shuffle([1, 2, 3, 4, 5, 6], seededRng(42));
  assert.deepEqual(a, b);
});

test("pickQuestions returns the requested number of unique words", () => {
  const questions = Logic.pickQuestions(WORDS, { count: 10 }, seededRng(7));
  assert.equal(questions.length, 10);
  assert.equal(new Set(questions.map((q) => q.word)).size, 10);
});

test("pickQuestions respects the category", () => {
  const questions = Logic.pickQuestions(WORDS, { category: "service", count: 20 }, seededRng(3));
  assert.equal(questions.length, 20);
  assert.ok(questions.every((q) => q.category === "service"));
});

test("pickQuestions never returns more words than exist", () => {
  const few = [WORDS[0], WORDS[1], WORDS[2]];
  assert.equal(Logic.pickQuestions(few, { count: 10 }).length, 3);
});

test("recordAnswer counts right and wrong answers without changing the old stats", () => {
  const empty = {};
  const first = Logic.recordAnswer(empty, "Tisch", false);
  const second = Logic.recordAnswer(first, "Tisch", true);

  assert.deepEqual(empty, {});
  assert.deepEqual(first, { Tisch: { right: 0, wrong: 1 } });
  assert.deepEqual(second, { Tisch: { right: 1, wrong: 1 } });
});

test("getWeakWords returns words missed more than answered correctly, worst first", () => {
  const stats = {
    Tisch: { right: 0, wrong: 3 }, // gap 3
    Hund: { right: 1, wrong: 2 }, // gap 1
    Katze: { right: 2, wrong: 2 }, // gap 0, not weak
    Haus: { right: 5, wrong: 1 }, // not weak
  };
  const weak = Logic.getWeakWords(WORDS, stats).map((w) => w.word);
  assert.deepEqual(weak, ["Tisch", "Hund"]);
});

test("pickQuestions in weak mode uses only weak words, from every category", () => {
  const stats = {
    Tisch: { right: 0, wrong: 2 }, // everyday
    Rechnung: { right: 0, wrong: 1 }, // service
    Haus: { right: 4, wrong: 0 },
  };
  const questions = Logic.pickQuestions(WORDS, { category: "everyday", count: 10, weakOnly: true, stats });
  assert.deepEqual(questions.map((q) => q.word).sort(), ["Rechnung", "Tisch"]);
});

test("pickQuestions in weak mode keeps the most-missed words when there are too many", () => {
  const stats = {
    Tisch: { right: 0, wrong: 5 },
    Hund: { right: 0, wrong: 4 },
    Katze: { right: 0, wrong: 1 },
  };
  const questions = Logic.pickQuestions(WORDS, { count: 2, weakOnly: true, stats });
  assert.deepEqual(questions.map((q) => q.word).sort(), ["Hund", "Tisch"]);
});

test("accuracy rounds and handles an empty round", () => {
  assert.equal(Logic.accuracy(8, 10), 80);
  assert.equal(Logic.accuracy(1, 3), 33);
  assert.equal(Logic.accuracy(0, 0), 0);
});

test("getRuleTip returns the tip for rule words and nothing for the rest", () => {
  const zeitung = WORDS.find((w) => w.word === "Zeitung");
  const tisch = WORDS.find((w) => w.word === "Tisch");
  assert.match(Logic.getRuleTip(zeitung, RULES), /-ung/);
  assert.equal(Logic.getRuleTip(tisch, RULES), "");
});

test("countByCategory counts every word once", () => {
  const counts = Logic.countByCategory(WORDS);
  assert.equal(counts.all, WORDS.length);
  assert.equal(counts.everyday + counts.service, WORDS.length);
});
