/* Takshak site-wide interactions and tracking hooks. Shared across every generated page. */
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

  /* Structured-placeholder photos: reveal the real image on load, quietly remove it on 404
     so the placeholder (gradient + initials) stays in place until a real file exists. */
  $$('.artist-photo-img').forEach(img=>{
    img.addEventListener('load',()=>img.classList.add('is-loaded'));
    img.addEventListener('error',()=>img.remove());
  });

  $$('[data-track]').forEach(el=>el.addEventListener('click',()=>takshakTrack(el.dataset.track,{button_location:el.closest('section')?.id||'navigation'})));

  const progress=$('#scroll-progress-bar');
  const updateProgress=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(max>0?(window.scrollY/max)*100:0)+'%'};
  window.addEventListener('scroll',updateProgress,{passive:true}); updateProgress();

  /* Nav active state — a link is active if the current path matches or is nested under its href. */
  const path=location.pathname;
  $$('[data-nav]').forEach(a=>{
    const href=a.getAttribute('href');
    if(href!=='/' && (path===href || path.startsWith(href))) a.classList.add('is-active');
  });

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

  /* Add-to-calendar: builds an .ics file client-side from the button's data-* attributes, no backend required. */
  const calBtn=$('#add-to-calendar');
  calBtn?.addEventListener('click',e=>{
    e.preventDefault();
    const d=calBtn.dataset;
    const dateCompact=(d.eventDate||'').replace(/-/g,'');
    const gatesHour=(()=>{const m=(d.gatesTime||'').match(/(\d+):(\d+)\s*(AM|PM)/i);if(!m)return '160000';let h=parseInt(m[1],10);if(/PM/i.test(m[3])&&h!==12)h+=12;if(/AM/i.test(m[3])&&h===12)h=0;return String(h).padStart(2,'0')+m[2]+'00';})();
    const startHour=parseInt(gatesHour.slice(0,2),10);
    const endHour=String(Math.min(startHour+6,23)).padStart(2,'0');
    const esc=s=>String(s||'').replace(/([,;])/g,'\\$1');
    const ics=[
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Takshak Entertainment//Events//EN','BEGIN:VEVENT',
      `UID:${dateCompact}-${(d.eventName||'event').toLowerCase().replace(/\s+/g,'-')}@takshakent.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z`,
      `DTSTART:${dateCompact}T${gatesHour}`,`DTEND:${dateCompact}T${endHour}0000`,
      `SUMMARY:${esc(d.eventName)} — Takshak Entertainment`,`LOCATION:${esc(d.eventLocation)}`,
      `DESCRIPTION:${esc(d.eventDescription)}`,
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob=new Blob([ics],{type:'text/calendar'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=`${(d.eventName||'takshak-event').toLowerCase().replace(/\s+/g,'-')}.ics`; document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
  });

  /* Mystery act reveal: native <details> works with no JS; this just adds the spark-burst flourish + a tracked event. */
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

  /* Artists directory — client-side genre filter (only present on /artists/). */
  const filterPills=$$('.filter-pill');
  if(filterPills.length){
    const cards=$$('#artist-filter-grid .artist-card');
    const empty=$('.filter-empty');
    filterPills.forEach(pill=>pill.addEventListener('click',()=>{
      filterPills.forEach(p=>p.classList.toggle('is-active',p===pill));
      const filter=pill.dataset.filter;
      let visible=0;
      cards.forEach(card=>{
        const show=filter==='all' || card.dataset.category===filter;
        card.hidden=!show;
        if(show) visible++;
      });
      if(empty) empty.hidden=visible>0;
      takshakTrack('ArtistFilter',{filter});
    }));
  }

  /* Booking form — preselects the artist from ?artist=slug (e.g. linked from an artist page's Book CTA). */
  const artistSelect=$('#booking-artist-select');
  const preselectArtist=params.get('artist');
  if(artistSelect && preselectArtist){
    const opt=[...artistSelect.options].find(o=>o.value===preselectArtist);
    if(opt) artistSelect.value=preselectArtist;
  }

  function wireDemoForm(formId,messageId,successHTML,eventName,extraFields=[]){
    const form=$(formId), message=$(messageId);
    if(!form) return;
    form.addEventListener('submit',e=>{
      e.preventDefault();
      let valid=true;
      $$('[required]',form).forEach(field=>{
        const errorEl=field.closest('label')?.querySelector('.field-error');
        const filled=field.type==='checkbox'?field.checked:field.value.trim();
        if(!filled){valid=false;field.setAttribute('aria-invalid','true');if(errorEl)errorEl.textContent='Please complete this field.'}
        else{field.removeAttribute('aria-invalid');if(errorEl)errorEl.textContent=''}
      });
      const email=$('[name=email]',form);
      if(email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){
        valid=false;email.setAttribute('aria-invalid','true');
        const errorEl=email.closest('label')?.querySelector('.field-error');
        if(errorEl)errorEl.textContent='Please enter a valid email address.';
      }
      if(!valid){ if(message){message.textContent='Please check the highlighted fields.';message.style.color='#e0654a'} return; }
      const data=new FormData(form);
      const record={consent_at:new Date().toISOString(),...utm};
      data.forEach((v,k)=>record[k]=v);
      localStorage.setItem(`takshak_demo_${eventName}`,JSON.stringify(record));
      takshakTrack(eventName,{});
      form.reset();
      if(message){message.style.color='#8ab27a';message.innerHTML=successHTML}
    });
  }

  wireDemoForm('#booking-form','#booking-form-message','<span class="success-mark" aria-hidden="true">✓</span> Request sent. Takshak will follow up by email shortly.','BookingRequestSubmit');
  wireDemoForm('#contact-form','#contact-form-message','<span class="success-mark" aria-hidden="true">✓</span> Message sent. We\'ll get back to you soon.','ContactFormSubmit');

  takshakTrack('PageView');
})();
