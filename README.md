# Portfolio Site

A minimal, fast, single-page portfolio that dynamically fetches your GitHub projects.

## Project structure

```
portfolio/
├── index.html   — markup (all sections)
├── style.css    — design tokens, dark/light mode, layout
├── main.js      — GitHub API fetch, rendering, theme toggle
├── config.js    — ★ YOUR PERSONAL SETTINGS (edit this first)
└── resume.pdf   — drop your PDF here (or change the path in config.js)
```

---

## Quick-start (2 steps)

### 1 — Fill in `config.js`

Open `config.js` and replace every placeholder with your real information:

| Variable | What to change |
|---|---|
| `name` | Your full name |
| `role` | One-line job title / headline |
| `tagline` | 2–3 sentence bio |
| `githubUsername` | Your GitHub handle (used for the API call) |
| `github` | Full URL to your GitHub profile |
| `linkedin` | Full URL to your LinkedIn profile |
| `resume` | Path to your PDF or a direct URL |
| `email` | Contact email |
| `featuredRepos` | Array of repo names to pin at the top |
| `hiddenRepos` | Array of repo names to exclude |
| `skills` | Your tech stack tags |

### 2 — Open locally

Simply open `index.html` in any browser — no build step or server required.

---

## Deployment

### Option A — GitHub Pages (free, recommended)

1. Create a new GitHub repo (e.g. `yourname.github.io` for an apex domain, or any name for a project page).
2. Push the four files (`index.html`, `style.css`, `main.js`, `config.js`) to the `main` branch.
3. Go to **Settings → Pages → Source** and select `main / (root)`.
4. Your site will be live at `https://yourname.github.io` (or `https://yourname.github.io/repo-name`).

### Option B — Vercel (zero-config)

1. Push the files to any GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **New Project → Import** that repo.
3. No build command needed — Vercel serves static files automatically.
4. Done. You'll get a free `*.vercel.app` URL instantly, with a custom domain option.

### Option C — Netlify drag-and-drop

1. Zip the four files.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the zip.
3. Live in seconds.

---

## GitHub API rate limits

The site calls the **unauthenticated** GitHub API, which allows **60 requests/hour per IP**.  
For a portfolio this is more than enough for normal visitor traffic.  
If you hit the limit during local development, wait ~60 min or the page shows a friendly error message automatically.

---

## Customising further

- **Accent colour** — change `--accent` in `style.css` (`:root` block).
- **Font** — replace the `font-family` stack in the `body` rule.
- **Card count** — adjust `repoLimit` in `config.js`.
- **Featured repos** — add repo names (exact, case-insensitive) to the `featuredRepos` array.
