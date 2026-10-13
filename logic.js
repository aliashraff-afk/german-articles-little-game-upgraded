/*
 * Quiz logic: pure functions with no DOM access.
 * Keeping them separate from the interface makes them easy to test.
 *
 * Works in the browser (window.QuizLogic) and in Node (module.exports).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QuizLogic = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Fisher-Yates shuffle. Returns a new array and never changes the input. */
  function shuffle(list, rng = Math.random) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /** How much more often a word was missed than answered correctly. */
  function missGap(stat) {
    return stat ? stat.wrong - stat.right : 0;
  }

  /**
   * Weak words are the ones missed more often than answered correctly.
   * `stats` looks like { Tisch: { right: 1, wrong: 3 } }.
   * The most-missed words come first.
   */
  function getWeakWords(words, stats) {
    return words
      .filter((entry) => missGap(stats[entry.word]) > 0)
      .sort((a, b) => missGap(stats[b.word]) - missGap(stats[a.word]));
  }

  /**
   * Choose the questions for one round.
   * - weakOnly: practice the most-missed words across all categories.
   * - otherwise: random words from the chosen category ("all", "everyday", "service").
   */
  function pickQuestions(words, options, rng = Math.random) {
    const { category = "all", count = 10, weakOnly = false, stats = {} } = options;

    if (weakOnly) {
      const weakest = getWeakWords(words, stats).slice(0, count);
      return shuffle(weakest, rng);
    }

    const pool = category === "all" ? words : words.filter((entry) => entry.category === category);
    return shuffle(pool, rng).slice(0, count);
  }

  /** Returns a new stats object with one more answer recorded. */
  function recordAnswer(stats, word, isCorrect) {
    const previous = stats[word] || { right: 0, wrong: 0 };
    return {
      ...stats,
      [word]: {
        right: previous.right + (isCorrect ? 1 : 0),
        wrong: previous.wrong + (isCorrect ? 0 : 1),
      },
    };
  }

  /** Percentage of correct answers, rounded. */
  function accuracy(score, total) {
    return total === 0 ? 0 : Math.round((score / total) * 100);
  }

  /** The tip text for a word, or an empty string if no rule applies. */
  function getRuleTip(entry, rules) {
    return entry.rule && rules[entry.rule] ? rules[entry.rule].text : "";
  }

  /** How many words each category has, including the "all" total. */
  function countByCategory(words) {
    const counts = { all: words.length };
    for (const entry of words) counts[entry.category] = (counts[entry.category] || 0) + 1;
    return counts;
  }

  return { shuffle, getWeakWords, pickQuestions, recordAnswer, accuracy, getRuleTip, countByCategory };
});
