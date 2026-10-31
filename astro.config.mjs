import { defineConfig } from 'astro/config';

// Public URL of the site. Needed for the share preview (Open Graph) image.
// - On Vercel it is picked up automatically.
// - Anywhere else, set SITE_URL, e.g.  SITE_URL=https://rindiindah.com npm run build
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export default defineConfig({
  site,
  trailingSlash: 'ignore',
});
