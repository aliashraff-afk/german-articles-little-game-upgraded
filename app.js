/*
 * Interface code: connects the quiz logic to the page.
 * All saved data (settings, word stats, best streak) lives in localStorage.
 */
(function () {
  "use strict";

  const { WORDS, RULES } = window.QuizData;
  const Logic = window.QuizLogic;

  const STORAGE_KEY = "german-articles-quiz:v1";
  const KEY_TO_ARTICLE = { 1: "der", 2: "die", 3: "das" };
  const VALID = { category: ["all", "everyday", "service"], length: [10, 20], hints: ["en", "ar", "off"] };
  const DEFAULT_SETTINGS = { category: "all", length: 10, hints: "en" };

  const $ = (id) => document.getElementById(id);
  const screens = { start: $("start-screen"), quiz: $("quiz-screen"), result: $("result-screen") };
  const keys = [...document.querySelectorAll(".key")];
  const els = {
    progressText: $("progress-text"),
    ticks: $("ticks"),
    score: $("score"),
    streak: $("streak"),
    slot: $("slot"),
    word: $("word"),
    hint: $("hint"),
    feedback: $("feedback"),
    tip: $("tip"),
    next: $("next"),
    resultTitle: $("result-title"),
    resultSub: $("result-sub"),
    review: $("review"),
    weakButtons: [$("start-weak"), $("result-weak")],
    weakNote: $("weak-note"),
  };

  // ---------- Saved data ----------
  function loadSaved() {
    const saved = { settings: { ...DEFAULT_SETTINGS }, stats: {}, bestStreak: 0 };
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!raw || typeof raw !== "object") return saved;

      const s = raw.settings || {};
      if (VALID.category.includes(s.category)) saved.settings.category = s.category;
      if (VALID.length.includes(Number(s.length))) saved.settings.length = Number(s.length);
      if (VALID.hints.includes(s.hints)) saved.settings.hints = s.hints;
      if (raw.stats && typeof raw.stats === "object") saved.stats = raw.stats;
      saved.bestStreak = Number(raw.bestStreak) || 0;
    } catch {
      // Storage can be blocked or corrupted. Start fresh; the quiz still works.
    }
    return saved;
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Ignore: progress just won't be remembered.
    }
  }

  let saved = loadSaved();
  let round = null; // state of the round in progress
  let lastWeakOnly = false; // so "Play again" repeats the same mode

  // ---------- Screens ----------
  function showScreen(name) {
    Object.entries(screens).forEach(([key, section]) => {
      section.hidden = key !== name;
    });
    const heading = screens[name].querySelector('[tabindex="-1"]');
    if (heading) heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function weakCount() {
    return Logic.getWeakWords(WORDS, saved.stats).length;
  }

  function renderWeakUi() {
    const count = weakCount();
    els.weakButtons.forEach((button) => {
      button.textContent = `Practice weak words (${count})`;
      button.disabled = count === 0;
    });
    els.weakNote.textContent =
      count === 0
        ? "Weak words appear here when you miss a word more often than you get it right."
        : "Weak-word practice uses the words you miss most, from all categories.";
  }

  // ---------- Settings ----------
  function renderSettings() {
    const counts = Logic.countByCategory(WORDS);
    document.querySelectorAll("[data-category-label]").forEach((label) => {
      const key = label.dataset.categoryLabel;
      const base = label.textContent.replace(/\s*\(\d+\)$/, "");
      label.textContent = `${base} (${counts[key]})`;
    });
    Object.entries(saved.settings).forEach(([name, value]) => {
      const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
      if (input) input.checked = true;
    });
  }

  document.querySelectorAll(".seg input").forEach((input) => {
    input.addEventListener("change", () => {
      const read = (name) => document.querySelector(`input[name="${name}"]:checked`).value;
      saved.settings = {
        category: read("category"),
        length: Number(read("length")),
        hints: read("hints"),
      };
      persist();
    });
  });

  // ---------- Round ----------
  function startRound(weakOnly) {
    const questions = Logic.pickQuestions(WORDS, {
      category: saved.settings.category,
      count: saved.settings.length,
      weakOnly,
      stats: saved.stats,
    });
    if (questions.length === 0) return;

    lastWeakOnly = weakOnly;
    round = { questions, index: 0, score: 0, streak: 0, longest: 0, answered: false, results: [], mistakes: [] };
    showScreen("quiz");
    showQuestion();
  }

  function setHint(entry) {
    const mode = saved.settings.hints;
    els.hint.textContent = mode === "ar" ? entry.ar : mode === "en" ? entry.en : "";
    els.hint.lang = mode === "ar" ? "ar" : "en";
    els.hint.dir = mode === "ar" ? "rtl" : "ltr";
  }

  function renderTicks() {
    els.ticks.replaceChildren();
    round.questions.forEach((_, i) => {
      const tick = document.createElement("span");
      tick.className = "tick";
      if (round.results[i] === true) tick.classList.add("right");
      else if (round.results[i] === false) tick.classList.add("wrong");
      else if (i === round.index) tick.classList.add("current");
      els.ticks.append(tick);
    });
  }

  function renderMeter() {
    els.score.textContent = round.score;
    els.streak.textContent = round.streak;
  }

  function showQuestion() {
    const entry = round.questions[round.index];
    round.answered = false;

    els.word.textContent = entry.word;
    els.slot.textContent = "";
    els.slot.className = "slot";
    els.slot.removeAttribute("data-article");
    setHint(entry);

    els.feedback.textContent = "";
    els.tip.textContent = "";
    els.next.hidden = true;
    keys.forEach((key) => {
      key.disabled = false;
      key.classList.remove("correct", "wrong", "dim");
    });

    els.progressText.textContent = `Question ${round.index + 1} of ${round.questions.length}`;
    renderMeter();
    renderTicks();
    keys[0].focus({ preventScroll: true });
  }

  function handleAnswer(chosen) {
    if (!round || round.answered) return;
    round.answered = true;

    const entry = round.questions[round.index];
    const isCorrect = chosen === entry.article;

    saved.stats = Logic.recordAnswer(saved.stats, entry.word, isCorrect);
    round.results[round.index] = isCorrect;
    if (isCorrect) {
      round.score += 1;
      round.streak += 1;
      round.longest = Math.max(round.longest, round.streak);
    } else {
      round.streak = 0;
      round.mistakes.push(entry);
    }
    saved.bestStreak = Math.max(saved.bestStreak, round.longest);
    persist();

    els.slot.textContent = entry.article;
    els.slot.dataset.article = entry.article;
    els.slot.classList.add("filled");
    els.feedback.textContent = isCorrect
      ? `Richtig! ${entry.article} ${entry.word}.`
      : `Not quite. It's ${entry.article} ${entry.word}.`;
    els.tip.textContent = Logic.getRuleTip(entry, RULES);

    keys.forEach((key) => {
      key.disabled = true;
      const article = key.dataset.article;
      if (article === entry.article) key.classList.add("correct");
      else if (article === chosen) key.classList.add("wrong");
      else key.classList.add("dim");
    });

    const isLast = round.index === round.questions.length - 1;
    els.next.textContent = isLast ? "See results" : "Next";
    els.next.hidden = false;
    els.next.focus({ preventScroll: true });
    renderMeter();
    renderTicks();
  }

  function goNext() {
    round.index += 1;
    if (round.index >= round.questions.length) showResult();
    else showQuestion();
  }

  // ---------- Results ----------
  function showResult() {
    const total = round.questions.length;
    const percent = Logic.accuracy(round.score, total);

    els.resultTitle.textContent = `${round.score} of ${total} right`;

    let message = "Keep going. Repetition builds the feeling for gender.";
    if (percent >= 90) message = "Excellent work.";
    else if (percent >= 70) message = "Solid round. The words below need another look.";
    els.resultSub.textContent =
      `${percent}% correct. ${message} Longest streak this round: ${round.longest}. Best streak so far: ${saved.bestStreak}.`;

    renderReview();
    renderWeakUi();
    showScreen("result");
    round = null;
  }

  function renderReview() {
    els.review.replaceChildren();

    if (round.mistakes.length === 0) {
      const none = document.createElement("p");
      none.className = "muted";
      none.textContent = "No mistakes this round.";
      els.review.append(none);
      return;
    }

    const title = document.createElement("h3");
    title.textContent = "Words to review";
    const list = document.createElement("ul");

    round.mistakes.forEach((entry) => {
      const item = document.createElement("li");

      const article = document.createElement("span");
      article.className = "art";
      article.dataset.article = entry.article;
      article.textContent = entry.article;

      const noun = document.createElement("span");
      noun.className = "noun";
      noun.lang = "de";
      noun.textContent = entry.word;

      const meaning = document.createElement("span");
      meaning.className = "meaning";
      const useArabic = saved.settings.hints === "ar";
      meaning.lang = useArabic ? "ar" : "en";
      meaning.dir = useArabic ? "rtl" : "ltr";
      meaning.textContent = useArabic ? entry.ar : entry.en;

      item.append(article, noun, meaning);
      list.append(item);
    });

    els.review.append(title, list);
  }

  // ---------- Events ----------
  keys.forEach((key) => key.addEventListener("click", () => handleAnswer(key.dataset.article)));
  els.next.addEventListener("click", goNext);

  $("start-round").addEventListener("click", () => startRound(false));
  $("start-weak").addEventListener("click", () => startRound(true));
  $("play-again").addEventListener("click", () => startRound(lastWeakOnly));
  $("result-weak").addEventListener("click", () => startRound(true));
  $("change-settings").addEventListener("click", () => {
    renderWeakUi();
    showScreen("start");
  });
  $("end-round").addEventListener("click", () => {
    round = null;
    renderWeakUi();
    showScreen("start");
  });

  $("reset-progress").addEventListener("click", () => {
    if (!window.confirm("Reset all saved progress on this device?")) return;
    saved = { settings: { ...DEFAULT_SETTINGS }, stats: {}, bestStreak: 0 };
    persist();
    renderSettings();
    renderWeakUi();
  });

  // Keys 1, 2 and 3 answer the current question.
  document.addEventListener("keydown", (event) => {
    if (!round || round.answered || screens.quiz.hidden) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const article = KEY_TO_ARTICLE[event.key];
    if (article) handleAnswer(article);
  });

  // ---------- Start ----------
  renderSettings();
  renderWeakUi();
})();
