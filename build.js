#!/usr/bin/env node
/*
  Zero-dependency static site generator for the Takshak site.
  Why a build step at all, on a plain HTML/CSS/JS project: real multi-page routing with correct
  per-page <title>/description/OG/Twitter meta and JSON-LD (required for artist/event pages to be
  indexable and to share correctly) can't be done with client-side JS alone — that needs actual
  static HTML per URL. A framework would solve that too, but would fight this project's existing
  no-dependency, WordPress-migration-friendly shape. This script is the smallest thing that works:
  it reads data/*.js (the single source of truth for artists/events) and src/partials + src/pages,
  and writes plain static HTML files. No npm install required — only Node's built-in fs/path.

  Run: node build.js
  Output: index.html, about/index.html, artists/index.html, artists/<slug>/index.html,
          events/index.html, events/<slug>/index.html, booking/index.html, contact/index.html,
          sitemap.xml, robots.txt — all written to the repo root, ready to serve as-is.
*/
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const site = require('./data/site');
const artists = require('./data/artists');
const events = require('./data/events');
const artistTpl = require('./src/templates/artist');
const eventTpl = require('./src/templates/event');
const components = require('./src/templates/components');

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (outPath, content) => {
  const full = path.join(ROOT, outPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log('  wrote', outPath);
};

const fillTokens = (str, tokens) => str.replace(/\{\{(\w+)\}\}/g, (_, key) => (tokens[key] != null ? String(tokens[key]) : ''));

const globalTokens = {
  instagram: site.social.instagram,
  facebook: site.social.facebook,
  whatsapp: site.social.whatsapp,
  email: site.email,
  location: site.location,
  year: new Date().getFullYear()
};

const headerHTML = fillTokens(read('src/partials/header.html'), globalTokens);
const footerHTML = fillTokens(read('src/partials/footer.html'), globalTokens);
const preloaderHTML = fillTokens(read('src/partials/preloader.html'), globalTokens);

function esc(str = '') {
  return String(str).replace(/"/g, '&quot;');
}

function shell({ title, description, canonical, ogImage = '/assets/takshak-og.png', jsonLd, bodyClass = '', content }) {
  const jsonLdBlocks = (Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [])
    .map(obj => `\n  <script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b0a08">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${site.url}${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${site.url}${canonical}">
  <meta property="og:image" content="${site.url}${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${site.url}${ogImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">${jsonLdBlocks}
</head>
<body class="${bodyClass}">
  <a class="skip-link" href="#main">Skip to content</a>
${preloaderHTML}
${headerHTML}
${content}
${footerHTML}`;
}

const upcomingEvents = events.filter(e => e.status === 'upcoming');
const pastEvents = events.filter(e => e.status === 'past');
const flagship = upcomingEvents[0] || events[0];
const flagshipArtists = flagship ? artists.filter(a => (flagship.artists || []).includes(a.slug)) : [];

const pastEventsEmpty = `<p class="detail-empty">Takshak Live is our first major production — this is where every past event will live once the story continues.</p>`;

function renderMarkers(body) {
  return body
    .replace('<!--FLAGSHIP_EVENT-->', flagship ? components.flagshipEvent(flagship, flagshipArtists) : '')
    .replace('<!--ARTISTS_PREVIEW-->', artists.slice(0, 3).map(a => components.artistCard(a)).join(''))
    .replace('<!--ARTISTS_GRID-->', artists.map(a => components.artistCard(a)).join(''))
    .replace('<!--EVENTS_UPCOMING-->', upcomingEvents.length ? upcomingEvents.map(components.eventCard).join('') : `<p class="detail-empty">No upcoming events announced right now — check back soon.</p>`)
    .replace('<!--EVENTS_PAST-->', pastEvents.length ? pastEvents.map(components.eventCard).join('') : pastEventsEmpty)
    .replace('<!--ARTIST_OPTIONS-->', artists.map(a => `<option value="${a.slug}">${a.name}</option>`).join(''));
}

function readFragment(name) {
  const raw = read(`src/pages/${name}.html`);
  const match = raw.match(/^<!--META([\s\S]*?)-->\s*/);
  if (!match) throw new Error(`Missing <!--META {...}--> block at top of src/pages/${name}.html`);
  const meta = JSON.parse(match[1]);
  const body = renderMarkers(fillTokens(raw.slice(match[0].length), globalTokens));
  return { meta, body };
}

const urls = [];
function track(canonical) { urls.push(canonical); }

console.log('Building Takshak site...');

/* ---------- Static pages ---------- */
const staticPages = [
  { key: 'home', out: 'index.html', canonical: '/' },
  { key: 'about', out: 'about/index.html', canonical: '/about/' },
  { key: 'artists-index', out: 'artists/index.html', canonical: '/artists/' },
  { key: 'events-index', out: 'events/index.html', canonical: '/events/' },
  { key: 'booking', out: 'booking/index.html', canonical: '/booking/' },
  { key: 'contact', out: 'contact/index.html', canonical: '/contact/' }
];

staticPages.forEach(({ key, out, canonical }) => {
  const { meta, body } = readFragment(key);
  write(out, shell({ ...meta, canonical, content: body }));
  track(canonical);
});

/* ---------- Artist pages ---------- */
artists.forEach(artist => {
  const canonical = `/artists/${artist.slug}/`;
  const artistEvents = events.filter(e => (e.artists || []).includes(artist.slug));
  const html = artistTpl.render(artist, { events: artistEvents, site });
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Person', name: artist.name,
    description: artist.tagline, url: `${site.url}${canonical}`
  };
  write(`artists/${artist.slug}/index.html`, shell({
    title: `${artist.name} — ${site.shortName}`,
    description: artist.tagline,
    canonical, jsonLd, bodyClass: 'is-detail', content: html
  }));
  track(canonical);
});

/* ---------- Event pages ---------- */
events.forEach(event => {
  const canonical = `/events/${event.slug}/`;
  const eventArtists = artists.filter(a => (event.artists || []).includes(a.slug));
  const html = eventTpl.render(event, { artists: eventArtists, site });
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Event', name: event.name,
    startDate: event.date, eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: event.venue, address: event.location },
    description: event.tagline,
    performer: eventArtists.map(a => ({ '@type': 'PerformingGroup', name: a.name })),
    organizer: { '@type': 'Organization', name: site.name, url: site.url },
    url: `${site.url}${canonical}`
  };
  write(`events/${event.slug}/index.html`, shell({
    title: `${event.name} — ${event.dateDisplay} — ${site.shortName}`,
    description: event.tagline,
    canonical, jsonLd, bodyClass: 'is-detail', content: html
  }));
  track(canonical);
});

/* ---------- sitemap.xml + robots.txt ---------- */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${site.url}${u}</loc></url>`).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`Done. ${urls.length} pages generated.`);
