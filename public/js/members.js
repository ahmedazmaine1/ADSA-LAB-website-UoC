/* =========================================================
   DANSA Lab — members.js  (fully static)
   Renders the Members page from data/members.js. Groups, counts,
   and the Alumni section all derive from the data.
   ========================================================= */
(() => {
    "use strict";
    const root = document.getElementById("members-root");
    if (!root) return;

    const esc = (s = "") =>
        String(s).replace(/[&<>"]/g, (c) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
        );
    const initials = (name) => {
        const p = String(name || "").trim().split(/\s+/).filter(Boolean);
        if (!p.length) return "?";
        return ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
    };
    // role defaults to the group's singular ("MSc Students" -> "MSc Student")
    const roleFor = (m) => m.role || String(m.group || "").replace(/s$/, "");

    function row(m) {
        const img = m.photo
            ? `<img src="images/${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy" onerror="this.remove()" />`
            : "";
        const photo = `<figure class="m-photo"><span class="ph-initials">${esc(initials(m.name))}</span>${img}</figure>`;
        const id = `<div class="m-id"><div class="m-name">${esc(m.name)}</div><div class="m-role">${esc(roleFor(m))}</div></div>`;
        return m.bio
            ? `<a class="m-row" href="pages/${esc(m.bio)}">${photo}${id}</a>`
            : `<div class="m-row">${photo}${id}</div>`;
    }
    function group(name, members, id) {
        if (!members.length) return "";
        const count = String(members.length).padStart(2, "0");
        return (
            `<div class="m-group"${id ? ` id="${id}"` : ""}>` +
            `<div class="m-group-head"><h3 class="m-group-name">${esc(name)}</h3><span class="m-group-count">${count}</span></div>` +
            `<div class="m-list">${members.map(row).join("")}</div>` +
            `</div>`
        );
    }

    const members = (window.LAB && window.LAB.members) || [];
    const order = (window.LAB && window.LAB.groupOrder) || [];

    let html = "";
    for (const g of order) {
        html += group(g, members.filter((m) => !m.alumni && m.group === g));
    }
    html += group("Alumni", members.filter((m) => m.alumni), "alumni");

    root.innerHTML = html || `<p class="pub-empty">No members to show.</p>`;
})();
