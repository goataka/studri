---
name: studri-app-creator
description: Create or extend a child-friendly Studri learning app when asked to make a Studri app or a themed edition such as “スタドリアプリの〇〇編”. Apply the shared product, learning-cycle, input, and review requirements below.
---

# Studri App Creator

Create a learning app for the user's requested theme using the shared Studri requirements in this skill. A request for a specific edition (for example, “スタドリアプリの〇〇編”) supplies the theme. If no theme is given, ask one concise clarifying question before building.

## Before implementation

- Inspect the repository to understand its existing app, framework, assets, and available validation commands. Extend the existing project and conventions; do not replace unrelated work.
- Use `studri.jpeg` from this repository as the visual reference for the characters, tone, and world. Keep the design cute and polished for elementary and middle-school students, with a simple, game-like interface and no redundant features.
- Make the app responsive for tablets and, where practical, phones.
- Use the requested theme in the title in the form **「スタドリ - [指定テーマ]編」**.
- Show the app generation date and time as a version in a footer fixed to the bottom of the screen. Generate the timestamp when creating the app; do not substitute the current runtime time.
- The app is intended to run on an external site. Do not use Gemini, generative AI services, or other external services for app functionality. Keep all learning progress and history in browser local storage. Provide a data-reset control and ask for confirmation before deleting saved data.

## Courses and learning cycle

- Offer distinct, sufficiently fine-grained courses by school grade within the applicable curriculum, plus separate courses grouped by middle-school entrance-exam difficulty. Keep content and difficulty appropriate to each course and the requested theme.
- Each course attempt has 10 questions. Unless the user specifies otherwise, select questions randomly and increase difficulty progressively within an attempt.
- Require three consecutive perfect (no-mistake) attempts to pass a course. A mistake resets the consecutive-perfect count; show progress toward passing clearly.
- Track and display the number of attempts, including replay and challenge modes. Persist course progress and records locally.
- Once a course is passed, unlock time attack and consecutive-correct streak challenges. Save and display the best records for each mode.
- Keep the question statement free of the answer, including in hints, labels, or surrounding instructions.

## Question experience

- Provide a large, clear question and answer area. Support both a handwriting canvas suitable for a tablet and a keypad input; allow both to be used without accidental duplicate submissions or ambiguous answers.
- Make the judgment flow explicit: show the currently selected/submitted answer before judging when needed, prevent double submission, and provide immediate, understandable feedback within three seconds. Use reliable local logic for answer checking; never claim that handwriting was recognized unless the app actually implements that recognition. Keep the handwriting strokes available for review and validation.
- Provide a separate notes/work area, beside the pen area or below it, for calculations and reasoning. Keep notes distinct from the answer canvas.
- Include an interruptible Back button. If a learner leaves partway through, save the attempt and its history locally.
- On a correct answer, automatically advance after three seconds and let the learner advance immediately by clicking/tapping.
- On an incorrect answer, show the correct answer with an explanation and offer **「再回答」** and **「次へ」**. When retrying, show the previous response faintly and allow another judgment.
- Add restrained, context-appropriate sound effects. Respect browser audio interaction restrictions and provide a way to mute sounds.
- After all 10 questions, show the complete answer review and a brief, encouraging performance comment without excessive celebration.

## Review, history, and validation

- Persist missed questions with their question text, learner response, correct answer, and explanation. Provide an accessible list for later review.
- Save handwriting-canvas data for review locally for the most recent two days only; automatically remove older pen data. Keep other learning history according to the app's local-history needs.
- Let learners inspect saved handwriting one question at a time and start a redo from that review. Mark a redo complete when the learner answers correctly.
- Save the answer input and associated handwriting data needed to verify judgment accuracy. Keep this verification data local and make it available in an understandable review/debug view without exposing it to an external service.

## Implementation and completion

- Keep the experience focused and usable with keyboard, touch, and tablet input. Ensure controls have clear labels, feedback is readable, and the layout works at narrow viewport sizes.
- Use the repository's existing stack and dependencies. Avoid adding dependencies or external network requirements unless the user explicitly requests them and they are essential.
- When the theme or its curriculum coverage is underspecified, choose sensible, age-appropriate content and make the course scope clear in the UI; ask only when a missing detail prevents implementation.
- After changes, run the existing relevant tests, build, and lint commands, if present. Report what was implemented and any validation that could not be run.
