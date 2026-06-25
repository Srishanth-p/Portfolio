/* ============================================================
   main.js  —  Portfolio logic
   Depends on: config.js (must load first via <script> tag)
   ============================================================ */

"use strict";

// ── GitHub language colour map (most common languages) ───────
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  Java: "#b07219", "C++": "#f34b7d", C: "#555555", "C#": "#178600",
  Go: "#00ADD8", Rust: "#dea584", Ruby: "#701516", PHP: "#4F5D95",
  Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB", HTML: "#e34c26",
  CSS: "#563d7c", Shell: "#89e051", Dockerfile: "#384d54",
  Vue: "#41b883", Svelte: "#ff3e00", Lua: "#000080", R: "#198CE7",
};

// ── Helpers ───────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "html")  node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  children.forEach(c => c && node.append(typeof c === "string" ? document.createTextNode(c) : c));
  return node;
};

// ── Theme toggle ──────────────────────────────────────────────
(function initTheme() {
  const root    = document.documentElement;
  const btn     = $("#themeToggle");
  const saved   = localStorage.getItem("theme");
  // Default is "dark" (set in HTML); override only if explicitly saved
  if (saved) root.setAttribute("data-theme", saved);

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
})();

// ── Populate static content from CONFIG ───────────────────────
(function populateStatic() {
  // <title> & meta description
  document.title = `${CONFIG.name} — Portfolio`;
  $('meta[name="description"]').setAttribute(
    "content",
    `${CONFIG.name} — ${CONFIG.role}. ${CONFIG.tagline.slice(0, 120)}…`
  );

  // Nav logo
  $("#nav-logo").textContent = CONFIG.name;

  // Hero
  $("#hero-eyebrow").textContent = CONFIG.role;
  $("#hero-name").textContent    = CONFIG.name;
  $("#hero-tagline").textContent = CONFIG.tagline;

  const links = $("#hero-links");
  links.append(
    el("a", { class: "btn btn--github",   href: CONFIG.github,   target: "_blank", rel: "noopener" }, "GitHub"),
    el("a", { class: "btn btn--linkedin", href: CONFIG.linkedin, target: "_blank", rel: "noopener" }, "LinkedIn"),
    el("a", { class: "btn btn--resume",   href: CONFIG.resume,   target: "_blank", rel: "noopener" }, "Résumé"),
  );

  // About section
  const aboutBody = $("#about-body");
  // Support \n\n paragraph breaks in aboutText
  (CONFIG.aboutText || CONFIG.tagline).split("\n\n").forEach(para => {
    aboutBody.append(el("p", {}, para));
  });
  const resumeLink = $("#about-resume-link");
  resumeLink.setAttribute("href", CONFIG.resume);
  resumeLink.textContent = "View Résumé";

  const skillsList = $("#skills-list");
  CONFIG.skills.forEach(s => skillsList.append(el("li", {}, s)));

  // Footer
  $("#footer-email").setAttribute("href", `mailto:${CONFIG.email}`);
  $("#footer-email").textContent = CONFIG.email;
  $("#footer-linkedin-link").setAttribute("href", CONFIG.linkedin);
  $("#footer-copy").textContent  =
    `© ${new Date().getFullYear()} ${CONFIG.name} · built with curiosity & vanilla JS`;
})();

// ── GitHub API — smart cache ──────────────────────────────────
//
// Strategy: store full repo list in localStorage with a timestamp
// and the public repo count at time of fetch.
// On each page load:
//   1. Hit the cheap /users/{user} endpoint (1 API call) to get current
//      public_repos count.
//   2. If count matches cache AND cache is < CACHE_TTL_MS old → use cache.
//   3. Otherwise fetch the full repo list and refresh the cache.
//
// This keeps API calls to 1 per visit when nothing has changed,
// and only burns the full 100-repo fetch when you actually push something new.

// Config fingerprint — any change to filter/limit settings busts the cache
const _cfgFingerprint = [
  CONFIG.repoLimit,
  ...(CONFIG.featuredRepos || []),
  ...(CONFIG.hiddenRepos   || []),
].join(",");
const CACHE_KEY    = `gh_repos_${CONFIG.githubUsername}_${btoa(_cfgFingerprint).slice(0, 8)}`;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/** Read and validate the localStorage cache. Returns null if stale/missing. */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    const age    = Date.now() - (cached.ts || 0);
    if (age > CACHE_TTL_MS) return null;
    return cached; // { ts, repoCount, repos }
  } catch { return null; }
}

/** Persist repos + metadata to localStorage. */
function writeCache(repos, repoCount) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ts: Date.now(),
      repoCount,
      repos,
    }));
  } catch { /* storage full — silently skip */ }
}

/**
 * Get current public repo count for the user (cheap: 1 API call).
 * Returns -1 on network error so we fall back to cache.
 */
async function fetchRepoCount() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${CONFIG.githubUsername}`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) return -1;
    const data = await res.json();
    return data.public_repos ?? -1;
  } catch { return -1; }
}

/** Fetch the full repo list from the API and return filtered, sorted array. */
async function fetchReposFromAPI() {
  const url =
    `https://api.github.com/users/${CONFIG.githubUsername}/repos` +
    `?per_page=100&sort=pushed&type=owner`;

  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!res.ok) {
    const remaining = res.headers.get("X-RateLimit-Remaining");
    if (remaining === "0") throw new Error("rate_limit");
    throw new Error(`github_error_${res.status}`);
  }

  const repos = await res.json();

  // 1. Remove forks & explicitly hidden repos
  const hidden  = new Set(CONFIG.hiddenRepos.map(r => r.toLowerCase()));
  const visible = repos.filter(r => !r.fork && !hidden.has(r.name.toLowerCase()));

  // 2. Partition: featured first, then rest sorted by stars desc
  const featured = CONFIG.featuredRepos.map(name =>
    visible.find(r => r.name.toLowerCase() === name.toLowerCase())
  ).filter(Boolean);

  const featuredNames = new Set(featured.map(r => r.name.toLowerCase()));
  const rest = visible
    .filter(r => !featuredNames.has(r.name.toLowerCase()))
    .sort((a, b) => b.stargazers_count - a.stargazers_count);

  return [...featured, ...rest].slice(0, CONFIG.repoLimit);
}

/**
 * Smart fetch: uses cache when repo count hasn't changed and cache is fresh.
 * Falls back to full API fetch only when needed.
 * @returns {Promise<Array>} sorted, filtered repo objects
 */
async function fetchRepos() {
  const cached = readCache();

  // Get current repo count (cheap call)
  const liveCount = await fetchRepoCount();

  // Use cache if: count matches AND cache exists AND live count was readable
  if (cached && liveCount !== -1 && cached.repoCount === liveCount) {
    console.debug("[portfolio] Repos loaded from cache");
    return cached.repos;
  }

  // Need a fresh fetch
  const repos = await fetchReposFromAPI();

  // Only cache if we got a valid count to compare against next time
  const countToStore = liveCount !== -1 ? liveCount : repos.length;
  writeCache(repos, countToStore);
  console.debug("[portfolio] Repos fetched from API and cached");
  return repos;
}

// ── Render helpers ────────────────────────────────────────────

/** SVG icon: external link arrow */
const ICON_EXTERNAL = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
</svg>`;

/** SVG icon: star */
const ICON_STAR = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
  stroke="currentColor" stroke-width="1.5">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>`;

/**
 * Build and return a project card DOM node.
 * @param {Object} repo  GitHub repo object
 * @returns {HTMLElement}
 */
function buildCard(repo) {
  const card = el("a", {
    class: "project-card",
    href: repo.html_url,
    target: "_blank",
    rel: "noopener noreferrer",
  });

  // Header: name + external link icon
  const header = el("div", { class: "project-card-header" });
  header.append(
    el("span", { class: "project-name" }, repo.name.replace(/-/g, " ")),
    el("span", { class: "project-link-icon", html: ICON_EXTERNAL })
  );

  // Description — use override from config if GitHub description is blank
  const overrides = CONFIG.repoDescriptions || {};
  const descText  = repo.description || overrides[repo.name] || "No description provided.";
  const desc = el("p", { class: "project-desc" }, descText);

  // Footer row: language + stars
  const footer = el("div", { class: "project-footer" });
  const meta   = el("div", { class: "project-meta" });

  if (repo.language) {
    const color = LANG_COLORS[repo.language] || "#8b949e";
    const dot   = el("span", { class: "lang-dot" });
    dot.style.background = color;
    const langItem = el("span", { class: "meta-item" });
    langItem.append(dot, repo.language);
    meta.append(langItem);
  }

  if (repo.stargazers_count > 0) {
    const starItem = el("span", { class: "meta-item", html: ICON_STAR });
    starItem.append(` ${repo.stargazers_count}`);
    meta.append(starItem);
  }

  // Language tag (pill badge, duplicates dot for quick scanning)
  const tagWrap = el("div", {});
  if (repo.language) {
    tagWrap.append(el("span", { class: "tag" }, repo.language));
  }

  footer.append(meta, tagWrap);
  card.append(header, desc, footer);
  return card;
}

/** Render an error/empty state into the grid */
function renderGridState(title, body) {
  const grid = $("#projects-grid");
  grid.innerHTML = "";
  const msg = el("div", { class: "state-message" });
  msg.append(el("strong", {}, title), body);
  grid.append(msg);
}

// ── Main render ───────────────────────────────────────────────
async function renderProjects() {
  const grid = $("#projects-grid");
  const sub  = $("#projects-sub");

  try {
    const repos = await fetchRepos();

    // Clear skeletons
    grid.innerHTML = "";

    if (repos.length === 0) {
      sub.textContent = "";
      renderGridState("No public repositories found.", "Make a repo public on GitHub to see it here.");
      return;
    }

    sub.textContent = `${repos.length} public project${repos.length === 1 ? "" : "s"}`;
    repos.forEach(r => grid.append(buildCard(r)));

  } catch (err) {
    grid.innerHTML = "";

    if (err.message === "rate_limit") {
      sub.textContent = "API rate limit reached";
      renderGridState(
        "GitHub API rate limit hit.",
        "You've made too many unauthenticated requests. Try again in ~60 minutes, or open the repos directly on GitHub."
      );
    } else if (err.message.startsWith("github_error_404")) {
      sub.textContent = "Username not found";
      renderGridState(
        "GitHub user not found.",
        `Check that "${CONFIG.githubUsername}" is correct inside config.js.`
      );
    } else {
      sub.textContent = "Could not load projects";
      renderGridState(
        "Couldn't fetch repositories.",
        "Check your internet connection, or view the projects directly on GitHub."
      );
    }

    console.error("[portfolio] GitHub fetch error:", err);
  }
}

// ── Certifications ───────────────────────────────────────────

/** Build and return a cert card DOM node (compact stack style) */
function buildCertCard(cert) {
  const card = el("div", { class: "cert-card" });
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("title", `Open: ${cert.title}`);

  const left = el("div", { class: "cert-card-left" });
  left.append(
    el("p", { class: "cert-title" }, cert.title),
    el("p", { class: "cert-meta" }, `${cert.issuer} · ${cert.date}`)
  );

  card.append(left, el("span", { class: "cert-open-icon", html: ICON_EXTERNAL }));

  card.addEventListener("click", () => openCert(cert));
  card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") openCert(cert); });
  return card;
}

/** Open cert: image → lightbox, PDF → new tab */
function openCert(cert) {
  if (cert.type === "pdf") {
    window.open(cert.file, "_blank", "noopener,noreferrer");
    return;
  }
  // image lightbox
  const overlay  = $("#lightbox-overlay");
  const lightImg = $("#lightbox-img");
  lightImg.src = cert.file;
  lightImg.alt = cert.title;
  overlay.classList.remove("hidden");
  overlay.focus();
}

function renderCertifications() {
  const grid = $("#certs-grid");
  if (!CONFIG.certifications || CONFIG.certifications.length === 0) return;

  CONFIG.certifications.forEach(c => grid.append(buildCertCard(c)));

  // Build lightbox (once)
  const overlay = el("div", { class: "lightbox-overlay hidden", id: "lightbox-overlay", tabindex: "-1" });
  const inner   = el("div", { class: "lightbox-inner" });
  const closeBtn = el("button", { class: "lightbox-close", "aria-label": "Close" }, "×");
  const img     = el("img", { id: "lightbox-img", alt: "" });

  closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.classList.add("hidden"); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") overlay.classList.add("hidden"); });

  inner.append(closeBtn, img);
  overlay.append(inner);
  document.body.append(overlay);
}

// Kick off the fetch when DOM is ready
renderProjects();
renderCertifications();
