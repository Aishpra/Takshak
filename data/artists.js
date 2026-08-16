/* Artist roster — single source of truth. Add a new artist by adding an object here;
   the build script generates its /artists/<slug>/ page automatically.
   Only include fields that are actually true — leave a field out rather than invent it. */
module.exports = [
  {
    slug: 'bipul-chettri',
    name: 'Bipul Chettri',
    role: 'Headliner',
    category: 'Folk',
    genre: 'Folk · Modern Nepali',
    tagline: 'Folk stories with a modern pulse.',
    bio: [
      "Bipul Chettri writes the kind of songs that turned Nepali folk into something an entire generation sings along to — gentle, literate, and unmistakably rooted, dressed in modern arrangements without losing the thread back to the hills.",
      "At Takshak Live, he opens the night as headliner — the songwriter the crowd came to sing every word back to."
    ],
    performanceType: 'Live band set',
    events: ['takshak-live-2026'],
    featured: true
  },
  {
    slug: 'albatross',
    name: 'Albatross',
    role: 'Live band',
    category: 'Rock',
    genre: 'Rock',
    tagline: 'Raw guitars. Big rooms. No holding back.',
    bio: [
      "Albatross is one of the most explosive live rock acts on the circuit — big guitars, bigger rooms, and a reputation for turning any stage into the loudest place in the building.",
      "Their set at Takshak Live is the night's turn toward full volume."
    ],
    performanceType: 'Live band set',
    events: ['takshak-live-2026']
  },
  {
    slug: 'pahelo-batti-muni',
    name: 'Pahelo Batti Muni',
    role: 'Special set',
    category: 'Indie',
    genre: 'Indie',
    tagline: 'Indie warmth for the late-night hearts.',
    bio: [
      "Pahelo Batti Muni brings an indie warmth built for the part of the night when the crowd stops jumping and starts swaying — unhurried, intimate, and built for a late set."
    ],
    performanceType: 'Special set',
    events: ['takshak-live-2026']
  }
];
