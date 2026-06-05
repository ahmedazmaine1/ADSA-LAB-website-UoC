/* =========================================================
   DANSA Lab — featured publications.
   Edit this list; js/publications.js renders it.

   Each entry is EITHER:
     • { doi: "10.xxxx/yyyy" }                  ← metadata fetched from Crossref
   OR a hardcoded fallback (use when there's no DOI, or Crossref can't be reached):
     • { title, authors: ["A. One", "B. Two"], year: 2025, venue: "…", url: "https://…" }
   You can also give an entry a doi AND fallback fields — the DOI is used when
   it resolves, the fields are used if it doesn't.

   Newest first is handled automatically (sorted by year).
   ========================================================= */
window.LAB = window.LAB || {};

window.LAB.publications = [
    { doi: "10.1007/s10462-026-11535-4" },
    { doi: "10.3390/software5010004" },
    { doi: "10.1016/j.array.2026.100841" },
    { doi: "10.1007/s13721-026-00763-x" },
    { doi: "10.1007/s13721-025-00698-9" },
    { doi: "10.1007/s13721-025-00726-8" },

    // Example hardcoded entry (no DOI):
    // {
    //   title: "A paper without a DOI",
    //   authors: ["Falah Sheikh", "Reda Alhajj"],
    //   year: 2025,
    //   venue: "Some Workshop",
    //   url: "https://example.org/paper.pdf",
    // },
];
