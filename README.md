# Takshak single-page event site

A premium, cinematic single page for Takshak Live — general event information (lineup, date/venue, passes overview) rather than a full ticket-purchase flow. Visitors reserve through an outbound Khalti link; this page does not process payments itself.

This folder is a clean HTML/CSS/JS build designed to be migrated into WordPress. It is intentionally dependency-light: open `index.html` locally for a preview, then move the three files and `assets/` into a WordPress child theme or a custom page template.

## Design notes

- **Color**: black-dominant. `--bg`/`--bg-1`/`--bg-2`/`--bg-3` are near-black elevation steps (page canvas → cards → hover/active surfaces); `--orange`/`--orange-soft`/`--orange-deep` are sampled directly from the real logo file (not invented) and are the only accent color — buttons, tags, borders, glows, active states; `--white`/`--off-white`/`--muted` carry typography. Nothing outside that system.
- **Typography**: three faces, each with a job. `Anton` (display) for hero/section headlines — bold, condensed, uppercase, festival-poster energy. `Fraunces` italic for the accent word inside a headline (the `<em>`) and artist names — a deliberate soft counterpoint to Anton's weight. `Inter` for body copy, nav, buttons, labels.
- **Lineup/Artists** (`#lineup`) is the site's major section: one large "featured" editorial block for the headliner (`.artist-feature`) plus a supporting grid (`.artist-card`) — not a uniform grid of identical tiles. See "Artist data" below for how it's populated.
- **Passes** is intentionally a single Early Bird ticket (Rs. 800), styled like a real ticket stub with a dashed perforation and punched-hole notches — not a multi-tier price grid. This page informs and hands off to Khalti.
- The 4th lineup slot is a "Kept Secret" mystery card, built as a native `<details>/<summary>` — a wax-seal envelope that twists open on click/tap/Enter and bursts a few sparks, revealing a guest-list teaser instead of a fabricated name. Works with JS fully disabled (native disclosure); the spark animation and tracking event are progressive enhancement only.
- The hero has a circular typeset arcing over the medallion (SVG `textPath`), vinyl-label style — deliberately only the top arc, since text along the bottom half of an SVG circle renders upside-down.
- Navigation: minimal glass bar on desktop; a full-screen dark overlay with staggered link entrance on mobile (`#mobile-menu`), not a small dropdown. Locks background scroll while open, closes on link click or `Escape`.
- Motion: page-load preloader, staggered hero entrance (`.reveal-delay-1/2/3`), scroll-reveal with a subtle clip-path wipe (not just opacity), image hover-zoom on artist photos, magnetic CTA buttons, a capped scroll-linked parallax on the hero medallion. Everything is gated behind `prefers-reduced-motion`.
- `#add-to-calendar` generates an `.ics` file client-side (no backend) — update the date/time in `script.js` if the schedule changes.

## Artist data — how to add or replace an artist

The lineup is rendered from a single array at the top of `script.js`:

```js
const ARTISTS = [
  {
    name: "Bipul Chettri",
    role: "Headliner",          // shown as a pill tag
    genre: "Folk · Modern Nepali",
    description: "Short one/two-sentence bio.",
    image: "assets/artists/bipul-chettri.jpg",
    featured: true               // exactly one artist should be featured — gets the large editorial block
  },
  // ...
];
```

To add a real photo: drop the file at the `image` path and reload — nothing else changes. Until that file exists, the card shows a structured placeholder (a soft gradient panel with the artist's initials watermarked in) instead of a broken image, so the section always looks finished. The image fades in on load and the placeholder is left in the DOM behind it (harmless once covered).

This is a deliberate trade-off: the lineup renders client-side, so artist names aren't in the initial HTML for no-JS/crawler access. For the WordPress migration, replace this array with an ACF repeater field (same shape: name/role/genre/description/image/featured) looped in PHP — that removes the JS dependency and keeps the exact same "featured + grid" layout logic, just server-rendered.

## Before launch

1. Replace the placeholder Khalti URL in `index.html` (`data-track="pass_early_bird"`) with the real ticket URL, and update the price if it changes. Confirm the event date/time in the hero, the "The Night" card, metadata, and the `.ics` generator in `script.js`.
2. Add real artist photos per "Artist data" above, and fill in the real genre/bio copy.
3. Decide the real 4th-act reveal plan: either keep the "Kept Secret" card as ongoing hype, or replace its markup in `index.html` (`.mystery-card`) with a normal artist entry once announced — move it into the `ARTISTS` array at that point.
4. Replace the social/WhatsApp URLs and footer contact email with Takshak's real accounts.
5. Add the production Meta Pixel, GA4 and Google Ads tags through Google Tag Manager or the theme's header. The event hooks in `script.js` push to `dataLayer`, call `gtag` when present, and call `fbq` when present.
6. Connect the guest-list submit handler to a protected backend such as Supabase, WordPress REST API, or a form service. The current localStorage write is demo-only and is not a production database.
7. Add the privacy policy, pass/refund terms, contact number, and full venue/entry information.

## Tracking model

The site tracks page visits, CTA clicks, per-artist clicks, the mystery-card reveal, Khalti outbound clicks, social clicks, calendar adds, map clicks, and guest-list submissions. A Khalti button click is an intent signal; it is not proof of a completed payment. Confirmed buyers must be imported from Khalti or the organizer's sales report so they can be excluded from current campaigns and saved for future-event audiences.

Use UTM links such as:

`?utm_source=meta&utm_medium=paid_social&utm_campaign=dharan_event_ticket_launch&utm_content=artist_video_01`

`?utm_source=google&utm_medium=cpc&utm_campaign=dharan_event_ticket_search&utm_content=keyword_group_01`

## WordPress migration options

- Create a child theme and use `index.html` as the page-template markup.
- Enqueue `styles.css` and `script.js` with `wp_enqueue_style()` and `wp_enqueue_script()`.
- Replace the `ARTISTS` array in `script.js` with an ACF repeater (same field shape) looped server-side in the template — see "Artist data" above.
- Put event fields, the Khalti URL, social links, and the pass price into Advanced Custom Fields or WordPress Customizer settings.
- Replace the demo guest-list handler with a `wp_ajax`/REST endpoint, nonce validation, rate limiting, and a permission-aware export.
- Keep Meta/GA4/Google Ads IDs in a tag manager or site settings, not scattered through the markup.
