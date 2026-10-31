/* ==========================================================================
   ui.js — everyday behavior. No animation library needed, so the site stays
   usable even if the animation script (motion.js) never starts.
   ========================================================================== */

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Nav: mobile menu ---------- */
const nav = document.querySelector('[data-nav]');
const menuBtn = document.querySelector('[data-menu-btn]');

if (nav && menuBtn) {
  const setOpen = (open) => {
    nav.toggleAttribute('data-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setOpen(!nav.hasAttribute('data-open')));
  nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

/* ---------- Nav: sticky ----------
   The bar stays visible the whole time (position: fixed in CSS), so every section is one click away. */

/* ---------- Hero photo: gone the moment you start scrolling ----------
   No slow fade: one quick snap out of view, and it comes straight back when you return to the very top. */
const heroPhoto = document.querySelector('[data-hero-photo]');
if (heroPhoto) {
  const sync = () => heroPhoto.classList.toggle('is-away', window.scrollY > 6);
  window.addEventListener('scroll', sync, { passive: true });
  sync();
}

/* ---------- Chapter tint + active nav link ----------
   The section that is under a line 35% down the screen is the current one. It sets the page tint,
   the progress bar color and the nav's dot. This is worked out from the scroll position every time
   (not from "a section just entered"), so it is always right, also for About (which contains Skills,
   the deeper one wins) and also after a click on the nav. */
const chapters = [...document.querySelectorAll('[data-chapter]')];
const navLinks = new Map(
  [...document.querySelectorAll('[data-nav-link]')].map((a) => [a.dataset.navLink, a])
);

if (chapters.length) {
  let active = null;
  const setChapter = (el) => {
    if (el.dataset.tint) root.style.setProperty('--page-bg', el.dataset.tint);
    root.style.setProperty('--bar', `var(--${el.dataset.accent || 'sky'})`);
    navLinks.forEach((a, key) => {
      if (key === el.dataset.chapter) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };
  const pick = () => {
    const probe = window.innerHeight * 0.35;
    let best = chapters[0];
    for (const c of chapters) {
      const r = c.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) best = c; // later in the page (deeper) wins
    }
    // at the very bottom of the page the last section is the current one
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      best = chapters[chapters.length - 1];
    }
    if (best !== active) {
      active = best;
      setChapter(best);
    }
  };
  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      pick();
    });
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('load', queue);
  pick();
}

/* ---------- Scroll progress bar ---------- */
const bar = document.querySelector('[data-progress]');
if (bar) {
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.setProperty('--p', p.toFixed(4));
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
}

/* ---------- Photo: gentle tilt that follows the pointer (mouse only) ---------- */
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (canHover && !reduceMotion) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const frame = el.querySelector('.photo-frame') ?? el;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      frame.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
      frame.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      frame.style.setProperty('--ry', '0deg');
      frame.style.setProperty('--rx', '0deg');
    });
  });
}

/* ---------- Hero: name and photo drift in opposite directions with the pointer ---------- */
if (canHover && !reduceMotion) {
  const stage = document.querySelector('[data-hero-stage]');
  if (stage) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      stage.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      stage.style.setProperty('--my', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--mx', '0');
      stage.style.setProperty('--my', '0');
    });
  }
}

/* ---------- Carousels (project documentation) ----------
   The slides are a snap-scrolling strip, so swiping works natively; this adds the arrows, dots,
   arrow keys, automatic sliding, and (for "Other projects") syncing the name + description.
   Automatic sliding pauses while the pointer is over it, while it has keyboard focus, while it
   is off screen or the tab is hidden, and never runs with "reduce motion".

   Video slides (screen recordings): the clip plays while its slide is the one on screen, pauses when
   you hover, look away or switch tab, and click/tap toggles it. In a carousel that slides by itself the
   clip plays once and then the carousel moves on; in the others it loops. With "reduce motion" nothing
   autoplays and the clip gets normal player controls instead. */
const carousels = [];
document.querySelectorAll('[data-carousel]').forEach((box) => {
  const track = box.querySelector('[data-slides]');
  const slides = [...track.children];
  const dots = [...box.querySelectorAll('[data-slide-dot]')];
  const count = box.querySelector('[data-slide-count]');
  const n = slides.length;
  const behavior = reduceMotion ? 'auto' : 'smooth';
  const delay = Number(box.dataset.autoplay) || 0;
  const sync = box.hasAttribute('data-sync') ? box.closest('[data-others]') : null;

  const current = () => Math.min(n - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));
  const goTo = (i) => track.scrollTo({ left: ((i + n) % n) * track.clientWidth, behavior });

  /* "Other projects": the name, meta line and description follow the project of the visible slide */
  let shownProject = -1;
  const showProject = (idx) => {
    if (!sync || idx === shownProject) return;
    shownProject = idx;
    const blocks = [...sync.querySelectorAll('.desc-block')];
    blocks.forEach((b) => {
      b.hidden = Number(b.dataset.project) !== idx;
    });
    const b = blocks.find((x) => Number(x.dataset.project) === idx);
    if (!b) return;
    const title = sync.querySelector('[data-sync-title]');
    const meta = sync.querySelector('[data-sync-meta]');
    if (title) title.textContent = b.dataset.title;
    if (meta) meta.textContent = b.dataset.meta;
    sync.dataset.accent = b.dataset.accent;
  };

  /* state shared by the autoplay and the video code below */
  let timer = 0;
  let hovered = false;
  let focused = false;
  let touching = false;
  let visible = false;

  /* video slides */
  const clips = slides.map((s) => s.querySelector('[data-slide-video]'));
  const hasVideo = clips.some(Boolean);
  const userPaused = new Set(); // clips the visitor paused on purpose
  const broken = new Set(); // clips that cannot play in this browser

  const stop = () => clearTimeout(timer);
  // hovering only stops the carousel from sliding away; a clip you are watching keeps playing
  const wantsPlay = () => visible && !touching && !document.hidden && !reduceMotion;

  const syncClips = () => {
    if (!hasVideo) return;
    const i = current();
    clips.forEach((v, k) => {
      if (!v) return;
      if (k === i && wantsPlay() && !userPaused.has(k) && !broken.has(k)) {
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  };

  const arm = () => {
    stop();
    if (!delay || reduceMotion || hovered || focused || touching || !visible || document.hidden) return;
    const k = current();
    const v = clips[k];
    if (v && !broken.has(k) && !userPaused.has(k)) {
      // a video slide moves on when its clip ends (see below); if it already ended while we were hovering, move on now
      if (v.ended) timer = setTimeout(() => goTo(current() + 1), 700);
      return;
    }
    timer = setTimeout(() => goTo(current() + 1), delay);
  };

  clips.forEach((v, k) => {
    if (!v) return;
    const fig = slides[k];
    const bar = fig.querySelector('[data-video-progress]');
    if (reduceMotion) {
      v.controls = true; // no autoplay: let them press play
      fig.querySelector('[data-video-toggle]')?.remove();
    }
    if (!delay) v.loop = true; // a carousel that does not slide by itself just repeats the clip
    v.addEventListener('timeupdate', () => {
      if (bar && v.duration) bar.style.width = `${(v.currentTime / v.duration) * 100}%`;
    });
    v.addEventListener('play', () => fig.classList.remove('is-paused'));
    v.addEventListener('pause', () => fig.classList.toggle('is-paused', !v.ended));
    v.addEventListener('error', () => {
      broken.add(k);
      arm();
    });
    v.addEventListener('ended', () => {
      // after the clip, a carousel that slides by itself moves on
      if (delay && !hovered && !focused && current() === k) setTimeout(() => current() === k && goTo(k + 1), 700);
    });
    fig.querySelector('[data-video-toggle]')?.addEventListener('click', () => {
      if (v.paused) {
        userPaused.delete(k);
        v.play().catch(() => {});
      } else {
        userPaused.add(k);
        v.pause();
      }
    });
  });

  const update = () => {
    const i = current();
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    slides.forEach((s, k) => s.setAttribute('aria-hidden', k === i ? 'false' : 'true'));
    if (count) count.textContent = `${i + 1} / ${n}`;
    showProject(Number(slides[i].dataset.project));
    // leaving a clip rewinds it, so it starts from the beginning when you come back
    clips.forEach((v, k) => {
      if (v && k !== i && v.currentTime > 0) v.currentTime = 0;
    });
    syncClips();
    arm();
  };

  let queued = false;
  track.addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    },
    { passive: true }
  );

  box.querySelector('[data-car-prev]')?.addEventListener('click', () => goTo(current() - 1));
  box.querySelector('[data-car-next]')?.addEventListener('click', () => goTo(current() + 1));
  dots.forEach((d, k) => d.addEventListener('click', () => goTo(k)));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(current() + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(current() - 1);
    }
  });
  window.addEventListener('resize', () => track.scrollTo({ left: current() * track.clientWidth }));

  box.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') {
      hovered = true;
      stop();
    }
  });
  box.addEventListener('pointerleave', () => {
    hovered = false;
    arm();
  });
  // only keyboard focus pauses the sliding (clicking a button with the mouse also focuses it, which must not)
  box.addEventListener('focusin', (e) => {
    if (e.target.matches(':focus-visible')) {
      focused = true;
      stop();
    }
  });
  box.addEventListener('focusout', () => {
    focused = false;
    arm();
  });
  box.addEventListener(
    'touchstart',
    () => {
      touching = true;
      stop();
    },
    { passive: true }
  );
  box.addEventListener(
    'touchend',
    () => {
      setTimeout(() => {
        touching = false;
        syncClips();
        arm();
      }, 2500);
    },
    { passive: true }
  );
  document.addEventListener('visibilitychange', () => {
    syncClips();
    arm();
  });

  if (delay || hasVideo) {
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        syncClips();
        arm();
      },
      { threshold: 0.35 }
    ).observe(box);
  }

  carousels.push({ box, goTo, slides, sync });
  update();
});

/* The project chips under "What I build" can jump straight to a project in the "Other projects" carousel */
document.querySelectorAll('[data-others-goto]').forEach((a) => {
  a.addEventListener('click', () => {
    const idx = Number(a.dataset.othersGoto);
    const c = carousels.find((x) => x.sync);
    if (!c) return;
    const first = c.slides.findIndex((s) => Number(s.dataset.project) === idx);
    if (first >= 0) setTimeout(() => c.goTo(first), 450);
  });
});

/* ---------- Skills filter ---------- */
document.querySelectorAll('[data-skills]').forEach((box) => {
  const buttons = [...box.querySelectorAll('[data-filter]')];
  const cards = [...box.querySelectorAll('[data-group]')];
  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const group = btn.dataset.filter;
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      cards.forEach((c) => {
        c.hidden = group !== 'all' && c.dataset.group !== group;
      });
      // The page got shorter/taller: let ScrollTrigger and the progress bar re-measure.
      window.dispatchEvent(new Event('resize'));
    })
  );
});

/* ---------- Copy email ---------- */
document.querySelectorAll('[data-copy]').forEach((btn) => {
  const state = btn.querySelector('[data-copy-state]');
  const original = state ? state.textContent : '';
  let timer;
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers/contexts without the Clipboard API
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* ignore */
      }
      ta.remove();
    }
    if (state) {
      state.textContent = 'Copied!';
      clearTimeout(timer);
      timer = setTimeout(() => (state.textContent = original), 2000);
    }
  });
});

/* ---------- Credential modal (native <dialog>) ---------- */
const modal = document.getElementById('credential-modal');

if (modal && typeof modal.showModal === 'function') {
  const body = modal.querySelector('[data-credential-body]');
  const titleEl = modal.querySelector('#credential-title');
  const openLink = modal.querySelector('[data-credential-open]');
  const verifyLink = modal.querySelector('[data-credential-verify]');
  let lastTrigger = null;

  const lockScroll = (on) => {
    root.style.overflow = on ? 'hidden' : '';
    if (window.__lenis) on ? window.__lenis.stop() : window.__lenis.start();
  };

  const openCredential = (btn) => {
    lastTrigger = btn;
    const { file, type, title, verify } = btn.dataset;

    titleEl.textContent = title;
    body.replaceChildren();

    const pages = btn.dataset.pages ? JSON.parse(btn.dataset.pages) : null;
    modal.classList.toggle('is-pages', !!pages);
    if (pages) {
      // a document made of page pictures (the addresses are already blurred inside the pictures)
      pages.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${title}, page ${i + 1} of ${pages.length}`;
        body.append(img);
      });
    } else if (type === 'pdf') {
      const frame = document.createElement('iframe');
      frame.src = file;
      frame.title = `${title} (PDF)`;
      body.append(frame);
    } else {
      const img = document.createElement('img');
      img.src = file;
      img.alt = `${title} credential`;
      body.append(img);
    }

    openLink.hidden = !!pages;
    openLink.href = pages ? pages[0] : file;
    if (verify) {
      verifyLink.href = verify;
      verifyLink.hidden = false;
    } else {
      verifyLink.hidden = true;
    }

    modal.showModal();
    lockScroll(true);
  };

  document
    .querySelectorAll('[data-open-credential]')
    .forEach((btn) => btn.addEventListener('click', () => openCredential(btn)));

  modal.querySelector('[data-close-credential]')?.addEventListener('click', () => modal.close());
  // A click on the dark backdrop targets the <dialog> itself
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
  modal.addEventListener('close', () => {
    body.replaceChildren();
    lockScroll(false);
    lastTrigger?.focus();
  });
}
