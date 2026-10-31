/* ==========================================================================
   splash.js: the welcome screen "Rindi Indah Lestari / Present". Short (about 4.5 seconds) and light.

   - The big, soft things (water brightening, light rays, moving caustic light, seabed and swaying
     grass) are CSS layers: the browser moves them on the graphics card.
   - The canvas only draws the small living things: bubbles, plankton, three fish, two jellyfish.
     It runs at normal (not high-dpi) resolution, at half frame rate on phones, and stops while the tab
     is hidden.
   - The title only fades and slides (no blur or filter effects).

   Story: gentle light fades in -> the name lifts into place -> "Present" draws in between two
   lines -> the water brightens and the bubbles pick up -> the water drains downward with a foam edge,
   revealing the page. Leave early with the Enter button, Esc, Enter or Space. The page is locked while it
   plays and the hero's entrance waits for it. With "reduce motion" it never shows.
   ========================================================================== */

import gsap from 'gsap';

const root = document.documentElement;
const el = document.querySelector('[data-splash]');

if (el && root.classList.contains('has-splash')) {
  try {
    init();
  } catch (err) {
    console.error('[splash] could not start, skipping it', err);
    finish();
  }
}

function finish() {
  root.classList.remove('has-splash', 'splash-lock');
  el?.remove();
  window.__splashActive = false;
  window.__playHero?.();
  window.__lenis?.start();
}

function init() {
  window.__splashReady = true;
  window.__lenis?.stop();
  root.classList.add('splash-lock');

  const sheet = el.querySelector('[data-splash-sheet]');
  const light = el.querySelector('[data-splash-light]');
  const rays = el.querySelector('[data-splash-rays]');
  const floor = el.querySelector('[data-splash-floor]');
  const cvs = el.querySelector('[data-splash-canvas]');
  const ctx = cvs.getContext('2d');
  const letters = [...el.querySelectorAll('.sl-in')];
  const by = el.querySelector('[data-splash-by]');
  const byLines = el.querySelectorAll('.by-line');
  const sparks = el.querySelectorAll('.splash-spark');
  const skip = el.querySelector('[data-splash-skip]');
  const edge = el.querySelector('.splash-edge');
  const title = el.querySelector('[data-splash-title]');

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const small = window.innerWidth < 700;

  /* ------------------------------------------------ canvas (normal resolution: it only holds small, soft things) */
  let W = 0;
  let H = 0;
  const resize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    cvs.width = W;
    cvs.height = H;
  };
  resize();
  window.addEventListener('resize', resize);

  const load = (src) => {
    const i = new Image();
    i.src = src;
    return i;
  };
  const pic = { gold: load('/images/background/goldfish.webp'), s1: load('/images/background/silver-1.webp'), s2: load('/images/background/silver-2.webp') };
  const ok = (i) => i.complete && i.naturalWidth > 0;

  /* ------------------------------------------------ what lives in the water */
  const S = { life: 0, flow: 1 }; // animated by GSAP
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    ptr.tx = (e.clientX / W - 0.5) * 2;
    ptr.ty = (e.clientY / H - 0.5) * 2;
  });

  const bubbles = [];
  const plankton = Array.from({ length: small ? 22 : 40 }, () => ({ x: Math.random(), y: Math.random(), z: rand(0.3, 1), r: rand(0.8, 1.8), ph: rand(0, 6.28) }));
  const fish = [
    { img: 'gold', w: 0.14, y: 0.64, v: 140, dir: 1, ph: 0, delay: 0.7, z: 1, x: 0.15 },
    { img: 's1', w: 0.095, y: 0.4, v: 110, dir: -1, ph: 2, delay: 1.1, z: 0.8, x: 0.82 },
    { img: 's2', w: 0.08, y: 0.76, v: 95, dir: 1, ph: 4, delay: 1.5, z: 0.7, x: 0.55 },
  ].slice(0, small ? 2 : 3);
  const jellies = [
    { x: 0.14, y: 0.5, r: 0.04, ph: 0.4 },
    { x: 0.86, y: 0.34, r: 0.032, ph: 2.2 },
  ].slice(0, small ? 1 : 2);

  const drawPlankton = (t, dt) => {
    ctx.fillStyle = '#e3f6ff';
    for (const p of plankton) {
      p.y -= dt * 0.012 * p.z * S.flow;
      if (p.y < -0.02) p.y += 1.04;
      ctx.globalAlpha = (0.2 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.2 + p.ph))) * p.z * S.life;
      ctx.beginPath();
      ctx.arc(p.x * W + Math.sin(t * 0.5 + p.ph) * 8 * p.z + ptr.x * -20 * p.z, p.y * H + ptr.y * -12 * p.z, p.r * p.z * 1.3, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  // a simple jellyfish: a soft flat bell and a few wavy threads (no gradients, so it is cheap to draw)
  const drawJelly = (j, t) => {
    const R = j.r * Math.max(W, H * 1.2);
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + j.ph);
    const x = j.x * W + Math.sin(t * 0.25 + j.ph) * W * 0.02 + ptr.x * -16;
    const y = j.y * H - pulse * R * 0.3 + Math.sin(t * 0.3 + j.ph) * H * 0.015 + ptr.y * -10;
    const sx = 1 + pulse * 0.1;
    const sy = 1 - pulse * 0.14;
    ctx.save();
    ctx.globalAlpha = S.life * 0.55;
    ctx.strokeStyle = 'rgba(225,246,255,0.55)';
    ctx.lineWidth = Math.max(1, R * 0.045);
    ctx.lineCap = 'round';
    for (let k = 0; k < 5; k++) {
      const off = (k / 4 - 0.5) * 1.5 * R * sx;
      ctx.beginPath();
      ctx.moveTo(x + off, y);
      for (let s = 1; s <= 6; s++) {
        const u = s / 6;
        ctx.lineTo(x + off * (1 - u * 0.2) + Math.sin(t * 1.6 + k + u * 5) * R * 0.2 * u, y + u * R * (2.1 + (k % 3) * 0.4));
      }
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(x, y, R * sx, R * sy, 0, Math.PI, 0);
    ctx.quadraticCurveTo(x, y + R * 0.3, x - R * sx, y);
    ctx.fillStyle = 'rgba(205,238,255,0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(240,251,255,0.65)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  };

  const drawFish = (f, t, dt) => {
    const img = pic[f.img];
    if (!ok(img) || t < f.delay) return;
    const w = f.w * Math.max(W, 900);
    const h = w * (img.naturalHeight / img.naturalWidth);
    f.x += f.dir * dt * (f.v / W) * (0.7 + 0.4 * S.flow);
    if (f.dir > 0 && f.x > 1.2) f.x = -0.2;
    if (f.dir < 0 && f.x < -0.2) f.x = 1.2;
    ctx.save();
    ctx.globalAlpha = S.life * clamp((t - f.delay) / 0.8, 0, 1) * (0.6 + 0.4 * f.z);
    ctx.translate(f.x * W + ptr.x * -22 * f.z, f.y * H + Math.sin(t * 1.3 + f.ph) * H * 0.012 + ptr.y * -12 * f.z);
    ctx.rotate(Math.sin(t * 1.3 + f.ph + 1.5) * 0.05 * f.dir);
    ctx.scale(f.dir > 0 ? -1 : 1, 1); // the pictures face left
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  };

  const drawBubbles = (t, dt) => {
    let spawn = (small ? 6 : 10) * S.flow * (0.3 + S.life) * dt;
    while (spawn > 0 && bubbles.length < (small ? 40 : 70)) {
      if (Math.random() < spawn) {
        const r = 1.5 + Math.pow(Math.random(), 2.2) * (small ? 5 : 8);
        bubbles.push({ x: Math.random() * W, y: H + 12, r, v: (24 + r * 7) * rand(0.7, 1.15), ph: rand(0, 6.28), w: rand(5, 14) });
      }
      spawn -= 1;
    }
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = 'rgba(235,250,255,0.6)';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.v * dt * S.flow;
      b.x += Math.sin(t * 1.4 + b.ph) * b.w * dt;
      if (b.y < -20) {
        bubbles.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, 6.283);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, Math.max(0.6, b.r * 0.25), 0, 6.283);
      ctx.fill();
    }
  };

  /* ------------------------------------------------ loop (pauses when the tab is hidden; half rate on phones) */
  let running = true;
  let last = performance.now();
  const t0 = last;
  let skipFrame = false;
  const frame = (now) => {
    if (!running) return;
    requestAnimationFrame(frame);
    if (document.hidden) {
      last = now;
      return;
    }
    if (small) {
      skipFrame = !skipFrame;
      if (skipFrame) return;
    }
    const dt = Math.min(0.06, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;
    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 3);
    ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 3);

    ctx.clearRect(0, 0, W, H);
    drawPlankton(t, dt);
    for (const j of jellies) drawJelly(j, t);
    for (const f of fish) drawFish(f, t, dt);
    drawBubbles(t, dt);
  };
  requestAnimationFrame(frame);

  /* ------------------------------------------------ the story */
  const TOTAL = 3.5; // when the water starts to drain
  // Start paused: the script font (Great Vibes) is only downloaded when the title first needs it, so wait for it
  // (at least a moment, at most MAX_WAIT) and then play. This way the name never shows in the fallback font first.
  const MIN_WAIT = 0.25;
  const MAX_WAIT = 1.2;
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, paused: true });
  const fontLoaded = document.fonts?.load ? document.fonts.load('1em "Great Vibes"', 'Rindi Indah Lestari').catch(() => {}) : Promise.resolve();
  Promise.all([
    Promise.race([fontLoaded, new Promise((r) => setTimeout(r, MAX_WAIT * 1000))]),
    new Promise((r) => setTimeout(r, MIN_WAIT * 1000)),
  ]).then(() => {
    if (!leaving) tl.play();
  });

  gsap.set(letters, { yPercent: 105, opacity: 0 });
  gsap.set(by, { y: 8 });
  gsap.set(sparks, { scale: 0.4 });
  gsap.set(skip, { y: 8 });

  tl.to(light, { opacity: 0.45, duration: 1.8, ease: 'sine.inOut' }, 0)
    .to(rays, { opacity: 1, duration: 1.4, ease: 'sine.out' }, 0.15)
    .to(floor, { opacity: 1, duration: 1.2, ease: 'sine.out' }, 0.2)
    .to(S, { life: 1, duration: 1.2, ease: 'sine.out' }, 0.2)
    // the title lifts into place
    .to(letters, { yPercent: 0, opacity: 1, duration: 0.95, ease: 'power3.out', stagger: 0.16 }, 0.3)
    // "Present"
    .to(by, { opacity: 1, y: 0, duration: 0.8 }, 1.15)
    .to(byLines, { scaleX: 1, duration: 0.9, ease: 'power3.out' }, 1.25)
    .to(sparks, { opacity: 0.9, scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.2 }, 1.35)
    .to(skip, { opacity: 1, y: 0, duration: 0.5 }, 1.7)
    // the water brightens and the bubbles pick up
    .to(light, { opacity: 0.7, duration: 1.5, ease: 'sine.inOut' }, 2.0)
    .to(S, { flow: 3, duration: 1.2, ease: 'power2.in' }, TOTAL - 1.1)
    .call(() => leave(), null, TOTAL);

  /* ------------------------------------------------ leaving: the water drains downward */
  let leaving = false;
  function leave() {
    if (leaving) return;
    leaving = true;
    tl.pause();
    const out = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        running = false;
        window.removeEventListener('resize', resize);
        document.removeEventListener('keydown', onKey);
        finish();
      },
    });
    out
      .to(skip, { opacity: 0, duration: 0.2 }, 0)
      .to(sparks, { opacity: 0, duration: 0.2 }, 0)
      .to(light, { opacity: 1, duration: 0.8 }, 0)
      .to(S, { flow: 3.5, duration: 0.8, ease: 'sine.in' }, 0)
      // the words fade up and away
      .to([title, by], { opacity: 0, y: -14, duration: 0.55, ease: 'power2.in' }, 0)
      // the page starts to show while the surface sinks
      .add(() => window.__playHero?.(), 0.35)
      .to(sheet, { yPercent: 100, duration: 1.15, ease: 'power3.inOut' }, 0.3)
      .to(edge, { y: () => H, duration: 1.15, ease: 'power3.inOut' }, 0.3);
  }

  const onKey = (e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      leave();
    }
  };
  document.addEventListener('keydown', onKey);
  skip.addEventListener('click', leave);
}
