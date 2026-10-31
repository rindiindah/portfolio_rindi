/* ==========================================================================
   sea.js: scroll response + fish feeding for the animated ocean (styles/sea.css).

   Scroll
   - Sets --p (scroll progress 0..1) and --sy (scroll px) on the background, which the CSS
     uses to raise the waves, strengthen the light rays and slide the sky away.
   - Moves each piece of sea life at its own speed (parallax: farther = slower).
   - The scroll value is eased, so the background trails the page a little, which reads as depth.

   Fish feeding
   - A few fish wander around under the surface.
   - Click or tap the water (empty space on the page, not a card or button): food sinks from that
     spot, the nearest fish swim over and eat it, then go back to wandering.

   Reduced motion: nothing here runs; the CSS shows a still picture instead.
   ========================================================================== */

const sea = document.querySelector('[data-sea]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (sea && !reduceMotion) {
  const items = [...sea.querySelectorAll('[data-depth]')].map((el) => ({
    el,
    depth: parseFloat(el.dataset.depth),
    at: parseFloat(el.dataset.at),
  }));

  let current = window.scrollY;
  let target = current;
  let running = false;

  const apply = (y) => {
    const vh = window.innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const p = Math.min(1, Math.max(0, y / max));

    sea.style.setProperty('--p', p.toFixed(4));
    sea.style.setProperty('--sy', y.toFixed(1));

    // Item sits at screen center when the page is `at` of the way down, then moves at `depth` x the scroll speed.
    for (const it of items) {
      const top = vh * 0.5 + it.depth * (it.at * max - y);
      it.el.style.transform = `translate3d(0, ${top.toFixed(1)}px, 0)`;
    }
  };

  const tick = () => {
    current += (target - current) * 0.09;
    if (Math.abs(target - current) < 0.2) {
      current = target;
      running = false;
    }
    apply(current);
    if (running) requestAnimationFrame(tick);
  };

  const start = () => {
    target = window.scrollY;
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  };

  window.addEventListener('scroll', start, { passive: true });
  window.addEventListener('resize', start);
  // The page gets taller once images/fonts have loaded: re-measure.
  window.addEventListener('load', start);

  apply(current);

  /* ---------------------------------------------------------------------
     Fish feeding
     --------------------------------------------------------------------- */
  const petEls = [...sea.querySelectorAll('[data-pet]')];
  const feedLayer = sea.querySelector('[data-feed]');

  if (petEls.length && feedLayer) {
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    window.addEventListener('resize', () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
    });

    // Where the water starts on screen: the sky slides up as you scroll (see .sea-sky in sea.css)
    const waterTop = () => Math.max(0, vh * 0.9 - 0.85 * current + 70);
    const region = (h) => {
      const top = Math.min(vh * 0.8, Math.max(waterTop(), vh * 0.12)) + h;
      return { top, bottom: Math.max(top + 60, vh * 0.92 - h) };
    };

    const pets = petEls.map((el) => {
      const w = parseFloat(el.dataset.w);
      const h = el.offsetHeight || w * 0.4;
      const r = region(h);
      return {
        el,
        img: el.querySelector('img'),
        w,
        h,
        x: rand(w, Math.max(w + 10, vw - w)),
        y: rand(r.top, r.bottom),
        vx: rand(-20, 20),
        vy: 0,
        tx: 0,
        ty: 0,
        nextPick: 0,
        speed: rand(34, 62),
        facing: 1, // 1 = nose points left (how the pictures are drawn)
        angle: 0,
        phase: rand(0, 6.28),
        gulpUntil: 0,
      };
    });

    const food = [];
    const pickTarget = (p, now) => {
      const r = region(p.h);
      p.tx = rand(p.w, Math.max(p.w + 10, vw - p.w));
      p.ty = rand(r.top, r.bottom);
      p.nextPick = now + rand(3500, 8000);
    };

    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const wt = waterTop();

      // Food sinks, sways a little, and fades out if nobody wants it
      for (let i = food.length - 1; i >= 0; i--) {
        const f = food[i];
        f.age += dt;
        f.y += f.vy * dt;
        f.x += Math.sin(t * 2 + f.ph) * 9 * dt;
        const fade = f.age > 11 ? clamp(1 - (f.age - 11) / 2, 0, 1) : 1;
        f.el.style.transform = `translate3d(${f.x.toFixed(1)}px, ${f.y.toFixed(1)}px, 0)`;
        f.el.style.opacity = fade;
        if (f.y > vh + 12 || f.age > 13) {
          f.el.remove();
          food.splice(i, 1);
        }
      }

      for (const p of pets) {
        // chase the nearest piece of food, otherwise wander
        let near = null;
        let nd = Infinity;
        for (const f of food) {
          if (f.y < wt - 10) continue;
          const d = Math.hypot(f.x - p.x, f.y - p.y);
          if (d < nd) {
            nd = d;
            near = f;
          }
        }

        let tx = p.tx;
        let ty = p.ty;
        let boost = 1;
        if (near) {
          tx = near.x;
          ty = near.y;
          boost = 3.6;
          if (nd < Math.max(16, p.w * 0.3)) {
            near.el.remove();
            food.splice(food.indexOf(near), 1);
            p.gulpUntil = now + 320;
            p.el.classList.remove('gulp');
            void p.el.offsetWidth; // restart the little gulp animation
            p.el.classList.add('gulp');
            const n = document.createElement('i');
            n.className = 'nibble';
            n.style.transform = `translate(${near.x}px, ${near.y}px)`;
            n.style.left = '0';
            n.style.top = '0';
            feedLayer.append(n);
            n.addEventListener('animationend', () => n.remove());
          }
        } else if (now > p.nextPick || Math.hypot(tx - p.x, ty - p.y) < 30) {
          pickTarget(p, now);
          tx = p.tx;
          ty = p.ty;
        }

        const dx = tx - p.x;
        const dy = ty - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const sp = p.speed * boost;
        const ease = 1 - Math.exp(-dt * (near ? 3.2 : 1.6));
        p.vx += ((dx / dist) * sp - p.vx) * ease;
        p.vy += ((dy / dist) * sp - p.vy) * ease;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // stay on screen, and under the surface
        const r = region(p.h);
        if (p.y < r.top - 20) p.vy += 60 * dt;
        if (p.y > r.bottom + 30) p.vy -= 60 * dt;
        if (p.x < -p.w * 0.3) p.vx += 80 * dt;
        if (p.x > vw + p.w * 0.3) p.vx -= 80 * dt;

        if (p.vx > 10) p.facing = -1;
        else if (p.vx < -10) p.facing = 1;
        const want = clamp(-Math.atan2(p.vy, Math.abs(p.vx) + 1) * 57.3, -28, 28);
        p.angle += (want - p.angle) * (1 - Math.exp(-dt * 6));
        const bob = Math.sin(t * 3 + p.phase) * 2.5;

        p.el.style.transform = `translate3d(${(p.x - p.w / 2).toFixed(1)}px, ${(p.y - p.h / 2 + bob).toFixed(1)}px, 0)`;
        p.img.style.transform = `scaleX(${p.facing}) rotate(${p.angle.toFixed(1)}deg)`;
      }

      requestAnimationFrame(step);
    };
    pets.forEach((p) => pickTarget(p, performance.now()));
    requestAnimationFrame(step);

    /* ---------- Click the water ---------- */
    const INTERACTIVE =
      'a,button,input,textarea,select,label,summary,dialog,nav,header,footer,[data-carousel],figure,img,svg,video,iframe,.sticker,.chip,.btn,.hero-caption';
    const isEmptySpace = (el) => {
      if (!el || el === document.documentElement || el === document.body) return true;
      if (el.closest(INTERACTIVE)) return false;
      if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false; // has its own text
      const cs = getComputedStyle(el);
      const painted =
        cs.backgroundImage !== 'none' ||
        (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
        parseFloat(cs.borderTopWidth) > 0;
      return !painted;
    };

    const feed = (x, y) => {
      for (let k = 0; k < 7; k++) {
        const el = document.createElement('i');
        el.className = 'food';
        feedLayer.append(el);
        food.push({ el, x: x + rand(-22, 22), y: y + rand(-6, 10), vy: rand(30, 58), ph: rand(0, 6.28), age: 0 });
      }
      for (const cls of ['ripple', 'ripple r2']) {
        const rp = document.createElement('i');
        rp.className = cls;
        rp.style.left = `${x}px`;
        rp.style.top = `${y}px`;
        feedLayer.append(rp);
        rp.addEventListener('animationend', () => rp.remove());
      }
    };

    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (String(window.getSelection?.() ?? '').length > 0) return; // they were selecting text
      if (e.clientY < waterTop() - 10) return; // that's sky
      if (!isEmptySpace(e.target)) return;
      feed(e.clientX, e.clientY);
    });
  }
}
