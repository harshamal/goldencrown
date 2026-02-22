document.addEventListener('DOMContentLoaded', () => {
    fetch('header.html')
        .then(r => r.text())
        .then(html => {
            /* Create <header> and push to top of <body> */
            const el = document.createElement('header');
            el.id = 'site-header';
            el.className = 'header';
            el.innerHTML = html;
            document.body.insertBefore(el, document.body.firstChild);

            /* ⚠️  CRITICAL: Move the mobile drawer & overlay OUT of <header>.
               A position:fixed child of a CSS-transformed element is NOT fixed
               to the viewport — it's contained by the transform context.
               The header uses transform:translateX(-50%) when scrolled,
               which would trap any fixed children inside it. */
            const overlay = el.querySelector('#mobile-overlay');
            const drawer = el.querySelector('#mobile-menu');
            if (overlay) document.body.appendChild(overlay);
            if (drawer) document.body.appendChild(drawer);

            _initHeader(el);
        })
        .catch(err => console.error('Header load failed:', err));
});


function _initHeader(header) {

    /* ── 1. Mark the active page link ─────────────────────────── */
    // Strip .html and leading slash so both "tours" and "tours.html" match
    const rawPage = window.location.pathname.split('/').pop() || 'index';
    const page = rawPage.replace(/\.html$/i, '').toLowerCase() || 'index';

    header.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        const rawHref = (link.getAttribute('href') || '').split('/').pop();
        const href = rawHref.replace(/\.html$/i, '').toLowerCase();
        if (href === page) {
            link.classList.add('active-link');
        }
    });

    /* ── 2. Scroll → pill transition ─────────────────────────── */
    const SCROLL_THRESHOLD = 80;   // px before pill appears
    let ticking = false;

    const onScroll = () => {
        if (ticking) return;
        ticking = true;

        /* Batch with the browser's paint cycle — prevents layout thrash */
        requestAnimationFrame(() => {
            if (window.scrollY > SCROLL_THRESHOLD) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
            ticking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* apply immediately on load */

    /* ── 3. Mobile drawer ────────────────────────────────────── */
    const overlay = document.getElementById('mobile-overlay');
    const drawer = document.getElementById('mobile-menu');
    const openBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close');

    function openDrawer() {
        if (!drawer) return;
        drawer.classList.add('open');
        if (overlay) {
            overlay.style.display = 'block';
            /* Small rAF so display:block paint happens before opacity transition */
            requestAnimationFrame(() => overlay.classList.add('show'));
        }
        document.body.style.overflow = 'hidden'; /* prevent background scroll */
    }

    function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('show');
            overlay.addEventListener('transitionend', () => {
                overlay.style.display = 'none';
            }, { once: true });
        }
        document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    /* Close on link click inside drawer */
    if (drawer) {
        drawer.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', closeDrawer)
        );
    }
}
