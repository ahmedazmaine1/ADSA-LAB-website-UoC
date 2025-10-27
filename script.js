/* =========================================================
   DANSA Lab — script.js  (cleaned & unified)
   - Mobile nav
   - Section highlight
   - Typing effect (home)
   - Photo filler for ANY [data-photo]
   - Contact form (Resend or mailto fallback)
   - Publications loaders (DBLP + Rokne)
   - Auto social icons per member (detect from bio page)
   - Footer year
   ========================================================= */

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- Mobile nav toggle ---------- */
document.addEventListener("DOMContentLoaded", () => {
    const btn = $("#menu-icon");
    const menu = $("#nav-menu") || $(".navbar");
    if (!btn || !menu) return;

    btn.addEventListener("click", () => {
        const open = menu.classList.toggle("show") || menu.classList.toggle("active");
        btn.setAttribute("aria-expanded", String(open));
    });
});

/* ---------- Scroll navigation highlight ---------- */
window.addEventListener("scroll", () => {
    const sections = $$("section");
    const navLinks = $$("header nav a");
    const y = window.scrollY;

    sections.forEach((sec) => {
        const id = sec.getAttribute("id");
        if (!id) return;
        const top = sec.offsetTop - 150;
        const end = top + sec.offsetHeight;
        if (y >= top && y < end) {
            navLinks.forEach((a) => a.classList.remove("active"));
            const active = document.querySelector(`header nav a[href*="${id}"]`);
            if (active) active.classList.add("active");
        }
    });
});

/* ---------- Typing animation (home hero) ---------- */
document.addEventListener("DOMContentLoaded", () => {
    const typedText = $("#typed-text");
    if (!typedText) return;

    const roles = ["Data Mining", "Social Network Analysis", "Data Privacy", "Bioinformatics", "Big Data"];
    let i = 0,
        j = 0;
    const typeSpeed = 100,
        eraseSpeed = 100,
        delay = 2000;

    function type() {
        if (j < roles[i].length) {
            typedText.textContent += roles[i][j++];
            setTimeout(type, typeSpeed);
        } else { setTimeout(erase, delay); }
    }

    function erase() {
        if (j > 0) {
            typedText.textContent = roles[i].slice(0, --j);
            setTimeout(erase, eraseSpeed);
        } else {
            i = (i + 1) % roles.length;
            setTimeout(type, 500);
        }
    }
    setTimeout(type, 600);
});

/* ---------- Photo fill for any [data-photo] ---------- */
document.addEventListener("DOMContentLoaded", () => {
    $$("[data-photo]").forEach((el) => {
        const src = el.getAttribute("data-photo");
        if (!src) return;
        el.style.backgroundImage = `url("${src}")`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.backgroundRepeat = "no-repeat";
    });
});

/* ---------- Footer year ---------- */
document.addEventListener("DOMContentLoaded", () => {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
});

/* ---------- Contact form handler ---------- */
document.addEventListener("DOMContentLoaded", () => {
    const form = $("#contact-form");
    if (!form) return;

    const statusEl = form.querySelector(".form-status");
    const endpoint = form.getAttribute("data-endpoint") || "";

    const showStatus = (msg, ok = true) => {
        if (!statusEl) return;
        statusEl.hidden = false;
        statusEl.textContent = msg;
        statusEl.setAttribute("aria-live", "polite");
        statusEl.style.color = ok ? "inherit" : "#ff6b6b";
    };

    form.addEventListener("submit", async(e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.name || !data.email || !data.message) {
            showStatus("Please fill in your name, email, and message.", false);
            return;
        }

        const subject = data.subject || "Website contact";
        const body = `From: ${data.name} <${data.email}>\n\n${data.message}`;

        // Fallback to mailto if backend is not configured
        if (!endpoint || endpoint === "mailto") {
            window.location.href = `mailto:${encodeURIComponent(data.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            return;
        }

        showStatus("Sending…");
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                showStatus("Thanks! Your message was sent.");
                form.reset();
            } else {
                showStatus("Server error. Opening your email client…", false);
                window.location.href = `mailto:${encodeURIComponent(data.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        } catch {
            showStatus("Network issue. Opening your email client…", false);
            window.location.href = `mailto:${encodeURIComponent(data.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    });
});

/* ---------- Publications ---------- */
const API_BASE = "http://localhost:3000";

async function renderList(listEl, pubs, limit = 5, moreBtnEl) {
    listEl.innerHTML = "";
    pubs.slice(0, limit).forEach((p) => {
                const li = document.createElement("li");
                li.className = "pub-item";
                li.innerHTML = `
      <strong>${p.title}</strong>
      ${p.authors ? ` — <span class="muted">${p.authors}</span>` : ""}
      ${p.year ? ` (${p.year})` : ""}
      ${p.url ? ` · <a href="${p.url}" target="_blank" rel="noopener">Link</a>` : ""}
    `;
    listEl.appendChild(li);
  });

  if (moreBtnEl) {
    moreBtnEl.style.display = pubs.length > limit ? "inline-flex" : "none";
    moreBtnEl.onclick = () => {
      renderList(listEl, pubs, pubs.length, moreBtnEl);
      moreBtnEl.style.display = "none";
    };
  }
}

// DBLP: Prof. Reda Alhajj
async function loadReda() {
  const list = document.getElementById("reda-pubs");
  const btn  = document.getElementById("reda-more");
  if (!list) return;
  try {
    const r = await fetch(`${API_BASE}/api/pubs/dblp?author=${encodeURIComponent("Reda Alhajj")}`);
    const data = await r.json();
    if (!data.ok) throw new Error(data.error || "DBLP error");
    renderList(list, data.pubs, 5, btn);
  } catch (e) {
    console.error(e);
    list.innerHTML = `<li class="muted">Couldn’t load DBLP publications.</li>`;
    if (btn) btn.style.display = "none";
  }
}

// Rokne: Google Scholar via backend
async function loadRokne() {
  const listEl = document.getElementById("rokne-list");
  if (!listEl) return;
  try {
    const r = await fetch(`${API_BASE}/api/pubs/rokne`);
    const data = await r.json();
    if (!data.ok || !Array.isArray(data.pubs) || data.pubs.length === 0) {
      listEl.innerHTML = "<li class='muted'>Couldn't load publications.</li>";
      return;
    }
    renderList(listEl, data.pubs, 10);
  } catch (err) {
    console.error("Rokne load error:", err);
    listEl.innerHTML = "<li class='muted'>Error loading publications.</li>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("reda-pubs")) loadReda();
  if (document.getElementById("rokne-list")) loadRokne();
});

/* =========================================================
   Auto social icons per member — detect from their bio page
   Platforms we support: scholar, linkedin, github, researchgate, blogger,
                         instagram, facebook
   Emails are ignored.
   Usage in team.html:
     <div class="member-social" data-profile="ahmed_al_marouf.html"></div>
   ========================================================= */

/* Map a URL to a platform key */
function detectPlatform(href) {
  try {
    const u = new URL(href, window.location.href);
    const h = u.hostname.toLowerCase();
    if (h.includes("scholar.google"))                        return "scholar";
    if (h.includes("linkedin."))                             return "linkedin";
    if (h.includes("github."))                               return "github";
    if (h.includes("researchgate."))                         return "researchgate";
    if (h.includes("blogspot.") || h.includes("blogger."))   return "blogger";
    if (h.includes("instagram."))                            return "instagram";
    if (h.includes("facebook.") || h === "fb.com")           return "facebook";
    return null;
  } catch { return null; }
}

/* Monochrome, currentColor SVGs so CSS controls color */
const ICONS = {
  linkedin: {
    title: "LinkedIn",
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8h4v12h-4V8zm7.5 0h3.8v1.95h.05c.53-.93 1.83-2.15 3.76-2.15 4.02 0 4.76 2.62 4.76 6.03V20h-4v-6.1c0-1.67-.03-3.82-2.37-3.82-2.37 0-2.73 1.78-2.73 3.7V20H8V8z" fill="currentColor"/></svg>`
  },
  github: {
    title: "GitHub",
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.61-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.45-1.1-1.45-.9-.62.07-.61.07-.61 1 .07 1.52 1.03 1.52 1.03.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.29.1-2.68 0 0 .84-.27 2.75 1.03A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.12 2.5.35 1.9-1.3 2.74-1.03 2.74-1.03.56 1.39.21 2.43.1 2.68.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .26.18.57.69.47A10 10 0 0 0 12 2z"/></svg>`
  },
  instagram: {
    title: "Instagram",
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-2.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>`
  },
  facebook: {
    title: "Facebook",
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8.3h2.8l.4-3.2h-3.2V8.4c0-.9.25-1.5 1.6-1.5h1.7V4.1c-.83-.1-1.67-.1-2.5-.1-2.47 0-4.16 1.5-4.16 4.2v2.3H8v3.2h2.14V22h3.36z"/></svg>`
  },
  scholar: {
    title: "Google Scholar",
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2.5 10 12 17 21.5 10 12 3zM12 19a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"/></svg>`
  },
  researchgate: {
    title: "ResearchGate",
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M9 8h5a3 3 0 0 1 0 6h-2l3 4h-2l-3-4H9v4H8V8zm1 5h4a2 2 0 1 0 0-4h-4v4z" fill="#0a0a0a"/></svg>`
  },
  blogger: {
    title: "Blog",
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h6a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H7a6 6 0 0 1-6-6V9a6 6 0 0 1 6-6zm2 5h3a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm0 6h6a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2z"/></svg>`
  }
};

/* Fetch a bio page and extract icons from its links */
async function extractIconsFromProfile(profilePath) {
  try {
    const res = await fetch(profilePath, { credentials: "same-origin" });
    if (!res.ok) return {};
    const html = await res.text();
    const doc  = new DOMParser().parseFromString(html, "text/html");
    const links = $$("a[href]", doc);
    const out = {};
    links.forEach(a => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("mailto:")) return; // skip emails
      const key = detectPlatform(href);
      if (key && !out[key]) out[key] = new URL(href, window.location.href).href;
    });
    return out;
  } catch {
    return {};
  }
}

/* Render buttons into a wrapper */
function renderButtons(wrapper, map) {
  wrapper.innerHTML = "";
  Object.entries(map).forEach(([key, url]) => {
    const def = ICONS[key];
    if (!def || !url) return;
    const a = document.createElement("a");
    a.className = "sbtn";
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    a.title = def.title;
    a.innerHTML = def.svg;
    wrapper.appendChild(a);
  });
}

/* Initialize social rows:
   Priority: data-icons JSON (manual) > data-profile (auto-detect) */
async function initSocialRows() {
  for (const wrap of $$(".member-social")) {
    const explicit = wrap.getAttribute("data-icons");
    if (explicit) {
      try { renderButtons(wrap, JSON.parse(explicit)); } catch { /* ignore malformed JSON */ }
      continue;
    }
    const profile = wrap.getAttribute("data-profile");
    if (profile) {
      const icons = await extractIconsFromProfile(profile);
      renderButtons(wrap, icons);
    }
  }
}
document.addEventListener("DOMContentLoaded", initSocialRows);// ==============================
// Responsive Hamburger Menu
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close menu when clicking a link
  document.querySelectorAll(".nav-menu a").forEach(link =>
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      navMenu.classList.remove("active");
    })
  );
});