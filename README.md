# Anish Maka — Portfolio (v2: real files edition)

This version fixes the main complaint from v1: pages are now **real
`.html` files** you can open and read top to bottom — nothing is
built out of JS template strings anymore. CSS lives in one file. JS
only does two things: small UI interactions, and inserting list data
into the page using safe DOM methods (never by writing HTML strings).

## Two ways to view it

**Option A — no install, no server, just open it:**
Double-click `www/index.html`. The whole site works this way —
every page, every project card, every skill pill. The only thing
that *won't* work without the server is the contact form actually
saving messages (the page tells you this plainly if you try it).

**Option B — run the small Node helper** (for the contact form, and
to view it over `http://` instead of `file://`):
```bash
node server.js
```
Then open `http://localhost:3000`. No `npm install` needed — zero
dependencies, same as before.

## Folder structure

```
www/                     <-- this is the whole website
  index.html               About page
  education.html
  skills.html
  portfolio.html
  achievements.html
  experience.html
  resume.html
  updates.html
  contact.html
  404.html
  css/style.css           One stylesheet, hand-written, no framework
  js/
    main.js                 Sidebar, theme toggle, mobile menu, scroll UI
    render.js                Turns data/*.js into page content (see below)
    contact.js                Contact form submit handling
  data/                    <-- THE FILES YOU ACTUALLY EDIT
    skills.js
    portfolio.js
    education.js
    experience.js
    achievements.js
    updates.js
  files/resume.pdf         Put your resume here

server.js                 Optional Node helper for LOCAL use only (static files + contact form)
api/contact.js            The LIVE contact form endpoint on Vercel (serverless function)
lib/                       Shared logic used by api/contact.js (validation, rate limiting)
vercel.json                Tells Vercel where the static site lives (www/)
src/                       Backend code for the local-only server.js helper
data-store/messages.json   Contact submissions land here when run locally (not on Vercel — see below)
```

## How the "dynamic part" works — and why only some content uses it

Not everything benefits from being data-driven. A single fact like
your name or email doesn't need an indirection layer — it's just
written directly in the HTML where it appears, in plain sight, easy
to find and edit.

**Things that ARE data-driven** (because they're genuinely lists you'll
add to over time): Skills, Portfolio, Education, Experience,
Achievements, Updates. Each has a file in `www/data/`, and each page
has one empty container `<div>` (e.g. `<div id="portfolio-grid">`)
that `js/render.js` fills in automatically when the page loads.

**Things that are NOT data-driven** (because there's only one of them,
ever): your name, bio, role, email, social links. These are plain
text directly in the relevant `.html` file — open `index.html` or
`contact.html` and edit the words right there.

### Adding/removing/editing a list item

Open the matching file in `www/data/`. For example, to add a project,
open `data/portfolio.js` and copy one of the existing objects:

```js
{
  id: 7,
  title: "Your Project",
  category: "WooCommerce",
  description: "One or two plain sentences.",
  tools: ["WordPress", "WooCommerce"],
  year: "2025",
  link: "https://example.com"   // leave "" for "Coming soon"
}
```

- **Add**: paste a new object into the array, give it a unique `id`.
- **Remove**: delete the object (and the comma after it).
- **Edit**: change the text between the quotes.

Save the file, refresh the page — no build step, no restart needed
(these are loaded directly by the browser). The same pattern applies
to `education.js`, `experience.js`, `achievements.js`, and
`updates.js` — each file has its exact shape documented in a comment
at the top.

### Why this is more convenient than v1

- It's a plain JS array, not JSON — so you can write comments in the
  file explaining each field (JSON can't have comments).
- No server, no build, no `fetch()` — the browser loads the array
  directly via a `<script>` tag, same as any other JS file.
- `js/render.js` builds the actual page elements using
  `document.createElement` and `.textContent` only — never by
  assembling HTML strings — so there's nothing in a data file that
  could ever be (mis)interpreted as markup.

### Adding a brand-new page

Static HTML duplication is the trade-off for "no build step, every
page works standalone": the sidebar markup is identical and repeated
in all 9 pages on purpose. To add a 10th page, copy any existing page
(e.g. `skills.html`), keep the sidebar/footer/scripts at top and
bottom untouched, swap the `<title>`, `data-page` attribute, and the
content inside `<main>`. Then add one matching `<li>` to the nav list
in **all** pages (find-and-replace across `www/*.html` is the fastest
way). If updating 9 files for a nav change ever gets annoying, that's
a sign to wire up a tiny build step — just ask and I'll add one.

## The resume button

It's a plain link to `files/resume.pdf` with the `download`
attribute — works with or without the server running. If the file
isn't there yet, the link 404s; the Resume page has a small note
explaining where to put it.

## The contact form

- **With the server running**: submits via `fetch`, shows inline
  success/error text, validated and rate-limited server-side, saved
  to `data-store/messages.json`. No email is actually sent — there
  are no SMTP credentials configured. See the comments in
  `src/controllers/contactController.js` for where to wire up a real
  email service (Resend, Postmark, or `nodemailer` with your own
  credentials).
- **Without the server** (`file://`, or any plain static host): the
  page tells you plainly that the form needs the backend, and points
  you at the email link instead. Nothing fails silently.
- **Without JavaScript at all**: the `<form>` still posts normally
  and the server redirects back with a status message — true
  progressive enhancement.

## Security notes (unchanged in spirit from v1)

- All dynamic content is inserted via `textContent`/DOM methods —
  never `innerHTML` — so nothing in a data file can inject markup.
- Project links only become real `href`s if they start with
  `http://` or `https://`.
- `src/middleware/security.js` sets a Content-Security-Policy (now
  stricter than v1 — no external scripts, no inline styles needed at
  all), plus `X-Frame-Options`, `X-Content-Type-Options`, and a
  restrictive `Permissions-Policy`.
- Static file serving resolves paths and refuses to serve anything
  outside of `www/` — blocks path-traversal attempts.
- The contact endpoint has a body-size cap, a honeypot field, IP
  rate-limiting, and full server-side re-validation regardless of
  what the client sent.

## Deploying on Vercel

This repo is already set up for it — here's exactly what to do once
your repo is connected to a Vercel project:

**1. Set the Output Directory.** Vercel needs to know the actual
website lives in `www/`, not the repo root. This repo already
includes a `vercel.json` that sets this automatically
(`"outputDirectory": "www"`), so if you're using that file as-is,
you can skip straight to step 3. If you'd rather set it by hand
instead: Project → Settings → Build & Development Settings →
Framework Preset: **Other**, Output Directory: **www**.

**2. The contact form is a serverless function, not the old Node
server.** `server.js` only runs when *you* run it locally — Vercel
never executes it. Instead, `api/contact.js` is the live version: any
file inside `/api` at the repo root automatically becomes a working
endpoint on Vercel, no extra configuration needed. The contact form
already points at `/api/contact`, so this works without any changes
on your end.

**3. Push and deploy.** If the repo's already connected, pushing to
your main branch triggers a deploy automatically. Watch the
deployment logs in the Vercel dashboard — if anything's misconfigured
(e.g. Output Directory), you'll see it fail there with a clear error.

**4. Check the contact form actually delivers.** Submit a test
message on the live site, then go to your Vercel project → **Logs**
(or **Functions** tab) and look for a `[contact-form]` log line. See
"Contact form on Vercel" below for why it's logged instead of saved
to a file.

### Contact form on Vercel — what's different from running it locally

Two real platform differences worth knowing about:

- **No persistent file storage.** Locally, submitted messages get
  saved to `data-store/messages.json`. Serverless functions don't
  have a writable, persistent disk — anything written to one
  disappears right after the request finishes. So on Vercel,
  `api/contact.js` logs each submission instead (visible in your
  Vercel dashboard's Logs/Functions tab) rather than silently losing
  it. This is *visible*, not *delivered* — for real email
  notifications, plug a transactional email API (Resend, Postmark) or
  `nodemailer` with your own SMTP credentials into `api/contact.js`
  where the `console.log(...)` line currently is.
- **Rate limiting is best-effort, not absolute.** The in-memory
  rate limiter still works, but Vercel may run multiple instances of
  the function under load, each with its own counter — so a
  determined abuser spread across instances could exceed the limit
  slightly. Fine for a personal portfolio; if it ever matters, swap
  in a shared store like Vercel KV or Upstash Redis.

Everything else (validation, honeypot field, security headers, link
sanitizing) behaves identically to the local version.

# portfolio-final
