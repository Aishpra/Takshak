/* Renders the inner <main> content for one /artists/<slug>/ page. */
function initials(name) {
  return name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
function photoBlock(artist, cls, imgPath) {
  return `<div class="${cls}">
    <span class="artist-photo-placeholder" aria-hidden="true"><span>${initials(artist.name)}</span></span>
    <img class="artist-photo-img" src="${imgPath}" alt="${artist.name} — live" loading="lazy" decoding="async">
  </div>`;
}

function render(artist, { events = [], site }) {
  const details = [
    artist.genre ? { label: 'Genre', value: artist.genre } : null,
    artist.performanceType ? { label: 'Performance type', value: artist.performanceType } : null,
    { label: 'Based in', value: site.location }
  ].filter(Boolean);

  const galleryPlaceholders = [1, 2, 3, 4].map(n => `
      <div class="gallery-tile">
        <span class="artist-photo-placeholder" aria-hidden="true"><span>${initials(artist.name)}</span></span>
        <img class="artist-photo-img" src="/assets/artists/${artist.slug}/gallery-${n}.jpg" alt="${artist.name} — photo ${n}" loading="lazy" decoding="async">
      </div>`).join('');

  const performances = events.length
    ? `<ul class="performance-list">${events.map(e => `
      <li><a href="/events/${e.slug}/">
        <span class="performance-date">${e.dateDisplay}</span>
        <span class="performance-name">${e.name}</span>
        <span class="performance-venue">${e.venue}</span>
        <span aria-hidden="true">↗</span>
      </a></li>`).join('')}</ul>`
    : `<p class="detail-empty">No performances announced yet — check back soon.</p>`;

  return `
    <nav class="breadcrumb section-pad" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/artists/">Artists</a><span>/</span><span aria-current="page">${artist.name}</span></nav>

    <section class="artist-hero section-pad">
      ${photoBlock(artist, 'artist-hero-photo', `/assets/artists/${artist.slug}/hero.jpg`)}
      <div class="artist-hero-info">
        <span class="artist-tag">${artist.role}</span>
        <h1>${artist.name}</h1>
        ${artist.genre ? `<span class="artist-genre">${artist.genre}</span>` : ''}
        <p class="artist-hero-tagline">${artist.tagline}</p>
        <a class="button button-primary magnetic" data-track="artist_book_${slugify(artist.name)}" href="/booking/?artist=${artist.slug}">Book ${artist.name.split(' ')[0]} <span aria-hidden="true">↗</span></a>
      </div>
    </section>

    <section class="section-pad detail-block">
      <div class="section-heading"><div><p class="eyebrow">About</p><h2>The story<br><em>so far.</em></h2></div></div>
      <div class="detail-prose">${artist.bio.map(p => `<p>${p}</p>`).join('')}</div>
    </section>

    <section class="section-pad detail-block detail-block-alt">
      <div class="section-heading"><div><p class="eyebrow">Artist details</p><h2>At a<br><em>glance.</em></h2></div></div>
      <dl class="detail-grid">${details.map(d => `<div><dt>${d.label}</dt><dd>${d.value}</dd></div>`).join('')}</dl>
    </section>

    <section class="section-pad detail-block">
      <div class="section-heading"><div><p class="eyebrow">Gallery</p><h2>In the<br><em>frame.</em></h2></div><p>Performance photography lands here as it's captured — this gallery is ready for it.</p></div>
      <div class="gallery-grid">${galleryPlaceholders}</div>
    </section>

    <section class="section-pad detail-block detail-block-alt">
      <div class="section-heading"><div><p class="eyebrow">Performances</p><h2>Where to<br><em>see them.</em></h2></div></div>
      ${performances}
    </section>

    <section class="final-cta section-pad"><div class="final-cta-inner reveal"><p class="eyebrow">Bring them to your stage</p><h2>Book<br><em>${artist.name}.</em></h2><a class="button button-primary magnetic" data-track="artist_book_bottom_${slugify(artist.name)}" href="/booking/?artist=${artist.slug}">Book an Artist <span aria-hidden="true">↗</span></a><div class="final-mark">TAKSHAK<br><span>ARTISTS</span></div></div></section>
  `;
}

module.exports = { render };
