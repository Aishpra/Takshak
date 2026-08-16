/* Renders the inner <main> content for one /events/<slug>/ page. */
const { artistCard } = require('./components');

const mysteryCard = `<details class="artist-card mystery-card reveal" id="mystery-artist">
    <summary class="mystery-summary">
      <span class="mystery-seal" aria-hidden="true">?</span>
      <span class="artist-number">04</span>
      <h3>Kept Secret</h3>
      <p class="mystery-hint">Tap to open the envelope</p>
    </summary>
    <div class="mystery-content">
      <span class="mystery-sparks" aria-hidden="true">
        <i style="--dx:-32px;--dy:-20px"></i><i style="--dx:22px;--dy:-30px"></i><i style="--dx:-14px;--dy:-36px"></i>
        <i style="--dx:34px;--dy:-8px"></i><i style="--dx:-38px;--dy:-4px"></i><i style="--dx:8px;--dy:-40px"></i>
      </span>
      <p class="artist-card-tagline">Still sealed.</p>
      <p>We're not confirming anything — but join the guest list and you'll be first to know the moment it's official.</p>
      <a class="text-link" href="/contact/" data-track="mystery_connect">Get updates <span aria-hidden="true">↗</span></a>
    </div>
  </details>`;

function render(event, { artists = [], site }) {
  const isPast = event.status === 'past';
  const galleryPlaceholders = [1, 2, 3, 4, 5, 6].map(n => `
      <div class="gallery-tile">
        <span class="artist-photo-placeholder" aria-hidden="true"><span>TK</span></span>
        <img class="artist-photo-img" src="/assets/events/${event.slug}/gallery-${n}.jpg" alt="${event.name} — photo ${n}" loading="lazy" decoding="async">
      </div>`).join('');

  return `
    <nav class="breadcrumb section-pad" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/events/">Events</a><span>/</span><span aria-current="page">${event.name}</span></nav>

    <section class="event-hero section-pad">
      <div class="event-hero-info">
        <span class="event-status-badge ${isPast ? 'is-past' : 'is-upcoming'}">${isPast ? 'Past event' : 'Upcoming'}</span>
        <h1>${event.name}</h1>
        <p class="event-hero-tagline">${event.tagline}</p>
        <div class="hero-proof"><span class="proof-line"></span><span>${event.dateDisplay}</span><span class="proof-line"></span><span>${event.venue}</span><span class="proof-line"></span><span>${event.type}</span></div>
        ${!isPast ? `<div class="hero-actions"><a class="button button-primary magnetic" data-track="event_reserve" href="#passes">Reserve your pass <span aria-hidden="true">↗</span></a><a class="text-link" href="#event-artists">See the lineup <span aria-hidden="true">↓</span></a></div>` : ''}
      </div>
      <div class="hero-poster" aria-hidden="true">
        <span class="hero-poster-eyebrow">Takshak Presents</span>
        <div class="hero-poster-flame"><img src="/assets/takshak-symbol.png" alt=""></div>
        <div class="hero-poster-date"><span>${event.date.slice(8,10)}</span><b>·</b><span>${event.date.slice(5,7)}</span><b>·</b><span>${event.date.slice(2,4)}</span></div>
        <div class="hero-poster-foot"><span>${event.venue}</span><span>${event.location}</span></div>
      </div>
    </section>

    <section class="ticker" aria-label="Event highlights"><div class="ticker-track"><span>${event.name.toUpperCase()}</span><i>✦</i><span>${event.venue.toUpperCase()}</span><i>✦</i><span>${event.dateDisplay.toUpperCase()}</span><i>✦</i><span>TAKSHAK ENTERTAINMENT</span><i>✦</i><span>${event.name.toUpperCase()}</span><i>✦</i><span>${event.venue.toUpperCase()}</span><i>✦</i><span>${event.dateDisplay.toUpperCase()}</span><i>✦</i><span>TAKSHAK ENTERTAINMENT</span><i>✦</i></div></section>

    <section class="section-pad detail-block">
      <div class="section-heading"><div><p class="eyebrow">The story</p><h2>What this<br><em>night is.</em></h2></div></div>
      <div class="detail-prose">${event.description.map(p => `<p>${p}</p>`).join('')}</div>
    </section>

    <section class="section-pad lineup-section" id="event-artists">
      <div class="section-heading reveal"><div><p class="eyebrow">The lineup</p><h2>Who's<br><em>on stage.</em></h2></div></div>
      <div class="artist-grid">${artists.map(artistCard).join('')}${event.mysteryArtist ? mysteryCard : ''}</div>
    </section>

    <section class="section-pad detail-block detail-block-alt">
      <div class="section-heading"><div><p class="eyebrow">Gallery</p><h2>The visual<br><em>recap.</em></h2></div><p>${isPast ? 'Photos from the night.' : "This gallery fills in once the night happens — built and ready for it."}</p></div>
      <div class="gallery-grid">${galleryPlaceholders}</div>
    </section>

    <section class="section-pad detail-block">
      <div class="section-heading"><div><p class="eyebrow">Event information</p><h2>The<br><em>details.</em></h2></div></div>
      <dl class="detail-grid">
        <div><dt>Date</dt><dd>${event.dateDisplay}</dd></div>
        <div><dt>Venue</dt><dd>${event.venue}</dd></div>
        <div><dt>Location</dt><dd>${event.location}</dd></div>
        <div><dt>Event type</dt><dd>${event.type}</dd></div>
        <div><dt>Artists</dt><dd>${artists.map(a => a.name).join(', ')}${event.mysteryArtist ? ' + 1 surprise act' : ''}</dd></div>
        ${!isPast ? `<div><dt>Gates open</dt><dd>${event.gatesTime}</dd></div><div><dt>Music begins</dt><dd>${event.musicTime}</dd></div>` : ''}
      </dl>
      <div class="night-actions" style="justify-content:flex-start">
        ${!isPast ? `<a class="button button-dark magnetic" id="add-to-calendar" data-track="add_to_calendar" href="#" data-event-name="${event.name}" data-event-location="${event.venue}, ${event.location}" data-event-description="${artists.map(a => a.name).join(', ')}${event.mysteryArtist ? ' and one surprise act' : ''}, live at ${event.name}." data-event-date="${event.date}" data-gates-time="${event.gatesTime}">Add to calendar <span aria-hidden="true">＋</span></a>` : ''}
        ${event.mapUrl ? `<a class="text-link" href="${event.mapUrl}" target="_blank" rel="noreferrer" data-track="event_view_map">View on map <span aria-hidden="true">↗</span></a>` : ''}
      </div>
    </section>

    ${!isPast && event.ticket ? `<section class="section-pad passes" id="passes">
      <div class="section-heading passes-heading reveal"><div><p class="eyebrow">Your place for the night</p><h2>One pass.<br><em>${event.ticket.name} pricing.</em></h2></div><p>Get in for the full night at the earliest price this event will ever offer.</p></div>
      <div class="pass-ticket reveal">
        <div class="pass-ticket-notch pass-ticket-notch-top" aria-hidden="true"></div>
        <div class="pass-ticket-notch pass-ticket-notch-bottom" aria-hidden="true"></div>
        <div class="pass-ticket-main">
          <span class="pass-ticket-eyebrow">${event.name} · ${event.dateDisplay}</span>
          <h3>${event.ticket.name}</h3>
          <p>Full access to every act on the stage — general floor entry, at the earliest price this event will ever offer.</p>
          <ul class="pass-ticket-list"><li>All acts, one ticket</li><li>General floor access</li><li>Strictly limited quantity</li></ul>
        </div>
        <div class="pass-ticket-stub">
          <span class="pass-ticket-label">${event.ticket.name} price</span>
          <div class="pass-ticket-price"><sup>${event.ticket.currency}</sup>${event.ticket.price}</div>
          <a class="button button-primary button-card magnetic" data-track="event_pass_reserve" href="${event.ticket.url}">Reserve now <span aria-hidden="true">↗</span></a>
          <span class="pass-ticket-fine">Price rises once this batch is gone</span>
        </div>
      </div>
      <div class="booking-note reveal"><span class="note-icon">↗</span><div><strong>Passes are booked securely through Khalti.</strong><p>Tap "Reserve now" to complete your booking inside Khalti — final availability is confirmed at checkout.</p></div></div>
    </section>` : ''}

    <section class="section-pad faq detail-block-alt">
      <div class="section-heading"><div><p class="eyebrow">Good to know</p><h2>Questions,<br><em>answered.</em></h2></div></div>
      <div class="faq-list reveal">
        <details><summary>How do I reserve my pass?<span>+</span></summary><p>${event.ticket ? `Tap "Reserve now" on the ${event.ticket.name} ticket. You'll be taken to Khalti to complete your booking securely.` : 'Passes will be announced closer to the date.'}</p></details>
        <details><summary>Does clicking Reserve confirm my pass?<span>+</span></summary><p>Not yet — it opens Khalti checkout. Your pass is confirmed once payment is complete and you receive your Khalti receipt.</p></details>
        ${event.mysteryArtist ? `<details><summary>Who is the fourth, secret artist?<span>+</span></summary><p>We're not saying — yet. <a class="text-link" href="/contact/">Get in touch</a> and we'll let you know the moment it's official.</p></details>` : ''}
        <details><summary>What time do gates open?<span>+</span></summary><p>Gates open at ${event.gatesTime}. The stage comes alive at ${event.musicTime}.</p></details>
        <details><summary>Where exactly is the venue?<span>+</span></summary><p>${event.venue}, ${event.location}. Full entry and parking details will be shared closer to the date.</p></details>
      </div>
    </section>

    <section class="final-cta section-pad"><div class="final-cta-inner reveal"><p class="eyebrow">Plan your next event with Takshak</p><h2>This is what<br><em>we can create.</em></h2><a class="button button-primary magnetic" data-track="event_bottom_book" href="/booking/">Book an Artist <span aria-hidden="true">↗</span></a><div class="final-mark">TAKSHAK<br><span>EVENTS</span></div></div></section>
  `;
}

module.exports = { render };
