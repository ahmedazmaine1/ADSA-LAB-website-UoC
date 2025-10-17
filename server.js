// ===================================================================
// ADSA Lab — backend for contact form + publications
// ===================================================================

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Paths (ESM friendly) ---
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- CORS ---
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

// --- Health check ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ===================================================================
//  CONTACT FORM  (Resend API)
// ===================================================================
const resend = process.env.RESEND_API_KEY ?
    new Resend(process.env.RESEND_API_KEY) :
    null;

app.post("/api/contact", async(req, res) => {
    try {
        if (!resend) {
            return res.status(500).json({ ok: false, error: "Missing RESEND_API_KEY" });
        }

        const { name, email, subject = "Website contact", message, to } = req.body || {};
        if (!name || !email || !message || !to) {
            return res.status(400).json({ ok: false, error: "Missing fields" });
        }

        const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
        await resend.emails.send({
            from: "ADSA Lab Contact <onboarding@resend.dev>",
            to: [to],
            subject,
            html: `
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p><strong>Message:</strong></p>
        <div>${safeMessage}</div>
      `,
            reply_to: email,
        });

        res.json({ ok: true, message: "Email sent successfully!" });
    } catch (err) {
        console.error("Email error:", err);
        res.status(500).json({ ok: false, error: "Email send failed" });
    }
});

// ===================================================================
//  PUBLICATIONS:  Prof. Reda Alhajj — DBLP
// ===================================================================
app.get("/api/pubs/dblp", async(req, res) => {
            try {
                const author = (req.query.author || "Reda Alhajj").trim();
                const h = Math.min(Number(req.query.h) || 100, 400);

                const dblpUrl = `https://dblp.org/search/publ/api?q=${encodeURIComponent(
      `author:${author}:`
    )}&format=json&h=${h}`;

    const r = await fetch(dblpUrl, {
      headers: { "user-agent": "Mozilla/5.0 ADSA-Lab (contact page)" },
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: "DBLP HTTP error" });

    const data = await r.json();
    const hits = data?.result?.hits?.hit || [];

    const pubs = hits.map((h) => {
      const info = h?.info || {};
      return {
        title: stripTags(info.title || "(no title)"),
        authors: Array.isArray(info.authors?.author)
          ? info.authors.author
              .map((a) => (typeof a === "string" ? a : a?.text || ""))
              .join(", ")
          : info.authors?.author?.text || "",
        venue: info.venue || info.journal || info.booktitle || "",
        year: info.year || "",
        url: info.ee || info.url || "#",
      };
    });

    res.json({ ok: true, pubs });
  } catch (e) {
    console.error("DBLP error:", e);
    res.status(500).json({ ok: false, error: "DBLP fetch failed" });
  }
});

// ===================================================================
//  PUBLICATIONS:  ORCID (Generic) — optional for other members
// ===================================================================
app.get("/api/pubs/orcid/:orcid", async (req, res) => {
  try {
    const { orcid } = req.params;
    if (!orcid) return res.status(400).json({ ok: false, error: "Missing ORCID" });

    const url = `https://pub.orcid.org/v3.0/${orcid}/works`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) return res.status(502).json({ ok: false, error: "ORCID HTTP error" });

    const data = await r.json();
    const groups = data?.group || [];
    const pubs = [];

    for (const g of groups) {
      const summaries = g?.["work-summary"] || [];
      for (const s of summaries) {
        let link = "#";
        const doi = s?.["external-ids"]?.["external-id"]?.find(
          (e) => e?.["external-id-type"]?.toLowerCase() === "doi"
        );
        if (doi?.["external-id-url"]?.value) link = doi["external-id-url"].value;

        pubs.push({
          title: stripTags(s?.title?.title?.value || "(no title)"),
          year: s?.["publication-date"]?.year?.value || "",
          url: link,
          source: s?.["journal-title"]?.value || s?.type || "",
        });
      }
    }

    pubs.sort((a, b) => String(b.year).localeCompare(String(a.year)));
    res.json({ ok: true, pubs });
  } catch (e) {
    console.error("ORCID error:", e);
    res.status(500).json({ ok: false, error: "ORCID fetch failed" });
  }
});

// ===================================================================
//  PUBLICATIONS:  Prof. Jon Rokne — Google Scholar via SerpAPI
// ===================================================================
app.get("/api/pubs/rokne", async (req, res) => {
  const SERP = process.env.SCHOLAR_SERPAPI_KEY?.trim();
  const authorId = "M3-3rtoAAAAJ"; // Jon G. Rokne’s official Scholar ID

  try {
    if (!SERP) {
      return res.json({ ok: false, pubs: [], error: "Missing SERPAPI key" });
    }

    const url = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${authorId}&sort=pubdate&api_key=${SERP}`;
    const r = await fetch(url, { headers: { "user-agent": "ADSA-Lab/1.0" } });
    if (!r.ok) throw new Error(`Scholar author fetch ${r.status}`);

    const data = await r.json();
    const items = data?.articles || [];

    const pubs = items.map((a) => ({
      title: a.title || "Untitled",
      year: a.publication_info?.year || a.year || "",
      authors: (a.authors || []).map((x) => x.name).join(", "),
      url: a.link || "",
      source: "Google Scholar",
    }));

    pubs.sort((a, b) => String(b.year).localeCompare(String(a.year)));
    res.json({ ok: true, pubs });
  } catch (err) {
    console.error("Scholar fetch failed:", err);
    res.json({ ok: false, pubs: [], error: "Scholar fetch failed" });
  }
});

// ===================================================================
//  HELPERS
// ===================================================================
function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, "");
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ===================================================================
//  STATIC FILES  (AFTER APIs!)
// ===================================================================
app.use(express.static(__dirname));

// --- Start server ---
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});