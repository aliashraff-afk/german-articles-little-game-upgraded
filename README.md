# der · die · das: German articles quiz

A small browser game for practicing German noun articles. Each round asks for the article (**der**, **die** or **das**) of a random noun, gives instant feedback, and remembers the words you miss so you can practice them later.


## Features

- 80 nouns in two categories: **everyday** words and **customer service** vocabulary (Rechnung, Bestellung, Kündigung, Passwort, ...).
- Rounds of 10 or 20 questions, with a progress bar that marks every answer.
- **Weak-word practice:** words you miss more often than you get right are saved and can be drilled in their own round.
- Meaning hints in English or Arabic, or turned off.
- Gender-rule tips after the answer for words that follow a reliable suffix rule (-ung, -heit, -keit, -schaft, -tion, -ität, -chen, -ling, -ismus).
- Score, streak, longest streak, and a review list of the words you missed.
- Settings and progress are saved in the browser (`localStorage`). Nothing is sent anywhere.
- Keyboard play: press **1**, **2** or **3**, then **Enter** for the next question.
- Light and dark mode, and a layout that works from 320 px phones to desktop.

## What this project shows

- **Separation of concerns:** the quiz logic (`js/logic.js`) is pure functions with no DOM code, and the interface (`js/app.js`) only connects it to the page.
- **Automated tests:** 18 unit tests with Node's built-in test runner, including checks that protect the word data (no duplicate words, every tip matches the word's spelling and article).
- **Defensive state handling:** saved data is validated when it is loaded, storage errors are caught, and a single `state` object drives each round.
- **Accessibility:** visible keyboard focus, focus moved between screens, an `aria-live` status for feedback, `lang` and `dir` set on German and Arabic text, `prefers-reduced-motion` respected, and results shown with marks and patterns as well as color.
- **No dependencies and no build step:** plain HTML, CSS and JavaScript. It uses system fonts, so it makes no third-party requests.

## Run it locally

Open `index.html` in a browser. That is all.

If you prefer a local server:

```bash
npx serve .
```

## Run the tests

You need Node.js 20 or newer. There is nothing to install.

```bash
npm test
```

## Project structure

```text
german-articles-quiz/
├── index.html          Page structure (start, quiz and result screens)
├── style.css           Styles, color tokens, light and dark themes
├── js/
│   ├── words.js        Word list and gender rules (data only)
│   ├── logic.js        Shuffle, question picking, stats (pure functions)
│   └── app.js          Interface code: events, rendering, saving
├── test/
│   ├── data.test.js    Checks the word list
│   └── logic.test.js   Checks the quiz logic
└── assets/             Screenshots used in this README
```

## Deploy with GitHub Pages

1. Create a new repository named `german-articles-quiz` on GitHub and push these files to the `main` branch.
2. Open the repository, then **Settings**, then **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, then save.
4. After a minute, the site is live at `https://YOUR-USERNAME.github.io/german-articles-quiz/`.
5. Replace `YOUR-USERNAME` in this README, in `index.html` (the "Source on GitHub" link) and in `LICENSE`.

## Design notes

- **Colors** follow a convention used in many German textbooks: der is blue, die is red, das is green. The same colors appear on the answer keys, in the logo and in the filled-in article.
- **Answer keys** look like keyboard keys and show their shortcut number, because the quiz can be played from the keyboard.
- **The article slot** in front of each noun starts empty and fills with the right article after you answer, so the sentence reads as a complete noun phrase.

## Adding words and rules

Words live in `js/words.js`:

```js
e("everyday", "der", "Tisch", "table", "طاولة"),
e("service", "die", "Rechnung", "invoice", "فاتورة", "ung"),
```

The last value is an optional rule key. Rules are attached by hand rather than guessed from spelling, because some words only look like a rule: **der Kuchen** ends in -chen but is not a diminutive. The tests check that every rule matches its word, so a wrong tip fails the build.

## Ideas for next versions

- Spaced repetition: show weak words again after a growing delay.
- Audio pronunciation with the Web Speech API.
- Plural forms and cases (Akkusativ, Dativ) as extra quiz modes.
- A React version of the interface using the same `logic.js`.

## License

MIT. See [LICENSE](LICENSE).
