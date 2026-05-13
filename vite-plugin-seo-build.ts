// Generates dist/sitemap.xml and overwrites dist/robots.txt when VITE_SITE_URL is set.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

const LOCALES = ['tr', 'en', 'ru', 'ar'] as const;
const PATH_SUFFIXES = ['', '/services', '/appointment', '/gallery', '/care-guide'] as const;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function seoBuildArtifactsPlugin(): Plugin {
  let outDirAbs = '';
  let root = '';
  let mode = 'production';

  return {
    name: 'seo-build-artifacts',
    apply: 'build',
    configResolved(config) {
      outDirAbs = config.build.outDir;
      root = config.root;
      mode = config.mode;
    },
    closeBundle() {
      const env = loadEnv(mode, root, '');
      const base = (env.VITE_SITE_URL ?? '').trim().replace(/\/$/, '');

      const robotsBase = [
        '# Nail Lab. — public site; admin panel should not be indexed.',
        'User-agent: *',
        'Allow: /',
        '',
        'Disallow: /admin',
        'Disallow: /admin/',
        '',
      ].join('\n');

      if (base) {
        const urlEntries: string[] = [];
        for (const loc of LOCALES) {
          for (const suf of PATH_SUFFIXES) {
            const locUrl = `${base}/${loc}${suf}`;
            const priority = suf === '' ? '1.0' : '0.8';
            urlEntries.push(
              `  <url>\n    <loc>${escapeXml(locUrl)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
            );
          }
        }
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;
        writeFileSync(join(outDirAbs, 'sitemap.xml'), sitemap, 'utf8');
        writeFileSync(join(outDirAbs, 'robots.txt'), `${robotsBase}Sitemap: ${base}/sitemap.xml\n`, 'utf8');
      } else {
        writeFileSync(
          join(outDirAbs, 'robots.txt'),
          `${robotsBase}# Set VITE_SITE_URL in .env for sitemap.xml and Sitemap: line.\n`,
          'utf8'
        );
      }
    },
  };
}
