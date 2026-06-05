# DANSA-LAB-website-UoC

Website for the **Data and Network Sciences & Applications (DANSA) Lab** at the
University of Calgary.

It is a **fully static site** — plain HTML/CSS/JS, no backend required. The
dynamic sections run entirely in the browser:

- **Publications** — a curated list of DOIs (`public/data/publications.js`) whose
  details are fetched from the [Crossref API](https://www.crossref.org/) (CORS-friendly).
- **News** — the lab's [Blogger](https://dansalab.blogspot.com/) posts, loaded
  directly via JSONP and rendered in-site.
- **Members** — embedded data (`public/data/members.js`); the page, group counts,
  and Alumni section all derive from it.

To deploy, you just **upload the `public/` folder** to any web host.

## Project structure

```
.
├── server.js          # LOCAL preview only (npm run dev); NOT deployed
├── package.json
└── public/            # ← the entire deployable site
    ├── index.html  team.html  publication.html  news.html  join.html
    ├── pages/         # member bio pages
    ├── css/theme.css  # the whole design system, one file
    ├── data/
    │   ├── members.js        # the roster (single source of truth)
    │   └── publications.js   # featured publication DOIs
    ├── js/
    │   ├── app.js            # nav, footer year, reveal, scroll cue
    │   ├── members.js        # renders Members from data/members.js
    │   ├── publications.js   # resolves DOIs via Crossref
    │   ├── news.js / news-post.js  # Blogger news (home column + news page)
    │   └── lib/blogger.js    # Blogger JSONP loader
    └── images/        # logos + member photos
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000  (serves public/)
```

(Or open it with any static server — e.g. VS Code Live Server. A real http
origin is needed so the Crossref fetch and Blogger JSONP work.)

## Deploying

Copy the **contents of `public/`** to the host's web directory. Nothing to build,
no server to run. (`server.js` is only a local convenience and is not used in
production.)

## Maintaining the content

- **Members** — edit `public/data/members.js`. Add a member, change a `group`
  (BSc→MSc→PhD) to move them and relabel them, or set `alumni: true` to retire
  them. Counts update automatically. `role` is optional (defaults to the group).
- **Publications** — edit `public/data/publications.js`. Add a `{ doi: "…" }`
  (details come from Crossref) or a hardcoded `{ title, authors, year, venue, url }`.
- **News** — publish a post on the lab's Blogger (`dansalab.blogspot.com`). It
  shows up automatically on the home page and `news.html`.
