/* Takshak static-site interactions and tracking hooks. Replace placeholder URLs/IDs before launch. */
(function(){
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
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
  const form=$('#giveaway-form'), message=$('#form-message');
  form?.addEventListener('submit',e=>{
    e.preventDefault(); let valid=true; const data=new FormData(form);
    $$('input,select',form).forEach(input=>{if(input.required && ((input.type==='checkbox'&&!input.checked)||(!input.value.trim()))){valid=false;input.setAttribute('aria-invalid','true');const err=input.closest('label').querySelector('.field-error');if(err)err.textContent='Please complete this field.'}else{input.removeAttribute('aria-invalid');const err=input.closest('label').querySelector('.field-error');if(err)err.textContent=''}});
    const email=$('[name=email]',form); if(email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){valid=false;email.setAttribute('aria-invalid','true');email.closest('label').querySelector('.field-error').textContent='Please enter a valid email.'}
    if(!valid){message.textContent='Please check the highlighted fields.';message.style.color='#c43c2a';return}
    const record={name:data.get('name'),phone:data.get('phone'),email:data.get('email'),city:data.get('city'),future_updates:!!data.get('updates'),consent_at:new Date().toISOString(),...utm};
    /* Production: POST record to a protected endpoint/Supabase function. Never expose a service key in this file. */
    localStorage.setItem('takshak_demo_giveaway',JSON.stringify(record));
    takshakTrack('GiveawaySubmit',{city:record.city,future_updates:record.future_updates});
    form.reset(); message.style.color='#23745d'; message.innerHTML='<span class="success-mark" aria-hidden="true">✓</span> You are in. We will contact the winner using the details you provided.';
  });
  takshakTrack('PageView');
})();
