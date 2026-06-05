/* =========================================================
   DANSA Lab — news-post.js  (fully static, powers news.html)
   ?id=<postId>  → that post's full content, rendered in-site
   (no id)       → the list of all posts
   Posts load directly from Blogger via window.fetchBloggerPosts.
   ========================================================= */
(() => {
    "use strict";
    const root = document.getElementById("news-root");
    if (!root) return;

    const id = new URLSearchParams(location.search).get("id");
    const esc = (s = "") =>
        String(s).replace(/[&<>"]/g, (c) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
        );
    const fmtDate = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        return isNaN(dt) ? "" : dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    };
    const truncate = (s, n) => {
        s = String(s || "").trim();
        return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "").trimEnd() + "…" : s;
    };
    const fail = (msg) => { root.innerHTML = `<p class="pub-empty">${esc(msg)}</p>`; };

    const head = `
        <header class="sec-head">
          <span class="sec-index">●</span>
          <span class="sec-eyebrow">Updates</span>
          <h2 class="sec-title">News</h2>
        </header>`;

    async function getPosts() {
        if (typeof window.fetchBloggerPosts !== "function") throw new Error("feed unavailable");
        return window.fetchBloggerPosts(50);
    }

    function renderPost(p) {
        document.title = `${p.title} — DANSA Lab`;
        const date = fmtDate(p.date);
        const article = document.createElement("article");
        article.className = "post";
        article.innerHTML =
            `<a class="post-back" href="news.html">← All news</a>` +
            `<header class="post-head">${date ? `<p class="post-date">${esc(date)}</p>` : ""}<h1 class="post-title">${esc(p.title)}</h1></header>` +
            `<div class="post-body"></div>`;
        article.querySelector(".post-body").innerHTML = p.content || `<p>${esc(p.summary || "")}</p>`;
        root.innerHTML = "";
        root.appendChild(article);
    }

    function renderList(items) {
        if (!items.length) { root.innerHTML = head + `<p class="news-empty">No announcements right now.</p>`; return; }
        const rows = items
            .map((i) => {
                const date = fmtDate(i.date);
                const href = `news.html?id=${encodeURIComponent(i.id)}`;
                const sum = i.summary
                    ? `<p class="post-row-sum">${esc(i.summary.slice(0, 180))}${i.summary.length > 180 ? "…" : ""}</p>`
                    : "";
                return `<li class="post-row">${date ? `<time>${esc(date)}</time>` : ""}<a class="post-row-title" href="${esc(href)}">${esc(truncate(i.title, 100))}</a>${sum}</li>`;
            })
            .join("");
        root.innerHTML = head + `<ul class="post-list">${rows}</ul>`;
    }

    (async () => {
        try {
            const posts = await getPosts();
            if (id) {
                const p = posts.find((x) => x.id === id);
                if (!p) return fail("That post couldn’t be found — it may have been removed.");
                renderPost(p);
            } else {
                renderList(posts);
            }
        } catch {
            fail("Couldn’t reach the news feed.");
        }
    })();
})();
