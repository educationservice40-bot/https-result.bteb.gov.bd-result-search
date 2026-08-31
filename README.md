# Education Service 40

A service website for academic document support — university certificates,
transcripts, recommendation letters, Medium of Instruction certificates,
attestation, and the rest of an application file — with the **BTEB result
search** portal hosted alongside it at `/result-search`.

Six service pages, each with its own description, its own Google Drive folder
link, and its own enquiry form. Every public page is prerendered to a static
HTML file at build time, so a crawler and a visitor on a slow connection both
get real markup with a real `<title>`, and the React bundle takes over from
there.

## Change these five things before launch

Everything editable lives in [`src/site/content.ts`](src/site/content.ts).
Nothing else in `src/site/` hard-codes copy.

| What | Where | Why it matters |
| --- | --- | --- |
| `SITE.url` | `SITE` | Empty by default. Until it is your real origin the build writes no `sitemap.xml`, and Open Graph tags are omitted, because both need absolute URLs. |
| `SITE.phone`, `SITE.whatsapp`, `SITE.address` | `SITE` | Empty rows do not render, so the site is correct while they are blank — it just has less on it. |
| `driveUrl` on each service | `SERVICES` | The Google Drive link on that service's page. Blank shows an honest "not published yet" note instead of a dead button. |
| `TEAM` | — | **Ships as obvious placeholders.** Invented colleagues are very easy to publish by accident, so the defaults refuse to look real. |
| `TESTIMONIALS` | — | **Ships as obvious placeholders too**, and for a stronger reason: an invented review is a fabricated record. Replace them with real, permissioned quotes or delete the array — the page renders a clean empty state either way. |

### Google Drive links

Paste the **share** URL, not the address bar of a folder you have open:

- folder — `https://drive.google.com/drive/folders/<id>`
- single file — `https://drive.google.com/file/d/<id>/view`

Then set that item's sharing to **Anyone with the link · Viewer**. Without it,
visitors land on a Google sign-in wall rather than your documents.

### Where enquiries go

There is no server here, so the contact form has two modes.

**Default — no configuration.** The form opens the visitor's mail client with
everything filled in and says so. Works the moment you deploy; useless to a
visitor with no mail client set up, which on a phone is most of them.

**Recommended — a form endpoint.** Set `VITE_CONTACT_ENDPOINT` at build time and
the form POSTs JSON there instead, without the visitor leaving the page. Any
service that accepts a JSON POST works — Formspree, Web3Forms, Getform, Basin,
a Google Apps Script, your own handler:

```bash
VITE_CONTACT_ENDPOINT=https://formspree.io/f/xxxxxxxx npm run build
```

The payload is `{ name, email, phone, service, message, subject }`. A non-2xx
response is shown to the visitor along with the email address to write to
instead, so a misconfigured endpoint never silently swallows an enquiry.

## Running it

Node ^20.19 or >=22.12, which is what Vite 8 requires.

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # type-check, bundle, then prerender every page
npm run preview    # serve the built site
npm test           # unit tests
npm run typecheck
```

## Deploying

`dist/` is a plain static directory. Every public address is a real file:

```
dist/index.html                              /
dist/services/index.html                     /services
dist/services/medium-of-instruction/…        /services/medium-of-instruction
dist/team/index.html                         /team
…
dist/404.html                                anything else
dist/robots.txt, dist/sitemap.xml
```

So no SPA rewrite rules are needed for the website — point any static host at
`dist/` and serve `404.html` for unmatched paths, which is the default on
Netlify, Cloudflare Pages, Vercel and GitHub Pages.

The one thing that does need configuring is the result portal's API. It calls a
same-origin `/api/public`, which must be forwarded to
`https://result.bteb.gov.bd` — and the proxy has to rewrite one header.

### The Origin header

**The board answers `POST /result` with a bare 403 unless the request's `Origin`
is `https://result.bteb.gov.bd`.** No CORS message, no body — just 403. Browsers
send `Origin` on every same-origin POST (they omit it only for GET and HEAD), so
a proxy that forwards it verbatim breaks every lookup while leaving the three
GET endpoints working. The symptom is a portal that loads its curricula and its
security check perfectly and then answers every search with "the result could
not be retrieved".

`vite.config.ts` sets the header for `npm run dev` and `npm run preview`.
Whatever proxies `/api/public` in production must do the same:

```nginx
location /api/public/ {
    proxy_pass https://result.bteb.gov.bd/api/public/;
    proxy_set_header Host   result.bteb.gov.bd;
    proxy_set_header Origin https://result.bteb.gov.bd;
}
```

```caddy
handle /api/public/* {
    reverse_proxy https://result.bteb.gov.bd {
        header_up Host   result.bteb.gov.bd
        header_up Origin https://result.bteb.gov.bd
    }
}
```

A Netlify or Cloudflare Pages *redirect* rule cannot set an outgoing request
header, so the rule in [`public/_redirects`](public/_redirects) gets the GETs
through but not the lookup. On those hosts the portal needs a function or worker
in front of the board that rewrites `Origin`. The website itself is unaffected
either way — it is static files and calls nothing.

For the same reason, building with
`VITE_API_BASE=https://result.bteb.gov.bd/api/public` and skipping the proxy
does not work for the lookup: the browser would send your site's own origin and
be refused. The GETs would succeed, which is what makes this failure look like a
bug in the search rather than in the deployment.

## How the prerendering works

`npm run build` runs three things in order:

1. `vite build` — the normal client bundle, and `dist/index.html`.
2. `vite build --ssr src/entry-server.tsx` — the same components, built for Node.
3. `scripts/prerender.mjs` — renders every address in `indexablePaths()` to
   markup, splices it into the template between the `<!--seo-->` markers in
   `index.html`, and writes one file per page. It also writes `404.html`,
   `robots.txt`, `sitemap.xml`, and the untouched shell for the two result
   portal addresses.

Each file's root element carries `data-prerendered="/the/path"`. The browser
checks it against the address it is actually on before hydrating: a host that
falls back to `index.html` for an unknown path would otherwise hand the home
page's markup to a page that is not the home page, and React would graft one
tree onto another. When they disagree, the markup is discarded and the page
renders fresh.

Page metadata is produced once, in `src/site/seo.ts`, and consumed twice — by
the prerenderer and by client-side navigation — so a crawler and a visitor never
see different `<title>`, description, canonical or structured data.

**No `Review` or `AggregateRating` structured data is emitted**, deliberately.
Review stars in a search result have to be earned from real, consented reviews,
and structured data is the wrong place to discover that the sample testimonials
shipped to production. Add them yourself once the quotes on the page are real.

## The result portal

`/result-search` and `/result-search/result` are a client for the board's public
result API — the same endpoints the official portal at
<https://result.bteb.gov.bd/result-search> calls. Nothing is scraped and no
credentials are involved: the security check the board issues is shown to the
student and their answer is passed straight back.

**Search** asks for the examination, curriculum, semester or class, exam year,
roll number, registration number, and the answer to a security check. Each
choice narrows the next. On result day the form re-shapes itself:
`/active-publications` is polled once a minute, and while it reports a
publication the lists are cut down to what was actually published that day.

**Transcript** renders what came back and prints on one A4 page. Which columns
it shows depends on the publication:

| Condition | Effect |
| --- | --- |
| `marksVisible` | Full and obtained marks columns appear |
| Credit-based curriculum | Credit hour and grade point columns appear |
| Non-credit curriculum | Student type and date of birth appear in the identity block |
| Final semester reached | The per-semester GPA ladder and the CGPA appear |
| Optional subjects present | A second grade block and a GPA-with-optional line appear |

The result is handed over in `sessionStorage` and cleared as soon as it is read,
so a transcript does not reappear for whoever opens the tab next on a shared
computer.

| Endpoint | Purpose |
| --- | --- |
| `GET /curriculums` | The curriculum catalogue |
| `GET /captcha` | A security check: `{ image, question, token, expiresIn }` |
| `GET /active-publications` | What was published today, if anything |
| `POST /result` | The lookup, answered with `{ code, message, data }` |

The portal deliberately shares no layout with the website. It is dressed as the
government form it mirrors — white paper, board green, a letterhead carrying the
board's own mark and the national emblem. Those are the board's marks, not this
project's, and the portal should not be deployed anywhere it could be mistaken
for the official one. The website's palette, structure and footer are different
for the same reason, and the footer says in as many words that this is an
independent service with no government affiliation.

## Layout

```
src/
  site/            The public website
    content.ts       All copy, services, team, testimonials, FAQ — the file to edit
    routes.ts        Every address, resolved without a routing library
    seo.ts           Titles, descriptions, canonicals, Open Graph, JSON-LD
    enquiry.ts       The contact form's model, validation and delivery
    nav.tsx          Real <a> links that intercept only the plain left-click
    Layout.tsx       Header, navigation, footer
    ContactForm.tsx  One form, reused per service with that service preselected
    pieces.tsx       Cards, panels, breadcrumbs, the Drive link
    pages/           Home, Services, ServiceDetail, Team, Testimonials, Contact, NotFound
  components/      The result portal: SearchPage, ResultPage, Masthead, Select
  api.ts           Typed client for the board's four endpoints
  constants.ts     Examination families, semester ladders, result-day narrowing
  validate.ts      Portal form validation
  format.ts        GPA, empty cells, pass/fail, the Dhaka-time stamp
  router.ts        Which of the two apps owns the current path
  entry-server.tsx Build-time rendering entry
  styles/          base, search, result, site (loaded in cascade order)
scripts/
  prerender.mjs    Writes one static HTML file per page
```

The logic worth testing is kept out of the components: `routes.ts`, `seo.ts`,
`enquiry.ts`, `constants.ts`, `validate.ts` and `format.ts` are pure and covered
by unit tests.
