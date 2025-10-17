//-----------------------//
// --- 1. Menu Toggle for Mobile ---
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar'); // UL now has .navbar in HTML

if (menuIcon && navbar) {
    menuIcon.onclick = () => {
        menuIcon.classList.toggle('bx-x');
        navbar.classList.toggle('active');
    };
}

// --- 2. Scroll Navigation Highlight ---
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        const top = window.scrollY;
        const offset = sec.offsetTop - 150;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        if (id && top >= offset && top < offset + height) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector('header nav a[href*=' + id + ']');
            if (activeLink) activeLink.classList.add('active');
        }
    });

    if (menuIcon && navbar) {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
    }
};

// --- 3. Typing Animation for Homepage ---
const roles = ["Data Mining", "Social Network Analysis", "Data Privacy", "Bioinformatics", "Big Data"];
const typedText = document.getElementById("typed-text");

if (typedText) {
    let index = 0,
        charIndex = 0;
    const typingSpeed = 100,
        erasingSpeed = 100,
        delayBetween = 2000;

    function type() {
        if (charIndex < roles[index].length) {
            typedText.textContent += roles[index].charAt(charIndex++);
            setTimeout(type, typingSpeed);
        } else setTimeout(erase, delayBetween);
    }

    function erase() {
        if (charIndex > 0) {
            typedText.textContent = roles[index].substring(0, --charIndex);
            setTimeout(erase, erasingSpeed);
        } else {
            index = (index + 1) % roles.length;
            setTimeout(type, 500);
        }
    }
    document.addEventListener("DOMContentLoaded", () => setTimeout(type, 1000));
}

// --- 4. People Thumbnails (for Team & Bio pages) ---
document.querySelectorAll('.thumb[data-photo]').forEach(thumb => {
    const src = thumb.getAttribute('data-photo');
    if (src) thumb.style.backgroundImage = `url("${src}")`;
});

// --- 5. Footer Year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- 6. Contact form handler ---
(function() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusEl = form.querySelector('.form-status');
    const endpoint = form.getAttribute('data-endpoint') || '';

    const showStatus = (msg, ok = true) => {
        if (!statusEl) return;
        statusEl.hidden = false;
        statusEl.textContent = msg;
        statusEl.setAttribute('aria-live', 'polite');
        statusEl.style.color = ok ? 'inherit' : '#ff6b6b';
    };

    form.addEventListener('submit', async(e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        if (!payload.name || !payload.email || !payload.message) {
            showStatus('Please fill in your name, email, and message.', false);
            return;
        }
        const subject = payload.subject || 'Website contact';
        const body = `From: ${payload.name} <${payload.email}>\n\n${payload.message}`;
        if (!endpoint || endpoint === 'mailto') {
            window.location.href =
                `mailto:${encodeURIComponent(payload.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            return;
        }
        showStatus('Sending…');
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                showStatus('Thanks! Your message was sent.');
                form.reset();
            } else {
                showStatus('Server error. Opening your email client…', false);
                window.location.href =
                    `mailto:${encodeURIComponent(payload.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        } catch {
            showStatus('Network issue. Opening your email client…', false);
            window.location.href =
                `mailto:${encodeURIComponent(payload.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    });
})();

// ============================
// 7) Publications (DBLP + ORCID)
// ============================
const API_BASE = 'http://localhost:3000';


async function renderList(listEl, pubs, limit = 5, moreBtnEl) {
    listEl.innerHTML = "";
    const show = pubs.slice(0, limit);
    for (const p of show) {
        const li = document.createElement("li");
        li.className = "pub-item";
        li.innerHTML = `
      <strong>${p.title}</strong>
      ${p.authors ? ` — <span class="muted">${p.authors}</span>` : ""}
      ${p.year ? ` (${p.year})` : ""}
      ${p.url ? ` · <a href="${p.url}" target="_blank" rel="noopener">Link</a>` : ""}
    `;
    listEl.appendChild(li);
  }
  if (moreBtnEl) {
    moreBtnEl.style.display = pubs.length > limit ? "inline-flex" : "none";
    moreBtnEl.onclick = () => {
      renderList(listEl, pubs, pubs.length, moreBtnEl);
      moreBtnEl.style.display = "none";
    };
  }
}

// --- Prof. Reda Alhajj via DBLP ---
async function loadReda() {
  const list = document.getElementById("reda-pubs");
  const btn = document.getElementById("reda-more");
  if (!list) return;
  try {
    const r = await fetch(`${API_BASE}/api/pubs/dblp?author=${encodeURIComponent("Reda Alhajj")}`);
    const data = await r.json();
    if (!data.ok) throw new Error(data.error || "DBLP error");
    await renderList(list, data.pubs, 5, btn);
  } catch (e) {
    console.error(e);
    list.innerHTML = `<li class="muted">Couldn’t load DBLP publications.</li>`;
    if (btn) btn.style.display = "none";
  }
}

// ================================
// Prof. Jon Rokne (Crossref)
// ================================
fetch("/api/pubs/rokne")
  .then(r => r.json())
  .then(data => {
    const listEl = document.getElementById("rokne-list");
    if (!listEl) return;

    if (!data.ok || !data.pubs || data.pubs.length === 0) {
      listEl.innerHTML = "<li>Couldn't load publications.</li>";
      return;
    }

    listEl.innerHTML = "";
    data.pubs.slice(0, 10).forEach(p => {
      const li = document.createElement("li");
      li.className = "pub-item";
      li.innerHTML = `
        <strong>${p.title}</strong>
        ${p.authors ? ` — ${p.authors}` : ""}
        ${p.year ? ` (${p.year})` : ""}
        ${p.url ? ` · <a href="${p.url}" target="_blank" rel="noopener">Link</a>` : ""}
      `;
      listEl.appendChild(li);
    });
  })
  .catch(err => {
    console.error("Rokne load error:", err);
    const listEl = document.getElementById("rokne-list");
    if (listEl)
      listEl.innerHTML = "<li>Error loading publications.</li>";
  });



function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

document.addEventListener("DOMContentLoaded", () => {
  const yearEl2 = document.getElementById("year");
  if (yearEl2) yearEl2.textContent = new Date().getFullYear();
  if (document.getElementById("reda-pubs")) loadReda();
  if (document.getElementById("rokne-list")) loadRokne(); // ✅ fixed ID
});