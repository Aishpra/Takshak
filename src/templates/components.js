/* Small reusable HTML renderers shared between build.js (page markers) and the artist/event templates.
   Kept as plain functions, not a component framework — this is a static-HTML generator, not an app. */

function initials(name) {
  return name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function artistCard(artist, { linkToBooking = false } = {}) {
  const link = linkToBooking ? `/booking/?artist=${artist.slug}` : `/artists/${artist.slug}/`;
  const linkLabel = linkToBooking ? 'Book' : 'View artist';
  return `<article class="artist-card reveal" data-category="${artist.category || ''}">
    <div class="artist-card-photo">
      <span class="artist-photo-placeholder" aria-hidden="true"><span>${initials(artist.name)}</span></span>
      <img class="artist-photo-img" src="/assets/artists/${artist.slug}/hero.jpg" alt="${artist.name}" loading="lazy" decoding="async">
    </div>
    <div class="artist-card-info">
      <span class="artist-tag">${artist.role}</span>
      <h3><a href="/artists/${artist.slug}/">${artist.name}</a></h3>
      ${artist.genre ? `<span class="artist-genre">${artist.genre}</span>` : ''}
      <p>${artist.tagline}</p>
      <a class="artist-card-link" href="${link}">${linkLabel} <span aria-hidden="true">↗</span></a>
    </div>
  </article>`;
}

function eventCard(event) {
  const isPast = event.status === 'past';
  return `<article class="event-card reveal">
    <a href="/events/${event.slug}/" class="event-card-media">
      <span class="event-card-placeholder" aria-hidden="true"><span>${event.dateDisplay.split(' ')[0]}<br>${event.dateDisplay.split(' ')[1].slice(0,3).toUpperCase()}</span></span>
      <img class="artist-photo-img" src="/assets/events/${event.slug}/poster.jpg" alt="${event.name} poster" loading="lazy" decoding="async">
      <span class="event-status-badge ${isPast ? 'is-past' : 'is-upcoming'}">${isPast ? 'Past' : 'Upcoming'}</span>
    </a>
    <div class="event-card-info">
      <h3><a href="/events/${event.slug}/">${event.name}</a></h3>
      <span class="event-card-meta">${event.dateDisplay} · ${event.venue}</span>
      <p>${event.tagline}</p>
      <a class="artist-card-link" href="/events/${event.slug}/">View event <span aria-hidden="true">↗</span></a>
    </div>
  </article>`;
}

function flagshipEvent(event, eventArtists) {
  return `<div class="flagship">
    <div class="flagship-visual" aria-hidden="true">
      <span class="hero-poster-eyebrow">Flagship Production</span>
      <div class="hero-poster-flame"><img src="/assets/takshak-symbol.png" alt=""></div>
      <div class="hero-poster-date"><span>${event.date.slice(8,10)}</span><b>·</b><span>${event.date.slice(5,7)}</span><b>·</b><span>${event.date.slice(2,4)}</span></div>
    </div>
    <div class="flagship-info">
      <p class="eyebrow">Our first major production</p>
      <h2>${event.name}</h2>
      <p class="flagship-tagline">${event.tagline}</p>
      <div class="hero-proof"><span class="proof-line"></span><span>${event.dateDisplay}</span><span class="proof-line"></span><span>${event.venue}</span></div>
      <p class="flagship-desc">${event.description[0]}</p>
      <div class="flagship-artists">${eventArtists.map(a => `<a href="/artists/${a.slug}/" class="flagship-artist-chip">${a.name}</a>`).join('')}${event.mysteryArtist ? '<span class="flagship-artist-chip is-mystery">+ 1 secret act</span>' : ''}</div>
      <a class="button button-primary magnetic" data-track="home_flagship_view" href="/events/${event.slug}/">View Event <span aria-hidden="true">↗</span></a>
    </div>
  </div>`;
}

module.exports = { initials, artistCard, eventCard, flagshipEvent };
