/* Event archive — single source of truth. Add a new event by adding an object here;
   the build script generates its /events/<slug>/ page automatically.
   Do not invent attendance numbers or stats — only include what's confirmed. */
module.exports = [
  {
    slug: 'takshak-live-2026',
    name: 'Takshak Live',
    status: 'upcoming', // 'upcoming' | 'past'
    date: '2026-10-03',
    dateDisplay: '03 October 2026',
    gatesTime: '4:00 PM',
    musicTime: '6:00 PM',
    venue: 'Dharan Cricket Stadium',
    location: 'Dharan, Nepal',
    type: 'Concert · Multi-artist night',
    tagline: "The East's grandest night of music.",
    description: [
      "Takshak Live is Takshak Entertainment's flagship production — the first time Bipul Chettri, Albatross and Pahelo Batti Muni share one stage for a single night in Dharan, with a fourth act still under wraps.",
      "Every detail is built for people who want to feel the music, not just attend it: a proper live stage, sound and lighting worth dressing up for, and a crowd from Dharan, Itahari, Biratnagar and everywhere in between."
    ],
    artists: ['bipul-chettri', 'albatross', 'pahelo-batti-muni'],
    mysteryArtist: true,
    ticket: { name: 'Early Bird', price: 800, currency: 'Rs.', url: 'https://khalti.com/' },
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Dharan+Cricket+Stadium+Dharan+Nepal'
  }
];
