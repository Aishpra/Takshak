# Takshak single-page event site

This folder is a clean HTML/CSS/JS build designed to be migrated into WordPress. It is intentionally dependency-light: open `index.html` locally for a preview, then move the three files and `assets/` into a WordPress child theme or a custom page template.

## Before launch

1. Replace the placeholder Khalti URL in `index.html` with the real ticket URL. Update the event date in the hero and metadata.
2. Replace the social and WhatsApp URLs with Takshak's real accounts.
3. Add the production Meta Pixel, GA4 and Google Ads tags through Google Tag Manager or the theme's header. The event hooks in `script.js` push to `dataLayer`, call `gtag` when present, and call `fbq` when present.
4. Connect the giveaway submit handler to a protected backend such as Supabase, WordPress REST API, or a form service. The current localStorage write is demo-only and is not a production database.
5. Add the official giveaway rules, privacy policy, ticket terms, contact number, and venue/entry information.

## Tracking model

The site tracks page visits, CTA clicks, artist clicks, Khalti outbound clicks, social clicks, and giveaway submissions. A Khalti button click is an intent signal; it is not proof of a completed payment. Confirmed buyers must be imported from Khalti or the organizer's sales report so they can be excluded from current campaigns and saved for future-event audiences.

Use UTM links such as:

`?utm_source=meta&utm_medium=paid_social&utm_campaign=dharan_event_ticket_launch&utm_content=artist_video_01`

`?utm_source=google&utm_medium=cpc&utm_campaign=dharan_event_ticket_search&utm_content=keyword_group_01`

## WordPress migration options

- Create a child theme and use `index.html` as the page-template markup.
- Enqueue `styles.css` and `script.js` with `wp_enqueue_style()` and `wp_enqueue_script()`.
- Put event fields, Khalti URL, social links, and phase prices into Advanced Custom Fields or WordPress Customizer settings.
- Replace the demo giveaway handler with a `wp_ajax`/REST endpoint, nonce validation, rate limiting, and a permission-aware export.
- Keep Meta/GA4/Google Ads IDs in a tag manager or site settings, not scattered through the markup.
