# Takshak single-page event site

A premium, editorial-style single page for Takshak Live — general event information (lineup, date/venue, passes overview) rather than a full ticket-purchase flow. Visitors reserve through an outbound Khalti link; this page does not process payments itself.

This folder is a clean HTML/CSS/JS build designed to be migrated into WordPress. It is intentionally dependency-light: open `index.html` locally for a preview, then move the three files and `assets/` into a WordPress child theme or a custom page template.

## Design notes

- Typography: Fraunces (display serif) + Inter (body/UI), loaded from Google Fonts.
- Palette: a warm, lokta-paper cream (`--paper`) runs the whole page as one continuous textured canvas (layered SVG turbulence + fleck gradients, `.paper-base`), with dark ink reserved for small deliberate accents (the hero medallion, dark buttons) — antique gold and a Nepali maroon carry the rest of the color story.
- The "Passes" section is intentionally a single Early Bird ticket (Rs. 800), styled like a real ticket stub with a dashed perforation and punched-hole notches — not a multi-tier or multi-phase sale funnel. This page informs and hands off to Khalti; it doesn't run the sale itself.
- The lineup is 4 acts: 3 named artists shown as cards, plus a 4th "mystery" act built as a native `<details>/<summary>` — a wax-seal envelope that twists open on click/tap/Enter, bursts a few gold sparks, and reveals a teaser pointing to the guest list. It works with JS fully disabled (native disclosure); the spark animation and tracking event are progressive enhancement only.
- The hero has a circular gold typeset arcing over the medallion (SVG `textPath`), inspired by vinyl-label / wax-seal typography — deliberately only the top arc (text on the bottom half of a circle renders upside-down in SVG, so a top-only arc reads correctly at every size).
- `#add-to-calendar` generates an `.ics` file client-side (no backend) — update the date/time in `script.js` if the schedule changes.

## Before launch

1. Replace the placeholder Khalti URL in `index.html` (`data-track="pass_early_bird"`) with the real ticket URL, and update the price if it changes. Confirm the event date/time in the hero, the "The Night" card, metadata, and the `.ics` generator in `script.js`.
2. Decide the real 4th-act reveal plan: either keep the "Kept Secret" card as ongoing hype, or replace its content in `index.html` (`.mystery-card`) with the real name once announced — swap it for a normal `.artist-card` at that point.
3. Replace the social and WhatsApp URLs with Takshak's real accounts.
4. Add the production Meta Pixel, GA4 and Google Ads tags through Google Tag Manager or the theme's header. The event hooks in `script.js` push to `dataLayer`, call `gtag` when present, and call `fbq` when present.
5. Connect the guest-list submit handler to a protected backend such as Supabase, WordPress REST API, or a form service. The current localStorage write is demo-only and is not a production database.
6. Add the privacy policy, pass/refund terms, contact number, and full venue/entry information.

## Tracking model

The site tracks page visits, CTA clicks, artist clicks, the mystery-card reveal, Khalti outbound clicks, social clicks, calendar adds, and guest-list submissions. A Khalti button click is an intent signal; it is not proof of a completed payment. Confirmed buyers must be imported from Khalti or the organizer's sales report so they can be excluded from current campaigns and saved for future-event audiences.

Use UTM links such as:

`?utm_source=meta&utm_medium=paid_social&utm_campaign=dharan_event_ticket_launch&utm_content=artist_video_01`

`?utm_source=google&utm_medium=cpc&utm_campaign=dharan_event_ticket_search&utm_content=keyword_group_01`

## WordPress migration options

- Create a child theme and use `index.html` as the page-template markup.
- Enqueue `styles.css` and `script.js` with `wp_enqueue_style()` and `wp_enqueue_script()`.
- Put event fields, Khalti URLs, social links, and pass prices into Advanced Custom Fields or WordPress Customizer settings.
- Replace the demo guest-list handler with a `wp_ajax`/REST endpoint, nonce validation, rate limiting, and a permission-aware export.
- Keep Meta/GA4/Google Ads IDs in a tag manager or site settings, not scattered through the markup.
