import fs from 'node:fs';
import path from 'node:path';

/** True while running `npm run dev` (helpful hints are shown only then). */
export const isDev = import.meta.env.DEV;

/** Escape text so it is safe inside HTML. */
export function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Escape text AND turn every [TO FILL: ...] marker into a visible yellow tag,
 * so unfinished content is easy to spot. Use with set:html={fmt(text)}.
 */
export function fmt(s = '') {
  return esc(s).replace(/\[TO FILL[^\]]*\]/g, (m) => `<mark class="todo">${m}</mark>`);
}

/** Does a file exist inside /public? (checked at build time) */
export function existsPublic(p) {
  if (!p) return false;
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', p.replace(/^\//, '')));
  } catch {
    return false;
  }
}

/** First path from a list that exists in /public, or null. */
export function firstExisting(list = []) {
  return list.find((p) => existsPublic(p)) ?? null;
}

const IMAGE_EXTS = ['webp', 'png', 'jpg', 'jpeg', 'avif', 'svg'];

/**
 * Find the image for one step of a project.
 * 1) a path declared in the project's front matter (images.<step>), if the file exists;
 * 2) otherwise a file named by convention: public/images/projects/<slug>/<step>.<ext>
 */
export function resolveImage(project, slug, step) {
  const declared = project.images?.[step];
  if (declared && existsPublic(declared.src)) return declared;
  for (const ext of IMAGE_EXTS) {
    const src = `/images/projects/${slug}/${step}.${ext}`;
    if (existsPublic(src)) {
      return { src, alt: `${project.title}: ${step} visual` };
    }
  }
  return null;
}

/**
 * The documentation slides for a project (images only; the slideshow adds text slides if there are fewer than 3).
 * 1) entries declared in the project's front matter (slides:), if the files exist (images, or videos with a poster image);
 * 2) otherwise numbered files: public/images/projects/<slug>/1.webp, 2.webp, 3.webp ... (png/jpg also work);
 * 3) otherwise the older names: context / data / approach / results.
 */
export function resolveSlides(project, slug) {
  const out = [];
  for (const s of project.slides ?? []) {
    const alt = s.alt || `${project.title} documentation`;
    if (s.video && existsPublic(s.video)) {
      out.push({ video: s.video, src: existsPublic(s.poster) ? s.poster : '', alt, caption: s.caption || '' });
    } else if (s.src && existsPublic(s.src)) {
      out.push({ src: s.src, alt, caption: s.caption || '', position: s.position || '' });
    }
  }
  if (out.length) return out;
  for (let i = 1; i <= 10; i++) {
    for (const ext of IMAGE_EXTS) {
      const src = `/images/projects/${slug}/${i}.${ext}`;
      if (existsPublic(src)) {
        out.push({ src, alt: `${project.title}: documentation ${i}`, caption: '' });
        break;
      }
    }
  }
  if (out.length) return out;
  for (const step of ['context', 'data', 'approach', 'results']) {
    const r = resolveImage(project, slug, step);
    if (r) out.push({ src: r.src, alt: r.alt, caption: '' });
  }
  return out;
}

export const pad = (n) => String(n).padStart(2, '0');

export const hasValue = (v) => typeof v === 'string' && v.trim().length > 0;

/** Remove HTML comments so an "empty" Markdown body is detected as empty. */
export const stripComments = (md = '') => md.replace(/<!--[\s\S]*?-->/g, '').trim();

export const fileType = (p = '') => (/\.pdf$/i.test(p) ? 'pdf' : 'image');
