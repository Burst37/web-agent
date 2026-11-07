const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches;
let activeFilm=null;
const films=[...document.querySelectorAll('[data-film]')];
const story=document.querySelector('[data-story]');
let storyVisible=false,storyEnded=false;
function syncStory(){if(!story)return;if(storyVisible&&!paused&&!reduced.matches&&!document.hidden&&!storyEnded){story.muted=true;story.play().catch(()=>{});}else story.pause();}
if(story){new IntersectionObserver(entries=>{storyVisible=entries[0].isIntersecting;syncStory();},{threshold:.5}).observe(story);story.addEventListener('ended',()=>{storyEnded=true;});}

function sync(frame){const v=frame.querySelector('video');if(!v)return;const run=frame===activeFilm&&frame.dataset.visible==='true'&&!paused&&!reduced.matches&&!document.hidden;if(run){if(!v.src)v.src=v.dataset.video;v.muted=true;v.play().catch(()=>{});}else v.pause();}
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{e.target.dataset.visible=String(e.isIntersecting);e.target.dataset.ratio=String(e.intersectionRatio);});activeFilm=films.filter(f=>f.dataset.visible==='true').sort((a,b)=>Number(b.dataset.ratio||0)-Number(a.dataset.ratio||0))[0]||null;films.forEach(sync);},{threshold:[0,.15,.4,.6,.8,1]});
films.forEach(frame=>{observer.observe(frame);const v=frame.querySelector('video');v?.addEventListener('playing',()=>v.classList.add('ready'));v?.addEventListener('error',()=>v.classList.remove('ready'));});
function updateMotion(){document.querySelectorAll('.motion-toggle').forEach(b=>{b.textContent=paused?'Play films':'Pause films';b.setAttribute('aria-pressed',String(paused));});films.forEach(sync);syncStory();}
document.querySelectorAll('.motion-toggle').forEach(b=>b.addEventListener('click',()=>{paused=!paused;updateMotion();}));
reduced.addEventListener('change',()=>{paused=reduced.matches;updateMotion();});
document.addEventListener('visibilitychange',()=>{films.forEach(sync);syncStory();});
updateMotion();
document.querySelectorAll('.request-service').forEach(a=>a.addEventListener('click',()=>{const service=document.querySelector('#service');if(service)service.value=a.dataset.service;else sessionStorage.setItem('requested-service',a.dataset.service);}));
const service=document.querySelector('#service');if(service){const prior=sessionStorage.getItem('requested-service');if(prior){service.value=prior;sessionStorage.removeItem('requested-service');}}
document.querySelector('#ride-form')?.addEventListener('submit',e=>{
 e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;
 const d=new FormData(form),arrival=new Date(d.get('arrival'));
 if(arrival<=new Date()){document.querySelector('#request-status').textContent='Please choose a future arrival time.';return;}
 const text=['Compassion Care Transport ride request','Name: '+d.get('passenger-name'),'Phone: '+d.get('contact-phone'),d.get('service'),'Pickup: '+d.get('pickup'),'Destination: '+d.get('destination'),'Required arrival: '+d.get('arrival'),'Journey: '+d.get('return'),'Access needs: '+(d.get('needs')||'Not supplied')].join('\n');
 document.querySelector('#request-summary').textContent=text;document.querySelector('#request-summary').hidden=false;
 const email=document.querySelector('#email-request');email.href='mailto:Compassioncaretransport@yahoo.com?subject='+encodeURIComponent('Ride request — '+d.get('service'))+'&body='+encodeURIComponent(text);email.hidden=false;
 document.querySelector('#request-status').textContent='Review your details below, then tap Email this request to send from your email app. Your ride is confirmed only after our team responds. You can also call 214-566-3869.';
});
if(window.gsap&&window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
    document.querySelectorAll('.mission h2,.section-intro h2,.planning h2,.questions h2,.request h2').forEach(el=>gsap.from(el,{y:30,opacity:0,duration:.6,ease:'power3.out',scrollTrigger:{trigger:el,start:'clamp(top 92%)',once:true}}));
    document.querySelectorAll('.service-chapter').forEach(el=>gsap.from(el.querySelector('.film'),{y:30,scale:.985,duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'clamp(top 92%)',once:true}}));
  });
  media.add('(min-width: 961px) and (prefers-reduced-motion: no-preference)',()=>{
    document.querySelectorAll('.service-heading').forEach(el=>gsap.fromTo(el,{y:12},{y:-12,ease:'none',scrollTrigger:{trigger:el.closest('.service-chapter'),start:'top bottom',end:'bottom top',scrub:.35}}));
  });
  document.querySelectorAll('.service-disclosure').forEach(el=>el.addEventListener('toggle',()=>{
    if(el.open&&!reduced.matches)gsap.from(el.querySelector('.service-detail'),{opacity:0,y:12,duration:.3,ease:'power2.out',clearProps:'all'});
    ScrollTrigger.refresh();
  }));
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
}
const menuToggle=document.querySelector('.menu-toggle');
function closeMenu(){document.querySelector('.site-header')?.classList.remove('menu-open');menuToggle?.setAttribute('aria-expanded','false');}
menuToggle?.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));document.querySelector('.site-header').classList.toggle('menu-open',open);});
document.querySelectorAll('#main-navigation a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuToggle?.getAttribute('aria-expanded')==='true'){closeMenu();menuToggle.focus();}});
const chapterObserver=new IntersectionObserver(entries=>{const candidates=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(!candidates.length)return;const active=candidates[0].target.id.replace('service-','');document.querySelectorAll('.service-index a').forEach(a=>{if(a.dataset.chapter===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-20% 0px -30% 0px',threshold:[0,.2,.5]});
document.querySelectorAll('.service-chapter').forEach(el=>chapterObserver.observe(el));
const reception=document.querySelector('#reception-panel');document.querySelector('.reception-launcher')?.addEventListener('click',()=>reception.showModal());document.querySelector('.reception-close')?.addEventListener('click',()=>reception.close());document.querySelectorAll('.reception-action').forEach(a=>a.addEventListener('click',()=>reception.close()));reception?.addEventListener('click',e=>{if(e.target===reception){const r=reception.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)reception.close();}});
document.querySelector('#service-help')?.addEventListener('submit',e=>{
  e.preventDefault();const q=document.querySelector('#service-question').value.trim().toLowerCase();if(!q)return;
  const keys=[['wheelchair','wheelchair'],['chair','wheelchair'],['dialysis','dialysis'],['rehab','rehabilitation'],['therapy','rehabilitation'],['discharge','hospital'],['hospital','hospital'],['nursing','facility'],['assisted living','facility'],['facility','facility'],['doctor','doctor'],['appointment','doctor'],['walker','ambulatory'],['cane','ambulatory'],['ambulatory','ambulatory']];
  const hit=keys.find(([term])=>q.includes(term));const entry=window.compassionCareServices?.find(s=>s.key===hit?.[1]);
  const answer=document.querySelector('#service-answer'),link=document.querySelector('#service-answer-link');link.hidden=true;
  if(/emergency|chest pain|can't breathe|cannot breathe/.test(q))answer.textContent='Compassion Care provides non-emergency transportation. For a medical emergency, call 911.';
  else if(/book|schedule|reserve|availability|calendar/.test(q)&&!entry)answer.textContent='You can prepare your trip details with Plan a ride request. The team must confirm vehicle suitability, availability and pickup. Call 214-566-3869 to arrange your ride, or use the request form to email our team.';
  else if(/pickup|pick up|drop.off|from home|clinic/.test(q))answer.textContent='Pickup and drop-off can be arranged at hospitals, nursing homes, doctors’ offices, clinics and homes in the Dallas–Fort Worth area. Share both addresses so the team can confirm trip availability and assistance needs.';
  else if(/area|city|where|dallas|fort worth|dfw/.test(q))answer.textContent='Compassion Care Transport serves the Dallas–Fort Worth area. Share the pickup and destination so the team can confirm trip availability, vehicle suitability and assistance arrangements.';
  else if(/price|cost|insurance|medicaid|medicare|hours|phone/.test(q))answer.textContent='Call 214-566-3869 or email Compassioncaretransport@yahoo.com for pricing, payment options and operating hours.';
  else if(/recurring|regular|weekly|repeat/.test(q)&&!entry)answer.textContent='Share the appointment dates, required arrival times, pickup and destination, and assistance needs. The team can then review a recurring transportation schedule.';
  else if(entry){answer.textContent=entry.summary+' '+entry.detail;link.href='/services/'+entry.slug+'/';link.textContent='Explore '+entry.title.toLowerCase();link.hidden=false;}
  else answer.textContent='Compassion Care offers ambulatory and wheelchair rides, hospital discharges, doctor appointments, dialysis, rehabilitation, and facility transportation. Ask about one of these services or prepare a trip request below.';
});
