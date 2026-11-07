const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let careLenis=null,careRaf=0;
const careScrollTick=time=>careLenis?.raf(time*1000);
function configureSmoothScroll(){
 if(careLenis){window.gsap?.ticker.remove(careScrollTick);cancelAnimationFrame(careRaf);careLenis.destroy();careLenis=null;}
 if(reduced.matches||!window.Lenis)return;
 careLenis=new Lenis({duration:1.18,smoothWheel:true,syncTouch:false,anchors:false,prevent:node=>Boolean(node.closest('#reception-panel,textarea,select,.service-index'))});
 if(window.ScrollTrigger)careLenis.on('scroll',ScrollTrigger.update);
 if(window.gsap){gsap.ticker.add(careScrollTick);gsap.ticker.lagSmoothing(0);}
 else{const tick=time=>{careLenis?.raf(time);careRaf=requestAnimationFrame(tick);};careRaf=requestAnimationFrame(tick);}
}
configureSmoothScroll();reduced.addEventListener('change',configureSmoothScroll);
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href]');if(!careLenis||!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const url=new URL(link.href,location.href);if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
 let target;try{target=document.querySelector(url.hash);}catch{return;}if(!target)return;
 event.preventDefault();history.replaceState(null,'',url.hash);careLenis.scrollTo(target,{offset:-24,duration:1.25});
});
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
    document.querySelectorAll('.mission h2,.section-intro h2,.planning h2,.questions h2,.request h2').forEach(el=>gsap.from(el,{y:52,opacity:0,duration:.95,ease:'expo.out',scrollTrigger:{trigger:el,start:'clamp(top 92%)',once:true}}));
    document.querySelectorAll('.service-heading').forEach(el=>gsap.from(el,{opacity:0,y:48,duration:.95,ease:'power3.out',scrollTrigger:{trigger:el,start:'clamp(top 94%)',once:true}}));
  });
  media.add('(min-width: 961px) and (prefers-reduced-motion: no-preference)',()=>{
    document.querySelectorAll('.service-chapter .film-video,.hero-backdrop .film-video').forEach(el=>gsap.fromTo(el,{yPercent:-3,scale:1.08},{yPercent:3,scale:1.08,ease:'none',scrollTrigger:{trigger:el.closest('.service-chapter,.cinema-hero'),start:'top bottom',end:'bottom top',scrub:1.1}}));
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
document.querySelector('.reception-launcher')?.addEventListener('click',()=>careLenis?.stop());reception?.addEventListener('close',()=>careLenis?.start());
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

// Staggered content reveals connect the cinematic service chapters.
if(window.gsap&&window.ScrollTrigger){
 const motion=gsap.matchMedia();
 motion.add('(prefers-reduced-motion: no-preference)',()=>{
  gsap.from('.hero-copy .eyebrow,.hero-copy h1,.hero-copy .lead,.hero-copy .actions',{opacity:0,y:36,stagger:.13,duration:1.05,ease:'power3.out',delay:.12,clearProps:'transform,opacity'});
  const groups=[['.mission .container','.mission p'],['.area-section .container','.area-section .eyebrow,.area-section h2,.area-section .lead,.area-section p:not(.lead):not(.eyebrow)'],['.planning-grid','.planning dl>div'],['.questions','.questions details'],['.request-grid','.request form'],['.story','.story .section-intro p,.story .story-video,.story>.caption,.story>.button'],['.footer','.footer>div,.footer>.caption'],['.service-page','.service-page>nav,.service-page>.eyebrow,.service-page>h1,.service-page>.lead']];
  groups.forEach(([trigger,selector])=>{const elements=document.querySelectorAll(selector);if(!elements.length)return;gsap.from(elements,{opacity:0,y:38,stagger:.12,duration:.9,ease:'power3.out',scrollTrigger:{trigger,start:'clamp(top 88%)',once:true},clearProps:'transform,opacity'});});
  document.querySelectorAll('.service-page section').forEach(el=>gsap.from(el,{opacity:0,y:32,duration:.85,ease:'power2.out',scrollTrigger:{trigger:el,start:'clamp(top 90%)',once:true},clearProps:'transform,opacity'}));
 });
}
