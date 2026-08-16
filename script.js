/* Takshak static-site interactions and tracking hooks. Replace placeholder URLs/IDs before launch. */
(function(){
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params=new URLSearchParams(location.search);
  const utm={source:params.get('utm_source')||'',medium:params.get('utm_medium')||'',campaign:params.get('utm_campaign')||'',content:params.get('utm_content')||''};

  window.takshakTrack=function(name,props={}){
    const payload={...props,...utm,page_location:location.href};
    window.dataLayer=window.dataLayer||[]; window.dataLayer.push({event:name,...payload});
    if(typeof window.gtag==='function') window.gtag('event',name,payload);
    if(typeof window.fbq==='function') window.fbq('trackCustom',name,payload);
  };

  /* ============ Artist data ============
     Single source of truth for the lineup. To add/replace an artist, edit this array —
     nothing else in the codebase needs to change. Swap `image` to a real photo path
     (e.g. assets/artists/bipul-chettri.jpg) and it replaces the placeholder automatically;
     leave it pointing at a file that doesn't exist yet and the placeholder stays in place.
     For the WordPress migration, this array maps directly onto an ACF repeater field
     looped server-side — same shape, same fields. */
  const ARTISTS=[
    {
      name:'Bipul Chettri',
      role:'Headliner',
      genre:'Folk · Modern Nepali',
      description:"Folk stories with a modern pulse — the songwriter who turned Nepali folk into something an entire generation sings along to.",
      image:'assets/artists/bipul-chettri.jpg',
      featured:true
    },
    {
      name:'Albatross',
      role:'Live band',
      genre:'Rock',
      description:'Raw guitars, big rooms, no holding back — one of the most explosive live acts on the circuit.',
      image:'assets/artists/albatross.jpg'
    },
    {
      name:'Pahelo Batti Muni',
      role:'Special set',
      genre:'Indie',
      description:'Indie warmth for the late-night hearts.',
      image:'assets/artists/pahelo-batti-muni.jpg'
    }
  ];

  const initials=name=>name.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const slugify=name=>name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');

  function photoMarkup(artist,figureClass){
    return `<div class="${figureClass}">`
      +`<span class="artist-photo-placeholder" aria-hidden="true"><span>${initials(artist.name)}</span></span>`
      +`<img class="artist-photo-img" alt="${artist.name} — live" loading="lazy" decoding="async">`
      +`</div>`;
  }

  function attachPhoto(root,artist){
    const img=$('.artist-photo-img',root);
    if(!img) return;
    img.addEventListener('load',()=>img.classList.add('is-loaded'));
    img.addEventListener('error',()=>img.remove());
    img.src=artist.image;
  }

  function renderArtists(){
    const featuredMount=$('#artist-featured-mount');
    const gridMount=$('#artist-grid-mount');
    if(!featuredMount || !gridMount) return;

    const featured=ARTISTS.find(a=>a.featured)||ARTISTS[0];
    const supporting=ARTISTS.filter(a=>a!==featured);

    const featureEl=document.createElement('article');
    featureEl.className='artist-feature reveal';
    featureEl.innerHTML=photoMarkup(featured,'artist-feature-photo')
      +`<div class="artist-feature-info">`
      +`<span class="artist-tag">${featured.role}</span>`
      +`<h3>${featured.name}</h3>`
      +(featured.genre?`<span class="artist-genre">${featured.genre}</span>`:'')
      +`<p>${featured.description}</p>`
      +`<a class="text-link" href="#passes" data-track="artist_${slugify(featured.name)}">Reserve for ${featured.name.split(' ')[0]} <span aria-hidden="true">↗</span></a>`
      +`</div>`;
    featuredMount.appendChild(featureEl);
    attachPhoto(featureEl,featured);

    const frag=document.createDocumentFragment();
    supporting.forEach(artist=>{
      const cardEl=document.createElement('article');
      cardEl.className='artist-card reveal';
      cardEl.innerHTML=photoMarkup(artist,'artist-card-photo')
        +`<div class="artist-card-info">`
        +`<span class="artist-tag">${artist.role}</span>`
        +`<h3>${artist.name}</h3>`
        +(artist.genre?`<span class="artist-genre">${artist.genre}</span>`:'')
        +`<p>${artist.description}</p>`
        +`<a class="artist-card-link" href="#passes" data-track="artist_${slugify(artist.name)}">Reserve <span aria-hidden="true">↗</span></a>`
        +`</div>`;
      frag.appendChild(cardEl);
      attachPhoto(cardEl,artist);
    });
    gridMount.insertBefore(frag,gridMount.firstChild);
  }
  renderArtists();

  $$('[data-track]').forEach(el=>el.addEventListener('click',()=>takshakTrack(el.dataset.track,{button_location:el.closest('section')?.id||'navigation'})));

  const progress=$('#scroll-progress-bar');
  const updateProgress=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(max>0?(window.scrollY/max)*100:0)+'%'};
  window.addEventListener('scroll',updateProgress,{passive:true}); updateProgress();

  /* Full-screen mobile menu */
  const menu=$('.menu-toggle'), mobile=$('#mobile-menu');
  const setMenu=open=>{
    menu.setAttribute('aria-expanded',String(open));
    mobile.classList.toggle('is-open',open);
    document.documentElement.style.overflow=open?'hidden':'';
  };
  menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
  $$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  window.addEventListener('keydown',e=>{if(e.key==='Escape') setMenu(false)});

  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12});
  $$('.reveal').forEach(el=>observer.observe(el));

  /* Magnetic hover on primary buttons — desktop pointer only, skipped under reduced motion. */
  if(!reducedMotion && matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('.magnetic').forEach(el=>{
      el.addEventListener('mousemove',e=>{
        const r=el.getBoundingClientRect();
        const x=(e.clientX-r.left-r.width/2)*.25, y=(e.clientY-r.top-r.height/2)*.35;
        el.style.transform=`translate(${x}px, ${y-2}px)`;
      });
      el.addEventListener('mouseleave',()=>{el.style.transform=''});
    });
  }

  /* Subtle scroll-linked parallax on the hero medallion — capped, disabled under reduced motion. */
  const heroParallax=$('#hero-parallax');
  if(heroParallax && !reducedMotion){
    let ticking=false;
    const applyParallax=()=>{
      const max=window.innerHeight;
      const y=Math.min(Math.max(window.scrollY,0),max);
      heroParallax.style.transform=`translateY(${(y/max)*36}px)`;
      ticking=false;
    };
    window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(applyParallax);ticking=true}},{passive:true});
  }

  /* Add-to-calendar: builds an .ics file client-side, no backend required. */
  const calBtn=$('#add-to-calendar');
  calBtn?.addEventListener('click',e=>{
    e.preventDefault();
    const ics=[
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Takshak Entertainment//Takshak Live//EN','BEGIN:VEVENT',
      'UID:takshak-live-2026@takshakent.com',
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z`,
      'DTSTART:20261003T160000','DTEND:20261003T223000',
      'SUMMARY:Takshak Live — Dharan 2026','LOCATION:Dharan Cricket Stadium\\, Dharan',
      'DESCRIPTION:Bipul Chettri\\, Albatross\\, Pahelo Batti Muni and one surprise act\\, live in Dharan.',
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob=new Blob([ics],{type:'text/calendar'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='takshak-live-2026.ics'; document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
  });

  /* Mystery 4th-act reveal: native <details> works with no JS; this just adds the spark-burst flourish + a tracked event. */
  const mysteryCard=$('.mystery-card');
  mysteryCard?.addEventListener('toggle',()=>{
    if(!mysteryCard.open) return;
    takshakTrack('MysteryArtistReveal',{});
    const sparks=$('.mystery-sparks',mysteryCard);
    if(!sparks || reducedMotion) return;
    sparks.classList.remove('is-bursting');
    void sparks.offsetWidth;
    sparks.classList.add('is-bursting');
  });

  /* Guest list email capture — demo only. Production: POST to a protected WordPress REST/AJAX endpoint. */
  const form=$('#guest-form'), message=$('#form-message');
  form?.addEventListener('submit',e=>{
    e.preventDefault();
    const email=$('[name=email]',form);
    const errorEl=email.closest('label').querySelector('.field-error');
    if(!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){
      email.setAttribute('aria-invalid','true'); errorEl.textContent='Please enter a valid email address.';
      message.textContent=''; return;
    }
    email.removeAttribute('aria-invalid'); errorEl.textContent='';
    const record={email:email.value.trim(),consent_at:new Date().toISOString(),...utm};
    localStorage.setItem('takshak_demo_guest',JSON.stringify(record));
    takshakTrack('GuestListSubmit',{});
    form.reset(); message.innerHTML='<span class="success-mark" aria-hidden="true">✓</span> You are on the list. Watch your inbox for updates.';
  });

  takshakTrack('PageView');
})();
