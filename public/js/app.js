/* =========================================================
   DANSA Lab — app.js
   Global behaviours shared by every page:
   · mobile nav toggle      · footer year
   · reveal-on-scroll        · nav scrollspy (home anchors)
   Kept dependency-free and tiny.
   ========================================================= */
(() => {
    "use strict";

    /* ---- mobile nav ---- */
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".site-nav ul");
    if (toggle && menu) {
        const setOpen = (open) => {
            toggle.classList.toggle("active", open);
            menu.classList.toggle("active", open);
            toggle.setAttribute("aria-expanded", String(open));
            document.body.style.overflow = open ? "hidden" : "";
        };
        toggle.addEventListener("click", () =>
            setOpen(!menu.classList.contains("active"))
        );
        menu.querySelectorAll("a").forEach((a) =>
            a.addEventListener("click", () => setOpen(false))
        );
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") setOpen(false);
        });
    }

    /* ---- home: hide the fixed top nav until you scroll past the hero,
            where the nav is listed beside the logo instead ---- */
    const autoHeader = document.querySelector(".site-header[data-autohide]");
    const heroMast = document.querySelector(".hero-masthead");
    if (autoHeader && heroMast && "IntersectionObserver" in window) {
        autoHeader.classList.add("is-autohide");
        const headerIO = new IntersectionObserver(
            ([entry]) =>
                autoHeader.classList.toggle("is-visible", !entry.isIntersecting),
            { threshold: 0 }
        );
        headerIO.observe(heroMast);
    }

    /* ---- footer year ---- */
    document.querySelectorAll("#year, [data-year]").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

    /* ---- reveal on scroll ---- */
    const reveals = document.querySelectorAll(".reveal");
    if (reveals.length && "IntersectionObserver" in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in");
                        io.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add("in"));
    }

    /* ---- nav scrollspy (only for same-page anchors) ---- */
    const spyLinks = Array.from(
        document.querySelectorAll('.site-nav a[href*="#"]')
    ).filter((a) => {
        const url = new URL(a.href, location.href);
        return url.pathname === location.pathname && url.hash;
    });
    const sections = spyLinks
        .map((a) => document.querySelector(new URL(a.href, location.href).hash))
        .filter(Boolean);

    if (sections.length && "IntersectionObserver" in window) {
        const spy = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.id;
                    spyLinks.forEach((a) =>
                        a.classList.toggle(
                            "is-active",
                            new URL(a.href, location.href).hash === "#" + id
                        )
                    );
                });
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );
        sections.forEach((s) => spy.observe(s));
    }
})();
