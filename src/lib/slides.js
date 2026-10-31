import { resolveSlides } from './utils.js';

/**
 * The slides for one project's carousel: your documentation images and videos first, then (only until you have
 * at least 3, or `maxSlides` if the project sets a smaller number) text slides built from the project's own content: "At a glance", "How it came together"
 * and "Tools & methods".
 */
export function buildSlides(project, slug) {
  const slides = resolveSlides(project, slug).map((img) => ({ type: img.video ? 'video' : 'image', img }));
  const fillers = ['glance', 'built', 'tools'];
  const min = Math.min(3, project.maxSlides ?? 3);
  while (slides.length < min) slides.push({ type: fillers.shift() });
  return slides;
}
