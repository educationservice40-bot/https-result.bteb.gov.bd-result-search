# BTEB Result Search

A result search portal for the **Bangladesh Technical Education Board**, covering
the two pages a student actually uses on result day: a search form, and the
transcript it returns.

It is a client for the board's public result API at
`https://result.bteb.gov.bd/api/public` — the same endpoints the official portal
at <https://result.bteb.gov.bd/result-search> calls. Nothing is scraped and no
credentials are involved: the security check the board issues is shown to the
student and their answer is passed straight back, so a lookup here is exactly a
lookup there.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173/result-search
```

The dev server proxies `/api/public` to the board, so the app talks to a
same-origin API in development exactly as it does in production. Point it
somewhere else with `BTEB_UPSTREAM`:

```bash
BTEB_UPSTREAM=https://staging.example.gov.bd npm run dev
```

```bash
npm run build      # type-check, then bundle to dist/
npm run preview    # serve the bundle
npm test           # unit tests
npm run typecheck
```

`dist/` is a static bundle. Serve it behind a reverse proxy that forwards
`/api/public` to the board, and rewrite unknown paths to `index.html` so
`/result-search/result` resolves on a hard refresh. Without a proxy in front,
set `VITE_API_BASE=https://result.bteb.gov.bd/api/public` at build time — the
board's API does send permissive CORS headers — but a proxy is the better
default, since it keeps the origin single and the API base out of the bundle.

## The two pages

**Search** (`/result-search`) asks for the examination, curriculum, semester or
class, exam year, roll number, registration number, and the answer to a security
check. Each choice narrows the next: picking an examination decides which
curricula are offered, and the curriculum decides whether the third field counts
semesters or classes.

On result day the form re-shapes itself. `/active-publications` is polled once a
minute; while it reports a publication, the examination field disappears and the
curriculum, semester and year lists are cut down to what was actually published
that day, so a student cannot search for a result that does not exist yet.

**Transcript** (`/result-search/result`) renders what came back and prints on one
A4 page. Which columns it shows depends on the publication rather than on a
fixed layout:

| Condition | Effect |
| --- | --- |
| `marksVisible` | Full and obtained marks columns appear |
| Credit-based curriculum | Credit hour and grade point columns appear |
| Non-credit curriculum | Student type and date of birth appear in the identity block |
| Final semester reached | The per-semester GPA ladder and the CGPA appear |
| Optional subjects present | A second grade block and a GPA-with-optional line appear |

The result is handed over in `sessionStorage` and cleared as soon as it is read,
so a transcript does not reappear for whoever opens the tab next on a shared
computer. Landing on `/result-search/result` directly falls back to the form.

## API

All four endpoints are public and unauthenticated.

| Endpoint | Purpose |
| --- | --- |
| `GET /curriculums` | The curriculum catalogue |
| `GET /captcha` | A security check: `{ image, question, token, expiresIn }` |
| `GET /active-publications` | What was published today, if anything |
| `POST /result` | The lookup, answered with `{ code, message, data }` |

A lookup posts `curriculumCode`, `rollNo`, `regNo`, `semester`, `examYear`,
`captchaToken` and `captchaAnswer`. A wrong security check comes back as
`code: "CAPTCHA_INVALID"`, which re-issues the challenge in place rather than
losing the form; anything else without a result is shown as "not found".

## Layout

```
src/
  api.ts          Typed client for the four endpoints
  types.ts        The API's response shapes
  constants.ts    Examination families, semester ladders, result-day narrowing
  validate.ts     Form validation and input sanitising
  format.ts       GPA, empty cells, pass/fail, the Dhaka-time stamp
  router.ts       Two paths; no routing library
  components/     SearchPage, ResultPage, Masthead, Select
  styles/         base, search, result (loaded in cascade order from main.tsx)
```

The logic that is worth testing is kept out of the components: `constants.ts`,
`validate.ts` and `format.ts` are pure and covered by unit tests.

## Notes

The marks in the masthead are neutral placeholders. The board's own emblems are
not redistributed here; drop the real assets in `public/` and point the
`Masthead` component at them for a deployment that represents the board.
