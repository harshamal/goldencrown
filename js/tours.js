/* Renders tour collections and the itinerary viewer */

(function () {
    'use strict';

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    function tourCard(tour, idx) {
        return `
        <article class="card tour-card">
            <div class="card-media">
                <img src="${esc(tour.image)}" alt="${esc(tour.title)}" loading="lazy">
                <span class="card-tag">${esc(tour.duration)}</span>
            </div>
            <div class="card-body">
                <div class="tour-meta">
                    <span class="tour-price">${esc(tour.price)}</span>
                    <span class="tour-days">${(tour.itinerary || []).length} days</span>
                </div>
                <h3>${esc(tour.title)}</h3>
                <p class="tour-desc">${esc(tour.description || (tour.itinerary && tour.itinerary.length ? tour.itinerary.length + ' curated days of travel, stays and guided experiences.' : ''))}</p>
                <button class="btn-itinerary view-itinerary" data-idx="${idx}"><span>View Itinerary</span> <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </article>`;
    }

    function renderItinerary(tour) {
        const days = (tour.itinerary || []).map((d, i) => {
            const hasImg = d.image && d.image.trim();
            return `
            <div class="itin-day">
                <div class="itin-day-rail"><span class="itin-day-num">${String(i + 1).padStart(2, '0')}</span></div>
                <div class="itin-day-card${hasImg ? '' : ' no-img'}">
                    ${hasImg ? `<img class="itin-img" src="${esc(d.image)}" alt="${esc(d.title)}" loading="lazy">` : ''}
                    <div class="itin-day-text">
                        <div class="itin-label">${esc(d.day)}</div>
                        <h4>${esc(d.title)}</h4>
                        <p>${esc(d.desc)}</p>
                    </div>
                </div>
            </div>`;
        }).join('');

        const list = (items, cls, icon, label) => !items || !items.length ? '' : `
            <div class="itin-inc ${cls}">
                <div class="itin-inc-head"><i class="fa-solid ${icon}"></i> ${label}</div>
                <ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
            </div>`;

        const incExc = (tour.inclusions || tour.exclusions) ? `
            <div class="itin-incexc">
                ${list(tour.inclusions, 'is-inc', 'fa-circle-check', 'Inclusions')}
                ${list(tour.exclusions, 'is-exc', 'fa-circle-xmark', 'Exclusions')}
            </div>` : '';

        return `
            <div class="itin-hero">
                <img src="${esc(tour.image)}" alt="${esc(tour.title)}">
                <div class="itin-hero-scrim"></div>
                <div class="itin-hero-content">
                    <span class="eyebrow">Curated Itinerary</span>
                    <h3>${esc(tour.title)}</h3>
                    <div class="itin-chips">
                        <span class="itin-chip"><i class="fa-regular fa-clock"></i> ${esc(tour.duration)}</span>
                        <span class="itin-chip itin-chip-price">${esc(tour.price)}</span>
                    </div>
                </div>
            </div>
            <div class="itin-body">
                ${tour.description ? `<p class="itin-intro">${esc(tour.description)}</p>` : ''}
                ${tour.highlights ? `<div class="itin-highlights"><i class="fa-solid fa-star"></i><div><strong>Highlights</strong>${esc(tour.highlights)}</div></div>` : ''}
                <div class="itin-days">${days}</div>
                ${incExc}
                <button class="btn btn-solid itin-cta" data-modal="inquiry-modal" data-service="${esc(tour.title)}">Inquire About This Tour</button>
            </div>`;
    }

    window.renderTours = function (tours, gridId) {
        const grid = document.getElementById(gridId);
        if (!grid || !tours) return;
        grid.innerHTML = tours.map((t, i) => tourCard(t, i)).join('');

        const overlay = document.getElementById('itinerary-modal');
        const body = overlay.querySelector('.modal-body');

        grid.querySelectorAll('.view-itinerary').forEach(btn => {
            btn.addEventListener('click', () => {
                const tour = tours[parseInt(btn.dataset.idx, 10)];
                body.innerHTML = renderItinerary(tour);
                body.querySelectorAll('[data-modal]').forEach(el => {
                    el.addEventListener('click', () => {
                        window.closeModal(overlay);
                        window.openModal(el.dataset.modal, el.dataset.service || '');
                    });
                });
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                overlay.querySelector('.modal').scrollTop = 0;
            });
        });
    };
})();
