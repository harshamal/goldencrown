/* Crown Global Services — shared behavior */

(function () {
    'use strict';

    /* Header scroll state */
    const header = document.querySelector('.site-header');
    if (header) {
        const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* Mobile drawer */
    const drawer = document.querySelector('.drawer');
    const toggle = document.querySelector('.menu-toggle');
    if (drawer && toggle) {
        toggle.addEventListener('click', () => drawer.classList.add('open'));
        drawer.querySelector('.drawer-close').addEventListener('click', () => drawer.classList.remove('open'));
        drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));
    }

    /* Mark active nav link */
    const path = location.pathname.replace(/index\.html$/, '') || '/';
    document.querySelectorAll('.site-header nav a, .drawer a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === path) a.classList.add('active');
    });

    /* Reveal on scroll */
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

    /* Animated counters */
    const counterIO = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const dur = 1800;
            const start = performance.now();
            const tick = now => {
                const p = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.floor(eased * target).toLocaleString() + (p === 1 ? suffix : '');
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            counterIO.unobserve(el);
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('[data-target]').forEach(el => counterIO.observe(el));

    /* Horizontal scrollers */
    document.querySelectorAll('.scroller-wrap').forEach(wrap => {
        const scroller = wrap.querySelector('.scroller');
        const prev = wrap.querySelector('.scroll-prev');
        const next = wrap.querySelector('.scroll-next');
        if (!scroller) return;
        const step = () => Math.min(scroller.clientWidth * 0.8, 700);
        if (prev) prev.addEventListener('click', () => scroller.scrollBy({ left: -step(), behavior: 'smooth' }));
        if (next) next.addEventListener('click', () => scroller.scrollBy({ left: step(), behavior: 'smooth' }));
    });

    /* Modals */
    window.openModal = function (id, presetService) {
        const overlay = document.getElementById(id);
        if (!overlay) return;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (presetService) {
            const sel = overlay.querySelector('[name="service"], [name="interest"], [name="tour"]');
            if (sel) sel.value = presetService;
        }
    };

    window.closeModal = function (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => { if (e.target === overlay) window.closeModal(overlay); });
        const btn = overlay.querySelector('.modal-close');
        if (btn) btn.addEventListener('click', () => window.closeModal(overlay));
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(o => window.closeModal(o));
    });

    document.querySelectorAll('[data-modal]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            window.openModal(el.dataset.modal, el.dataset.service || '');
        });
    });

    /* Formspree async submit */
    document.querySelectorAll('form[data-async]').forEach(form => {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const status = form.querySelector('.form-status');
            const btn = form.querySelector('button[type="submit"]');
            const label = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Sending…';
            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });
                if (res.ok) {
                    form.reset();
                    status.className = 'form-status ok';
                    status.textContent = 'Thank you. Your message has been received and our team will reach out within 24 to 48 hours.';
                } else {
                    throw new Error('bad response');
                }
            } catch (err) {
                status.className = 'form-status err';
                status.textContent = 'Something went wrong while sending your message. Please try again or call us on +94 11 250 5108.';
            } finally {
                btn.disabled = false;
                btn.textContent = label;
            }
        });
    });

    /* Page preloader / splash screen fadeout.
       Hide as soon as the DOM is ready — do NOT wait for window.load,
       which would block on dozens of external images and feel slow. */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const hide = () => preloader.classList.add('fade-out');
        // DOMContentLoaded has already fired by the time site.js runs at end of body
        requestAnimationFrame(() => setTimeout(hide, 250));
        setTimeout(hide, 1200); // hard safety cap
    }

    /* Parallax background videos */
    const parallaxVideos = document.querySelectorAll('.parallax-video');
    if (parallaxVideos.length > 0) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion) {
            let ticking = false;
            const updateParallax = () => {
                ticking = false;
                const vh = window.innerHeight;
                parallaxVideos.forEach(vid => {
                    const parent = vid.parentElement;
                    if (!parent) return;
                    const r = parent.getBoundingClientRect();
                    if (r.bottom < 0 || r.top > vh) return;
                    const prog = (r.top + r.height / 2 - vh / 2) / vh;
                    const shift = Math.max(-10, Math.min(10, prog * -10));
                    vid.style.transform = 'translateY(' + shift + '%)';
                });
            };
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    ticking = true;
                    requestAnimationFrame(updateParallax);
                }
            }, { passive: true });
            updateParallax();
        }
    }
})();
