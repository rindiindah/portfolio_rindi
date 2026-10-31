/* ==========================================================================
   motion.js — the scroll storytelling (GSAP + ScrollTrigger + Lenis).

   Rules this file follows (see the blueprint):
   - Each reveal plays once, never again.
   - Nothing moves while the visitor isn't scrolling or hovering.
   - Parallax only on larger screens.
   - prefers-reduced-motion: no smooth scroll, no parallax, no overshoot.
   - Content never depends on animation: if this script fails, the safety timer in
     Base.astro removes the "js" class and everything is simply visible.
   ========================================================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function init() {
  gsap.registerPlugin(ScrollTrigger);

  // Reduced motion: show everything immediately and stop here.
  if (reduceMotion) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in', 'is-done'));
    window.__motionReady = true;
    return;
  }

  /* ---------- Smooth scrolling (Lenis) ---------- */
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page links ("#projects") scroll smoothly; links to other pages are left alone.
  // Each section lands with its heading a fixed distance under the nav bar, instead of the section's empty top padding.
  const docY = (el) => {
    // position on the page, ignoring transforms (a reveal animation that has not played yet shifts things 28px)
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  };
  const navH = () => parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 68;
  const scrollTarget = (id) => {
    if (id === 'top') return 0;
    const el = document.getElementById(id);
    if (!el) return null;
    // what should sit just under the nav: the section's heading, or the block / project title itself
    const head = el.matches('.chapter')
      ? el.querySelector('.chapter-head')
      : el.querySelector('.others-label, .project-head');
    return Math.max(0, Math.round(docY(head || el) - navH() - 34)); // 34px of air under the nav, same for every link
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash || url.hash === '#') return;

    const id = decodeURIComponent(url.hash.slice(1));
    const y = scrollTarget(id);
    if (y === null) return;

    e.preventDefault();
    lenis.scrollTo(y, {
      // The page can change height while it scrolls (images load, things reveal), so check again at the end
      onComplete: () => {
        const again = scrollTarget(id);
        if (again !== null && Math.abs(again - window.scrollY) > 2) lenis.scrollTo(again, { duration: 0.4 });
      },
    });
    history.pushState(null, '', url.hash);
  });

  /* ---------- Landing: everything rises in (plays once, ~1s) ---------- */
  // while the welcome screen plays the hero waits (splash.js calls window.__playHero when it leaves)
  const heroTl = gsap.timeline({ defaults: { ease: 'power2.out' }, paused: Boolean(window.__splashActive) });
  window.__playHero = () => heroTl.play();
  heroTl
    .fromTo(
      '[data-hero]',
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, clearProps: 'transform' },
      0
    );

  /* ---------- Scroll reveals (once) ----------
     IntersectionObserver rather than ScrollTrigger so that elements above the viewport
     after a reload are still revealed when you scroll back to them. */
  // One tween per element (with its own delay). A single staggered tween would only call
  // onStart/onComplete once, leaving every element but the first without its "is-in" class,
  // and the CSS would hide them again as soon as GSAP clears its inline styles.
  const revealGroup = (els) => {
    els.forEach((el, i) => {
      const pop = el.dataset.reveal === 'pop';
      gsap.to(el, {
        opacity: 1,
        y: 0,
        ...(pop ? { scale: 1 } : {}),
        duration: pop ? 0.5 : 0.7,
        delay: i * (pop ? 0.08 : 0.09),
        ease: pop ? 'back.out(1.4)' : 'power2.out', // gentle overshoot, small elements only
        onStart: () => el.classList.add('is-in'),
        onComplete: () => el.classList.add('is-done'),
        clearProps: 'opacity,transform',
      });
    });
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      if (!visible.length) return;
      visible.forEach((el) => revealObserver.unobserve(el));
      revealGroup(visible);
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

  /* ---------- Larger screens: soft parallax ---------- */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 820px)', () => {
    // Landing text drifts a little slower than the page and fades out.
    gsap.to('[data-landing-inner]', {
      yPercent: 14,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Profile photo moves slightly slower than its frame.
    if (document.querySelector('.photo-img')) {
      gsap.fromTo(
        '.photo-img',
        { yPercent: 5 },
        {
          yPercent: -5,
          ease: 'none',
          scrollTrigger: {
            trigger: '.photo-frame',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }
  });

  /* ---------- Layout settles after fonts/images load ---------- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  window.__motionReady = true;
}

try {
  init();
} catch (err) {
  // If anything goes wrong, make sure the content is simply visible.
  console.error('[motion] animation failed to start, showing static page', err);
  root.classList.remove('js');
}
