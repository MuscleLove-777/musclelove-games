'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'catalog.json');
const sitemapPath = path.join(root, 'sitemap.xml');

const games = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
xml += '  <url><loc>https://musclelove-games.vercel.app/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n';
for (const g of games) {
  const loc = g.url.replace(/\/+$/, '') + '/';
  xml += `  <url><loc>${loc}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
}
xml += '</urlset>';

fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log('OK: sitemap with ' + (games.length + 1) + ' URLs (hub + games)');
