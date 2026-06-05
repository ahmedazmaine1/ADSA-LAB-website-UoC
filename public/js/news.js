/* =========================================================
   DANSA Lab — news.js  (fully static)
   Renders recent Blogger posts into [data-news] using
   window.fetchBloggerPosts (js/lib/blogger.js, loaded first).
   ========================================================= */
(() => {
    "use strict";
    const list = document.querySelector("[data-news]");
    if (!list) return;

    const limit = parseInt(list.dataset.limit, 10) || 5;
    const maxAgeDays = parseInt(list.dataset.maxAgeDays, 10) || 0;

    const esc = (s = "") =>
        String(s).replace(/[&<>"]/g, (c) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
        );
    const fmtDate = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        return isNaN(dt) ? "" : dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };
    const truncate = (s, n) => {
        s = String(s || "").trim();
        return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "").trimEnd() + "…" : s;
    };
    const empty = () => { list.innerHTML = `<li class="news-empty">No announcements right now.</li>`; };

    async function load() {
        if (typeof window.fetchBloggerPosts !== "function") return empty();
        try {
            let items = await window.fetchBloggerPosts(25);
            if (maxAgeDays > 0) {
                const cutoff = Date.now() - maxAgeDays * 86400000;
                items = items.filter((i) => {
                    const t = i.date ? new Date(i.date).getTime() : NaN;
                    return isNaN(t) || t >= cutoff;
                });
            }
            items = items.slice(0, limit);
            if (!items.length) return empty();
            list.innerHTML = items
                .map((i) => {
                    const date = fmtDate(i.date);
                    const href = `news.html?id=${encodeURIComponent(i.id)}`;
                    return `<li class="news-item">${date ? `<time>${esc(date)}</time>` : ""}<a href="${esc(href)}">${esc(truncate(i.title, 70))}</a></li>`;
                })
                .join("");
        } catch {
            empty();
        }
    }
    load();
})();
