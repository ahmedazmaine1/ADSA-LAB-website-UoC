/* =========================================================
   DANSA Lab — publications.js  (fully static)
   Renders the featured list from data/publications.js. DOIs are
   resolved in ONE batched Crossref request (CORS-friendly); any
   entry can also carry hardcoded fields used as a fallback.

   Markup:
     <ul class="pub-list" data-pubs data-limit="6"></ul>
     <div data-pub-meta></div>            (optional status bar)
     <button data-pub-more hidden></button>  (optional "load more")
   ========================================================= */
(() => {
    "use strict";
    const list = document.querySelector("[data-pubs]");
    if (!list) return;

    const metaEl = document.querySelector("[data-pub-meta]");
    const moreBtn = document.querySelector("[data-pub-more]");
    const initialLimit = parseInt(list.dataset.limit, 10) || 6;

    let all = [];
    let shown = initialLimit;

    const esc = (s = "") =>
        String(s).replace(/[&<>"]/g, (c) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
        );

    function fromCrossref(msg, doi) {
        const dp =
            (msg.published || msg["published-print"] || msg["published-online"] || msg.issued || msg.created || {})["date-parts"];
        return {
            title: (msg.title && msg.title[0]) || "",
            authors: (msg.author || [])
                .map((a) => a.name || [a.given, a.family].filter(Boolean).join(" "))
                .filter(Boolean),
            year: (dp && dp[0] && dp[0][0]) || null,
            venue: (msg["container-title"] && msg["container-title"][0]) ||
                (msg["short-container-title"] && msg["short-container-title"][0]) || "",
            url: msg.URL || "https://doi.org/" + doi,
        };
    }
    const manual = (e, doi) => ({
        title: e.title || "",
        authors: e.authors || [],
        year: e.year || null,
        venue: e.venue || "",
        url: e.url || (doi ? "https://doi.org/" + doi : null),
    });

    // Resolve all DOIs in batched Crossref requests → { lowercaseDoi: {…} }
    async function crossrefMap(dois) {
        const map = {};
        const fields = "DOI,title,author,published,published-print,published-online,issued,created,container-title,short-container-title,URL";
        for (let i = 0; i < dois.length; i += 40) {
            const chunk = dois.slice(i, i + 40);
            const filter = chunk.map((d) => "doi:" + d).join(",");
            const url =
                "https://api.crossref.org/works?rows=" + chunk.length +
                "&select=" + fields + "&filter=" + encodeURIComponent(filter);
            try {
                const res = await fetch(url, { headers: { Accept: "application/json" } });
                if (!res.ok) continue;
                const items = ((await res.json()).message.items) || [];
                for (const m of items) map[String(m.DOI).toLowerCase()] = fromCrossref(m, m.DOI);
            } catch { /* leave these unresolved; fall back below */ }
        }
        return map;
    }

    function itemHTML(p) {
        const venue = p.venue ? ` <span class="pub-venue">${esc(p.venue)}</span>` : "";
        const title = p.url
            ? `<a class="pub-title" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)} ↗</a>`
            : `<span class="pub-title">${esc(p.title)}</span>`;
        return `
      <li class="pub-item">
        <span class="pub-year">${esc(p.year || "—")}</span>
        <div class="pub-main">
          ${title}
          <p class="pub-authors">${esc((p.authors || []).join(", "))}${venue}</p>
        </div>
      </li>`;
    }

    function paint() {
        list.innerHTML = all.slice(0, shown).map(itemHTML).join("");
        if (moreBtn) {
            const hasMore = shown < all.length;
            moreBtn.hidden = !hasMore;
            moreBtn.textContent = `Load more (${all.length - shown})`;
        }
    }
    function setMeta(text, count) {
        if (!metaEl) return;
        metaEl.innerHTML =
            (count != null ? `<span class="count">${count}</span> publications` : "") +
            (text ? `<span class="pub-status">${esc(text)}</span>` : "");
    }

    async function load() {
        const entries = (window.LAB && window.LAB.publications) || [];
        if (!entries.length) {
            list.innerHTML = `<li class="pub-empty">No publications listed yet.</li>`;
            setMeta("");
            return;
        }
        list.innerHTML = `<li class="pub-loading">Loading publications…</li>`;
        setMeta("loading…");

        const dois = entries.filter((e) => e.doi).map((e) => e.doi);
        const map = await crossrefMap(dois);

        const resolved = entries
            .map((e) => {
                if (e.doi) {
                    const r = map[String(e.doi).toLowerCase()];
                    if (r) {
                        return {
                            title: r.title || e.title || "",
                            authors: r.authors.length ? r.authors : e.authors || [],
                            year: r.year || e.year || null,
                            venue: r.venue || e.venue || "",
                            url: r.url || e.url || "https://doi.org/" + e.doi,
                        };
                    }
                    return e.title ? manual(e, e.doi) : null; // fall back to hardcoded fields
                }
                return e.title ? manual(e) : null;
            })
            .filter(Boolean);

        all = resolved.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));

        if (!all.length) {
            list.innerHTML = `<li class="pub-empty">Couldn’t load publication details.</li>`;
            setMeta("offline");
            if (moreBtn) moreBtn.hidden = true;
            return;
        }
        paint();
        setMeta("selected", all.length);
    }

    if (moreBtn) {
        moreBtn.addEventListener("click", () => { shown = all.length; paint(); });
    }
    load();
})();
