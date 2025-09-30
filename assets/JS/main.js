const nav = document.getElementById('dynamic-nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
const yearEl = document.getElementById('year');

const state = {
    collapsed: false,
    lastScrollY: window.scrollY,
};

const collapseNav = () => {
    if (!nav) return;
    const shouldCollapse = window.scrollY > 120;
    if (shouldCollapse !== state.collapsed) {
        nav.classList.toggle('is-collapsed', shouldCollapse);
        state.collapsed = shouldCollapse;
    }
};

const smoothScroll = (targetId) => {
    const target = document.querySelector(targetId);
    if (!target) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReduced ? 'auto' : 'smooth';
    target.scrollIntoView({ behavior, block: 'start' });
};

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        navToggle.classList.toggle('is-open', isOpen);
    });
}

if (navLinks) {
    navLinks.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        event.preventDefault();
        smoothScroll(link.getAttribute('href'));
        navLinks.classList.remove('is-open');
        navToggle?.classList.remove('is-open');
    });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        const link = event.currentTarget;
        if (link.closest('.nav-links')) return; // already handled above
        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;
        event.preventDefault();
        smoothScroll(hash);
    });
});

window.addEventListener('scroll', () => {
    window.requestAnimationFrame(collapseNav);
});

collapseNav();

yearEl && (yearEl.textContent = new Date().getFullYear());

const revealables = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.2 }
);

revealables.forEach((el) => observer.observe(el));

const parallaxElements = document.querySelectorAll('[data-parallax]');
if (parallaxElements.length) {
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const update = () => {
        pointer.x += (target.x - pointer.x) * 0.12;
        pointer.y += (target.y - pointer.y) * 0.12;
        parallaxElements.forEach((el) => {
            el.style.setProperty('--parallax-x', `${pointer.x.toFixed(2)}px`);
            el.style.setProperty('--parallax-y', `${pointer.y.toFixed(2)}px`);
        });
        requestAnimationFrame(update);
    };
    update();

    window.addEventListener('pointermove', (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        target.x = x * 24;
        target.y = y * 18;
    });
}

const tiltCards = document.querySelectorAll('.tilt-card');
if (tiltCards.length) {
    tiltCards.forEach((card) => {
        const depth = parseFloat(card.dataset.depth || '0.12');
        const state = { x: 0, y: 0, targetX: 0, targetY: 0, raf: null };

        const animate = () => {
            state.x += (state.targetX - state.x) * 0.16;
            state.y += (state.targetY - state.y) * 0.16;
            card.style.setProperty('--tilt-rotate-x', `${state.x}deg`);
            card.style.setProperty('--tilt-rotate-y', `${state.y}deg`);
            card.style.setProperty('--tilt-translate-z', `${Math.max(Math.abs(state.x), Math.abs(state.y)) * 1.2}px`);
            if (Math.abs(state.x - state.targetX) > 0.01 || Math.abs(state.y - state.targetY) > 0.01) {
                state.raf = requestAnimationFrame(animate);
            } else {
                state.raf = null;
            }
        };

        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            state.targetX = y * -depth * 60;
            state.targetY = x * depth * 60;
            card.classList.add('is-tilting');
            if (!state.raf) {
                state.raf = requestAnimationFrame(animate);
            }
        });

        const reset = () => {
            state.targetX = 0;
            state.targetY = 0;
            if (!state.raf) {
                state.raf = requestAnimationFrame(animate);
            }
            setTimeout(() => card.classList.remove('is-tilting'), 200);
        };

        card.addEventListener('pointerleave', reset);
        card.addEventListener('pointerup', reset);
    });
}

const rippleTargets = document.querySelectorAll('.ripple');
if (rippleTargets.length) {
    rippleTargets.forEach((target) => {
        target.addEventListener('pointerdown', () => {
            target.classList.add('is-active');
        });
        target.addEventListener('pointerup', () => target.classList.remove('is-active'));
        target.addEventListener('pointerleave', () => target.classList.remove('is-active'));
    });
}

let scrollVelocity = 0;
let ticking = false;

const handleScrollEffects = () => {
    const currentY = window.scrollY;
    scrollVelocity += (currentY - state.lastScrollY - scrollVelocity) * 0.1;
    state.lastScrollY = currentY;

    const blurAmount = Math.min(40, Math.abs(scrollVelocity) * 0.12);
    document.body.style.setProperty('--dynamic-blur', blurAmount.toFixed(2));
    ticking = false;
};

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(handleScrollEffects);
        ticking = true;
    }
});

handleScrollEffects();
