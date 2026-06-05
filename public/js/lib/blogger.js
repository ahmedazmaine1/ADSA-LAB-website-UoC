/* =========================================================
   DANSA Lab — blogger.js
   Loads the lab's Blogger posts directly in the browser via JSONP
   (Blogger supports alt=json-in-script&callback=…), so News works
   on plain static hosting with no server. Exposes:
     window.fetchBloggerPosts(limit) -> Promise<[{id,title,url,date,summary,content}]>
   ========================================================= */
(() => {
    "use strict";
    const FEED = "https://dansalab.blogspot.com/feeds/posts/default";

    function jsonp(url) {
        return new Promise((resolve, reject) => {
            const cb = "__blogger_cb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
            const script = document.createElement("script");
            let settled = false;
            const cleanup = () => {
                settled = true;
                try { delete window[cb]; } catch { window[cb] = undefined; }
                script.remove();
            };
            window[cb] = (data) => { if (!settled) { cleanup(); resolve(data); } };
            script.onerror = () => { if (!settled) { cleanup(); reject(new Error("Blogger feed unreachable")); } };
            script.src = url + (url.includes("?") ? "&" : "?") + "alt=json-in-script&callback=" + cb;
            document.head.appendChild(script);
            setTimeout(() => { if (!settled) { cleanup(); reject(new Error("Blogger feed timeout")); } }, 12000);
        });
    }

    const stripHtml = (html) => {
        const d = document.createElement("div");
        d.innerHTML = String(html || "");
        return (d.textContent || "").replace(/\s+/g, " ").trim();
    };
    const cleanHtml = (html) =>
        String(html || "")
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, "");

    const postId = (entry) => {
        const m = String((entry.id && entry.id.$t) || "").match(/post-(\d+)/);
        return m ? m[1] : String((entry.id && entry.id.$t) || "").slice(-16);
    };

    window.fetchBloggerPosts = async function (limit) {
        const data = await jsonp(FEED + "?max-results=" + (limit || 25));
        const entries = (data && data.feed && data.feed.entry) || [];
        return entries.map((e) => {
            const links = e.link || [];
            const alt = links.find((l) => l.rel === "alternate") || {};
            const content = cleanHtml((e.content && e.content.$t) || (e.summary && e.summary.$t) || "");
            const summary = stripHtml(content);
            const rawTitle = ((e.title && e.title.$t) || "").trim();
            const title =
                rawTitle ||
                (summary.length > 140 ? summary.slice(0, 140).replace(/\s+\S*$/, "") + "…" : summary) ||
                "Update";
            return {
                id: postId(e),
                title,
                url: alt.href || "",
                date: (e.published && e.published.$t) || (e.updated && e.updated.$t) || null,
                summary,
                content,
            };
        });
    };
})();
