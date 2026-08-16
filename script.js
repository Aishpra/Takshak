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
  $$('[data-track]').forEach(el=>el.addEventListener('click',()=>takshakTrack(el.dataset.track,{button_location:el.closest('section')?.id||'navigation'})));

  const progress=$('#scroll-progress-bar');
  const updateProgress=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(max>0?(window.scrollY/max)*100:0)+'%'};
  window.addEventListener('scroll',updateProgress,{passive:true}); updateProgress();

  const menu=$('.menu-toggle'), mobile=$('#mobile-menu');
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));mobile.hidden=open;});
  $$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');mobile.hidden=true;}));

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
      'DESCRIPTION:Bipul Chettri\\, Albatross and Pahelo Batti Muni live in Dharan.',
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob=new Blob([ics],{type:'text/calendar'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='takshak-live-2026.ics'; document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
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
