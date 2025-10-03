//-----------------------// --- 1. Menu Toggle for Mobile ---
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

// --- 6. Contact: POST to backend -> Outlook inbox; mailto fallback ---
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

        // If no endpoint configured, fall back to mailto:
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