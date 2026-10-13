const test = require("node:test");
const assert = require("node:assert/strict");
const { WORDS, RULES } = require("../js/words.js");

test("every word has the required fields", () => {
  for (const entry of WORDS) {
    assert.ok(entry.word, "word is missing");
    assert.ok(["der", "die", "das"].includes(entry.article), `${entry.word}: bad article`);
    assert.ok(["everyday", "service"].includes(entry.category), `${entry.word}: bad category`);
    assert.ok(entry.en && entry.ar, `${entry.word}: missing a translation`);
  }
});

test("there are no duplicate words", () => {
  const seen = new Set();
  for (const { word } of WORDS) {
    assert.ok(!seen.has(word), `duplicate word: ${word}`);
    seen.add(word);
  }
});

test("each category has all three articles", () => {
  for (const category of ["everyday", "service"]) {
    const articles = new Set(WORDS.filter((w) => w.category === category).map((w) => w.article));
    assert.deepEqual([...articles].sort(), ["das", "der", "die"], `${category} is missing an article`);
  }
});

test("every rule key used by a word exists", () => {
  for (const entry of WORDS.filter((w) => w.rule)) {
    assert.ok(RULES[entry.rule], `${entry.word}: unknown rule "${entry.rule}"`);
  }
});

test("a word's rule matches its spelling and its article", () => {
  // This protects against wrong tips, for example showing the -chen rule for "Kuchen".
  for (const entry of WORDS.filter((w) => w.rule)) {
    const rule = RULES[entry.rule];
    assert.ok(
      entry.word.toLowerCase().endsWith(rule.suffix),
      `${entry.word} does not end with -${rule.suffix}`
    );
    assert.equal(entry.article, rule.article, `${entry.word}: rule says ${rule.article}, word says ${entry.article}`);
  }
});

test("words that look like a rule but are exceptions have no rule", () => {
  const kuchen = WORDS.find((w) => w.word === "Kuchen");
  assert.equal(kuchen.article, "der");
  assert.equal(kuchen.rule, undefined);
});
