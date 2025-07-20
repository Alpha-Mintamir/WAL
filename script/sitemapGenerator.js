import { writeFileSync } from 'fs';
import { globby } from 'globby';
import dotenv from 'dotenv';

// ✅ Load environment variables from .env
dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_WEB_URL;

const addPage = (page) => {
  const path = page
    .replace('src/pages/', '')
    .replace('.js', '')
    .replace('.mdx', '')
    .replace('.jsx', '')
    .replace('.ts', '')
    .replace('.tsx', '')
    .replace('index', '')
    .replace('indexx', "")
    .replace('x', "")
    .replace('/x', "");

  const route = path === '/index' ? '' : path;
  const cleanRoute = route.endsWith('/') ? route.slice(0, -1) : route;

  return `  <url>
    <loc>${BASE_URL}/${cleanRoute}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>`;
};

const generateSitemap = async () => {
  try {
    const pages = await globby([
      'src/pages/**/*{.js,.jsx,.ts,.tsx,.mdx}',
      '!src/pages/_*.js',
      '!src/pages/api',
      '!src/pages/_*.jsx',
    ]);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages.map(addPage).join('\n')}
    </urlset>`;

    console.log("Sitemap generated successfully ");

    writeFileSync('public/sitemap.xml', sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
};

generateSitemap();
