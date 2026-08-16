# Takshak Entertainment — multi-page site

A premium, cinematic multi-page site for Takshak Entertainment: a Nepal-based event organiser, not just a single-event landing page. Home, About, Artists (directory + individual profiles), Events (archive + individual event pages), Booking and Contact — with real per-page SEO/OG metadata and a single data source for the roster and event archive.

## How this is built, and why

This project has no framework, no bundler, and no server — it's plain HTML/CSS/JS, designed to be dropped into WordPress later. Real multi-page routing with correct per-page `<title>`/description/OG/Twitter meta and JSON-LD (required for artist and event pages to be indexable and to share correctly on social) can't be done with client-side JS alone — that needs actual static HTML per URL.

So `build.js` is a small, dependency-free static site generator (Node's built-in `fs`/`path` only — no `npm install` required). It reads `data/artists.js` and `data/events.js` (the single source of truth) plus the shared partials and page fragments in `src/`, and writes plain static HTML files straight into the repo root, ready to serve as-is.

```
data/
  site.js         — brand/contact constants (email, socials, nav)
  artists.js       — the artist roster (single source of truth)
  events.js         — the event archive (single source of truth)
src/
  partials/         — header.html, footer.html, preloader.html (shared chrome)
  pages/            — one HTML fragment per static page (home, about, artists-index,
                       events-index, booking, contact), each starting with a
                       <!--META {"title": "...", "description": "..."}--> block
  templates/
    components.js   — reusable renderers: artistCard, eventCard, flagshipEvent
    artist.js       — renders one /artists/<slug>/ page from an artist object
    event.js        — renders one /events/<slug>/ page from an event object
build.js            — the generator: run `node build.js` after editing anything above
```

**After changing any file under `data/`, `src/`, `build.js`, `styles.css`, or `script.js`, run `node build.js`** to regenerate the output pages, then serve locally with e.g. `python3 -m http.server` from the repo root (asset paths are root-relative, so opening `index.html` directly via `file://` will not resolve them — serve it).

## Adding an artist or an event

Add one object to `data/artists.js` or `data/events.js` and run `node build.js` — nothing else needs to change. The new artist/event automatically gets its own page, shows up in the relevant index/grid/filter, and (for artists) in the booking form's artist dropdown.

```js
// data/artists.js
{
  slug: 'artist-name',        // becomes the URL: /artists/artist-name/
  name: 'Artist Name',
  role: 'Headliner',          // shown as a pill tag
  category: 'Rock',           // must match a filter-pill value in src/pages/artists-index.html
  genre: 'Rock',
  tagline: 'One-line hook.',
  bio: ["Paragraph one.", "Paragraph two."],
  performanceType: 'Live band set',
  events: ['event-slug'],     // which events this artist performs at
  featured: true              // optional — the one featured artist gets top billing on Home
}
```

```js
// data/events.js
{
  slug: 'event-name',         // becomes the URL: /events/event-name/
  name: 'Event Name', status: 'upcoming', // or 'past'
  date: '2026-10-03', dateDisplay: '03 October 2026',
  gatesTime: '4:00 PM', musicTime: '6:00 PM',
  venue: '...', location: '...', type: 'Concert · Multi-artist night',
  tagline: '...', description: ["...", "..."],
  artists: ['artist-slug', ...], mysteryArtist: false,
  ticket: { name: 'Early Bird', price: 800, currency: 'Rs.', url: 'https://khalti.com/' },
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=...'
}
```

**Real photos**: point `image`-adjacent asset paths at `assets/artists/<slug>/hero.jpg`, `assets/artists/<slug>/gallery-1.jpg` etc. (event photos: `assets/events/<slug>/poster.jpg`, `gallery-1.jpg`...). Until a file exists at that path, every photo slot shows a structured placeholder (a soft gradient card with the artist's initials watermarked in) instead of a broken image — drop the real file in and reload, no code changes needed. This is handled generically in `script.js` (`.artist-photo-img` load/error handling), reused across every card, hero and gallery tile on the site.

## What's deliberately not here yet

- **Past events / stats / sponsors**: Takshak Live is the organisation's first flagship production — there's no real past-event history, attendance numbers, or sponsor roster yet. The Events page's "Past events" section, the event page's structure, and the templates all fully support this data the moment it's real; nothing is hidden behind a flag. Fabricating placeholder stats or sponsor logos would just be lying on the page, so it isn't done.
- **Per-artist social links** (Instagram/Spotify/etc.): not included on artist pages because Takshak doesn't have verified handles for each artist on file. Add a `social: { instagram: '...', spotify: '...' }` object to an artist in `data/artists.js` and wire it into `src/templates/artist.js`'s hero block when they're confirmed.
- **A public "past events" gallery of real photography**: same reasoning — the gallery grids on artist/event pages are real, structured, ready-to-fill components, just empty of real images today.

## Design notes

- **Color**: black-dominant. `--bg`/`--bg-1`/`--bg-2`/`--bg-3` are near-black elevation steps (page canvas → cards → hover/active surfaces); `--orange`/`--orange-soft`/`--orange-deep` are sampled directly from the real logo file (not invented) and are the only accent color. `--white`/`--off-white`/`--muted` carry typography.
- **Typography**: `Anton` (bold condensed display) for hero/section headlines and poster-style numerals; `Fraunces` italic for the accent word inside a headline and for artist/event names; `Inter` for body, nav, buttons, forms.
- **Hero visual** (`.hero-poster`, home page only) is a gig-poster composition — one glowing flame graphic (layered `drop-shadow`, not a flat icon) plus a huge date lockup — deliberately not a circular badge-with-orbit-rings; that pattern reads as generic/generated rather than art-directed.
- **Flagship event** (`.flagship`, Home and About) gets a visually distinct full-bleed dark panel, separate from the standard `.section-pad` rhythm, per the brief's instruction to treat Takshak Live as proof of capability, not just another list item.
- The event page's 4th lineup slot is a "Kept Secret" mystery card — a native `<details>/<summary>` wax-seal that twists open on click/tap/Enter and bursts a few sparks, revealing a note that points to Contact rather than a fabricated name. Works with JS fully disabled.
- Navigation: minimal glass bar on desktop with an active-link underline (`data-nav` + `script.js` path-matching); a full-screen dark overlay with staggered link entrance on mobile. Locks background scroll while open, closes on link click or `Escape`.
- Motion: page-load preloader, staggered hero entrance, scroll-reveal with a subtle clip-path wipe (not just opacity), image hover-zoom, magnetic CTA buttons, a capped scroll-linked parallax on the hero poster. Everything is gated behind `prefers-reduced-motion`.
- **Conversion language is consistent site-wide**: primary CTA is always "Book an Artist" → `/booking/` (except the home hero, which leads with "Explore Events" since that's the credibility-building first move); the flagship event's own ticket module says "Reserve now" — a different, more specific action (buying entry) than the organiser-level "Book an Artist" conversion.
- `#add-to-calendar` (on event pages) builds an `.ics` file client-side from the button's `data-*` attributes — no backend, and it generalizes to any future event automatically.

## Before launch

1. Replace the placeholder Khalti URL in `data/events.js` (`ticket.url`) with the real ticket URL, and update the price if it changes.
2. Add real artist and event photography per "Adding an artist or an event" above, and replace the general bios with anything more specific Takshak wants to say.
3. Decide the real 4th-act reveal plan for Takshak Live: either keep the "Kept Secret" card as ongoing hype, or move that artist into `data/artists.js` and set `mysteryArtist: false` on the event once announced.
4. Replace the social/WhatsApp URLs and contact email in `data/site.js` (used everywhere via the shared partials) with Takshak's real accounts.
5. Set `site.url` in `data/site.js` to the real production domain — it feeds every canonical URL, OG/Twitter tag, JSON-LD `url`, and the sitemap.
6. Add the production Meta Pixel, GA4 and Google Ads tags through Google Tag Manager (inject via the `<head>` in `build.js`'s `shell()` function so every page gets it). The event hooks in `script.js` push to `dataLayer`, call `gtag` when present, and call `fbq` when present.
7. Connect the booking and contact form submit handlers to a protected backend (Supabase, a WordPress REST endpoint, or a form service). The current `localStorage` write in `script.js` (`wireDemoForm`) is demo-only.
8. Add the privacy policy, booking terms, and full venue/entry information.

## Tracking model

The site tracks page visits, per-artist clicks, artist-filter usage, the mystery-card reveal, Khalti outbound clicks, calendar adds, map clicks, and booking/contact form submissions. A Khalti button click is an intent signal, not proof of a completed payment — confirmed buyers must be imported from Khalti or the organiser's sales report.

Use UTM links such as:

`?utm_source=meta&utm_medium=paid_social&utm_campaign=takshak_live_launch&utm_content=artist_video_01`

## WordPress migration options

- Each `src/pages/*.html` fragment becomes a WordPress page template; `artists.js`/`events.js` become ACF repeater fields (or custom post types) looped server-side using `src/templates/artist.js` / `event.js` as the reference for what markup to emit per item — same field shape, same "featured + grid" logic, just PHP instead of Node.
- `src/partials/header.html` / `footer.html` become `header.php` / `footer.php`.
- Replace the demo booking/contact handlers with `wp_ajax`/REST endpoints, nonce validation, rate limiting, and a permission-aware export.
- Keep Meta/GA4/Google Ads IDs in a tag manager or site settings, not scattered through templates.
- `build.js`'s `shell()` function is the single place per-page `<title>`/meta/OG/JSON-LD get assembled — mirror that logic in the WP template's `<head>`.
