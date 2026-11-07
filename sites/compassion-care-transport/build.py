from pathlib import Path
import json, html, shutil
from PIL import Image

ROOT=Path(__file__).parent
OUT=ROOT/'dist'
ASSETS=OUT/'assets'
ASSETS.mkdir(parents=True, exist_ok=True)
SERVICES=json.loads((ROOT/'services.json').read_text())
VIDEO_SOURCES=json.loads((ROOT/'video-sources.json').read_text()) if (ROOT/'video-sources.json').exists() else {}
ORIGIN='https://compassion-care-transport.vercel.app'
SOURCE=ROOT/'source-images'
(OUT/'service-guide.js').write_text('window.compassionCareServices='+json.dumps([{k:s[k] for k in ('title','key','slug','summary','detail','question','answer','who','overview','includes','prepare','faqs','sources')} for s in SERVICES]).replace('<','\\u003c')+';')
for s in SERVICES:
    original=SOURCE/s['image']
    target=ASSETS/(s['key']+'.webp')
    if original.exists():
        Image.open(original).convert('RGB').save(target,'WEBP',quality=86)
    elif not target.exists():
        raise FileNotFoundError('Missing service image: '+str(target))
logo_source=ROOT/'source-images/brand-original.png'
if logo_source.exists():
    shutil.copy(logo_source,ASSETS/'brand-original.png')
elif not (ASSETS/'brand-original.png').exists():
    raise FileNotFoundError('Missing supplied brand artwork')

def esc(s): return html.escape(s,quote=True)
def ld(data): return '<script type="application/ld+json">'+json.dumps(data).replace('<','\\u003c')+'</script>'
def header():
    return '''<a class="skip" href="#main">Skip to content</a><header class="site-header"><div class="container nav"><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation">Explore <span aria-hidden="true">+</span></button><nav id="main-navigation" aria-label="Main navigation"><a href="/#services">Transportation</a><a href="/#mission">Our mission</a><a href="/#service-area">Service area</a><a href="/#questions">Questions</a></nav><a class="button" href="/#request">Request a ride</a></div></header>'''
def footer():
    return '''<div id="assistant-dock" popover="manual"><button class="reception-launcher" type="button" aria-haspopup="dialog" aria-controls="reception-panel"><img src="/assets/receptionist.webp" alt=""><span>Ride assistance</span><span aria-hidden="true">↗</span></button></div><dialog id="reception-panel" aria-labelledby="reception-title"><button class="reception-close" type="button" aria-label="Close ride assistance">×</button><img class="reception-portrait" src="/assets/receptionist.webp" alt="Compassion Care virtual receptionist in a company polo"><h2 id="reception-title">Let’s get you there.</h2><div class="voice-controls"><button id="voice-toggle" class="button" type="button" aria-pressed="false">Start voice conversation</button><button id="voice-stop" type="button">Stop speaking</button></div><p id="voice-status" class="caption" role="status">Voice uses the voices available on your device.</p><p>Ask about mobility, appointments, discharge or recurring rides.</p><form id="service-help"><label for="service-question">Ask about transportation</label><div class="help-input"><input id="service-question" maxlength="240" placeholder="Wheelchair rides, recurring visits…" autocomplete="off" required><button type="submit" class="button">Ask</button></div></form><div id="assistant-suggestions" class="assistant-suggestions"><button type="button" data-question="What is wheelchair transportation?">Wheelchair rides</button><button type="button" data-question="How do I arrange a hospital discharge ride?">Hospital discharge</button><button type="button" data-question="How do recurring dialysis rides work?">Dialysis trips</button></div><p id="service-answer" role="status" aria-live="polite"></p><div id="assistant-sources" class="assistant-sources" hidden></div><a id="service-answer-link" href="/#services" hidden>Read service details</a><a class="button reception-action" href="/#request">Plan a ride request</a><a class="reception-action" href="tel:+12145663869">Call 214-566-3869</a><a class="reception-action" href="/#services">Find the right service</a><p class="caption">Use the microphone to ask about our services. Ride requests are confirmed directly by our team.</p></dialog><footer><div class="container footer"><div><img class="footer-logo" src="/assets/brand-original.png" alt="Compassion Care Transport"><p class="footer-name">Compassion Care Transport</p><a href="tel:+12145663869">214-566-3869</a><a href="mailto:Compassioncaretransport@yahoo.com">Compassioncaretransport@yahoo.com</a></div><div class="footer-connect"><p class="footer-slogan">Compassion in<br>Every Ride.<br><span>Care in Every Mile.</span></p><a href="/#service-area">Dallas–Fort Worth service area</a><a href="/#services">Explore transportation</a><a href="/#request">Plan a ride request</a></div><p class="caption">Illustrative AI-created service scenes. Operating area, availability and assistance arrangements must be confirmed with the team. Non-emergency transportation.</p></div></footer>'''
def doc(title,desc,path,body,schema):
    graph=schema.get('@graph',[])
    for item in graph:
        if item.get('@type')=='Organization':
            item.update({'logo':ORIGIN+'/assets/brand-original.png','description':'Non-emergency medical transportation serving Dallas–Fort Worth for ambulatory and wheelchair passengers, appointments, discharge and facility journeys.','contactPoint':{'@type':'ContactPoint','contactType':'Transportation inquiries','telephone':'+1-214-566-3869','email':'Compassioncaretransport@yahoo.com'},'knowsAbout':[service['title'] for service in SERVICES]})
        if item.get('@type')=='WebSite':item.update({'@id':ORIGIN+'/#website','publisher':{'@id':ORIGIN+'/#organization'},'inLanguage':'en-US'})
        if item.get('@type')=='Service':item.update({'serviceType':item['name'],'availableChannel':{'@type':'ServiceChannel','servicePhone':{'@type':'ContactPoint','telephone':'+1-214-566-3869'},'serviceUrl':item['url']}})
        if item.get('@type')=='FAQPage':item['@id']=ORIGIN+path+'#questions'
    if not any(item.get('@type')=='WebSite' for item in graph):graph.append({'@type':'WebSite','@id':ORIGIN+'/#website','name':'Compassion Care Transport','url':ORIGIN+'/','publisher':{'@id':ORIGIN+'/#organization'},'inLanguage':'en-US'})
    graph.append({'@type':'WebPage','@id':ORIGIN+path+'#webpage','url':ORIGIN+path,'name':title,'description':desc,'isPartOf':{'@id':ORIGIN+'/#website'},'about':{'@id':ORIGIN+'/#organization'},'inLanguage':'en-US','dateModified':'2026-11-07','publisher':{'@id':ORIGIN+'/#organization'}})
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large,max-video-preview:-1"><title>'+esc(title)+'</title><meta name="description" content="'+esc(desc)+'"><link rel="canonical" href="'+ORIGIN+path+'"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(desc)+'"><meta property="og:image" content="'+ORIGIN+'/assets/ambulatory.webp"><meta name="twitter:card" content="summary_large_image"><meta property="og:site_name" content="Compassion Care Transport"><meta property="og:locale" content="en_US"><meta property="og:image:alt" content="Compassion Care Transport medical transportation"><meta property="og:type" content="website"><link rel="icon" href="/assets/brand-original.png" type="image/png"><meta property="og:url" content="'+ORIGIN+path+'"><link rel="preload" href="/assets/clash-display-bold.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/style.css">'+ld(schema)+'</head><body>'+header()+body+footer()+'<script src="/assets/gsap.min.js" defer></script><script src="/assets/ScrollTrigger.min.js" defer></script><script src="/service-guide.js" defer></script><script src="/knowledge.js" defer></script><script src="/assets/lenis.min.js" defer></script><script src="/app.js" defer></script><script src="/voice.js" defer></script></body></html>'
def film(s,hero=False):
    key=s['key']; src=ASSETS/(key+'.mp4'); video_url=VIDEO_SOURCES.get(key,'/assets/'+key+'.mp4')
    video=('<video class="film-video" muted playsinline loop preload="none" poster="/assets/'+key+'.webp" data-video="'+video_url+'" aria-hidden="true"></video>') if src.exists() or key in VIDEO_SOURCES else ''
    return '<span class="film" data-film><img src="/assets/'+key+'.webp" alt="'+esc(s['summary'])+'" width="1672" height="941" '+('fetchpriority="high"' if hero else 'loading="lazy"')+'>'+video+'</span>'

def video_schema(s):
    video=ASSETS/(s['key']+'.mp4')
    if not video.exists() and s['key'] not in VIDEO_SOURCES:return []
    from datetime import datetime,timezone
    return [{'@type':'VideoObject','@id':ORIGIN+'/services/'+s['slug']+'/#film','name':s['title']+' service film','description':s['summary'],'thumbnailUrl':[ORIGIN+'/assets/'+s['key']+'.webp'],'contentUrl':VIDEO_SOURCES.get(s['key'],ORIGIN+'/assets/'+s['key']+'.mp4'),'duration':'PT10S','uploadDate':datetime.fromtimestamp(video.stat().st_mtime,timezone.utc).isoformat(),'publisher':{'@id':ORIGIN+'/#organization'}}]

BASE={'@type':'Organization','@id':ORIGIN+'/#organization','name':'Compassion Care Transport','telephone':'+1-214-566-3869','email':'Compassioncaretransport@yahoo.com','url':ORIGIN+'/','areaServed':{'@type':'Place','name':'Dallas–Fort Worth, Texas'}}
hero=SERVICES[0]
hero_html='''<main id="main"><section class="hero cinema-hero"><span class="film hero-backdrop" data-film><img src="/assets/hero.webp" alt="Compassion Care Transport morning pickup" width="1672" height="941" fetchpriority="high"><video class="film-video" muted playsinline loop preload="metadata" poster="/assets/hero.webp" data-video="/assets/hero.mp4" aria-hidden="true"></video></span><div class="hero-shade"></div><div class="hero-copy container"><p class="eyebrow">DALLAS–FORT WORTH · NON-EMERGENCY TRANSPORTATION</p><h1>Care in<br>every mile.</h1><p class="lead">Dallas–Fort Worth rides for appointments,<br>ongoing care and the journey home.</p><div class="actions"><a class="button" href="#request">Request a ride <span aria-hidden="true">↗</span></a><a class="quiet-link" href="#services">Explore our services ↓</a></div></div><div class="hero-bottom container"><span>Compassion in Every Ride.</span><button class="motion-toggle" type="button" aria-pressed="false">Pause films</button></div></section>'''
schema={'@context':'https://schema.org','@graph':[BASE,{'@type':'WebSite','name':'Compassion Care Transport','telephone':'+1-214-566-3869','email':'Compassioncaretransport@yahoo.com','url':ORIGIN+'/','publisher':{'@id':ORIGIN+'/#organization'}}]}
(OUT/'index.html').write_text(doc('DFW Non-Emergency Medical Transportation | Compassion Care','Compassionate non-emergency transportation for ambulatory and wheelchair passengers, medical appointments, dialysis, rehabilitation and hospital discharges.','/',hero_html+'</main>',schema))


def education(service):
    block='<div class="service-education"><div class="education-intro"><p class="eyebrow">UNDERSTAND YOUR RIDE</p><h3>Who this is for</h3><p>'+esc(service['who'])+'</p><h3>How the journey is planned</h3><p>'+esc(service['overview'])+'</p></div>'
    for title,key in [('What we plan with you','includes'),('Have these details ready','prepare')]:
        block+='<div class="education-card"><h3>'+title+'</h3><ul>'+''.join('<li>'+esc(v)+'</li>' for v in service[key])+'</ul></div>'
    block+='<div class="education-faq"><h3>Questions about this service</h3>'+''.join('<details><summary>'+esc(f['q'])+'</summary><p>'+esc(f['a'])+'</p></details>' for f in service['faqs'])+'</div>'
    block+='<p class="education-confirm">Our team confirms pickup timing, vehicle suitability, assistance and return arrangements before accepting a ride.</p><details class="education-sources"><summary>Sources for general planning guidance</summary><ul>'+''.join('<li><a href="'+esc(v['url'])+'" target="_blank" rel="noopener noreferrer">'+esc(v['title'])+'</a></li>' for v in service['sources'])+'</ul></details></div>'
    return block

def finish_page():
    content=hero_html+'''<section id="mission" class="mission"><div class="container"><h2>Dependable transportation.<br>Personal attention.</h2><p>Our mission is to deliver exceptional non-emergency medical transportation services through reliability, safety, and compassionate care. We strive to build lasting partnerships with healthcare providers, facilities, and communities while ensuring every passenger receives respectful and dependable transportation.</p></div></section><section id="service-area" class="area-section"><div class="container"><p class="eyebrow">OUR SERVICE AREA</p><h2>Care across<br>Dallas–Fort Worth.</h2><p class="lead">Compassion Care Transport provides non-emergency medical transportation in the Dallas–Fort Worth area for ambulatory and wheelchair passengers, medical appointments, ongoing care and hospital discharge journeys.</p><p>Pickup and drop-off can be arranged at hospitals, nursing homes, doctors’ offices, clinics and homes. Share both addresses so the team can confirm trip availability, vehicle suitability and assistance arrangements.</p><figure class="pickup-feature"><img src="/assets/home-pickup.webp" alt="A Compassion Care driver assisting a passenger at her suburban home with a transport van in the driveway" width="1672" height="941" loading="lazy"><figcaption>Home pickup and drop-off, connected to appointments and care destinations.</figcaption></figure></div></section><section id="services" class="services container"><div class="section-intro"><h2>A ride for your next step.</h2><p>Select a service film to explore the details.</p><button class="motion-toggle" type="button" aria-pressed="false">Pause films</button></div>'''
    short_names=['Ambulatory','Wheelchair','Discharges','Doctor visits','Dialysis','Rehabilitation','Facility rides']
    content+='<nav class="service-index" aria-label="Choose a transportation service">'+''.join('<a href="#service-'+s['key']+'" data-chapter="'+s['key']+'"><span>'+str(i+1).zfill(2)+'</span>'+short_names[i]+'</a>' for i,s in enumerate(SERVICES))+'</nav>'
    for i,s in enumerate(SERVICES):
        content+='<section id="service-'+s['key']+'" class="service-chapter chapter-'+str(i%3)+'" aria-labelledby="heading-'+s['key']+'"><details class="service-disclosure"><summary aria-label="Explore '+esc(s['title'])+'">'+film(s)+'<span class="service-heading"><span class="service-name">'+esc(s['title'])+'</span><span role="heading" aria-level="3" class="service-title" id="heading-'+s['key']+'">'+esc(s['heading'])+'</span><span class="explore">Explore this service <span aria-hidden="true">+</span></span></span></summary><div class="service-detail"><p class="lead">'+esc(s['summary'])+'</p><p>'+esc(s['detail'])+'</p>'+education(s)+'<div class="actions"><a class="button request-service" data-service="'+esc(s['title'])+'" href="#request">Request this service</a><a href="/services/'+s['slug']+'/">Read service details</a></div></div></details></section>'
    content+='''</section><section class="planning"><div class="container planning-grid"><h2>Tell us what<br>the trip needs.</h2><dl><div><dt>Your appointment</dt><dd>Share the required arrival time and both addresses.</dd></div><div><dt>Your mobility</dt><dd>Include walking aids, wheelchair type and boarding needs.</dd></div><div><dt>Your return</dt><dd>Discuss the return journey or a recurring appointment pattern.</dd></div></dl></div></section><section id="questions" class="container questions"><h2>Before your ride.</h2><div>'''
    faqs=[('Where can passengers be picked up or dropped off?','Pickup and drop-off can be arranged at hospitals, nursing homes, doctors’ offices, clinics and homes in the Dallas–Fort Worth area. Share both addresses so the team can confirm trip availability and suitable assistance.'),('Where does Compassion Care Transport provide rides?','Compassion Care Transport serves the Dallas–Fort Worth area. Share your pickup and destination addresses so the team can confirm availability and suitable transportation for your trip.'),('What transportation services are available?','Ambulatory and wheelchair transportation, hospital discharge rides, doctor appointments, dialysis, rehabilitation, and assisted living or nursing facility transportation.'),('Can I request recurring transportation?','Share the appointment dates, arrival times and assistance needs so the team can review a recurring schedule.'),('Does submitting a request confirm my ride?','No. The team must confirm trip suitability, vehicle availability and pickup arrangements before a ride is booked.')]
    for q,a in faqs: content+='<details><summary>'+q+'</summary><p>'+a+'</p></details>'
    content+='''</div></section><section id="request" class="request"><div class="container request-grid"><div><h2>Let’s plan<br>your ride.</h2><p>Start with the trip details.</p><p class="caption">Review your details, then email them to our team or call 214-566-3869. Transportation is confirmed directly by the team.</p></div><form id="ride-form"><div class="form-pair"><div><label for="passenger-name">Your name</label><input id="passenger-name" name="passenger-name" autocomplete="name" required></div><div><label for="contact-phone">Contact phone</label><input id="contact-phone" name="contact-phone" type="tel" autocomplete="tel" required></div></div><label for="service">Transportation service</label><select id="service" name="service">'''
    content+=''.join('<option>'+esc(s['title'])+'</option>' for s in SERVICES)
    content+='''</select><div class="form-pair"><div><label for="pickup">Pickup address</label><input id="pickup" name="pickup" autocomplete="street-address" required></div><div><label for="destination">Destination</label><input id="destination" name="destination" required></div></div><div class="form-pair"><div><label for="arrival">Required arrival</label><input id="arrival" name="arrival" type="datetime-local" required></div><div><label for="return">Return journey</label><select id="return" name="return"><option>One way</option><option>Return ride needed</option><option>Recurring schedule</option></select></div></div><label for="needs">Mobility and access needs</label><textarea id="needs" name="needs" rows="3" placeholder="Walking aids, wheelchair type or pickup access. Please leave out medical records."></textarea><button class="button" type="submit">Review ride request</button><p id="request-status" role="status" aria-live="polite"></p><pre id="request-summary" hidden></pre><a id="email-request" class="button" hidden>Email this request</a><a class="call-request" href="tel:+12145663869">Call 214-566-3869</a></form></div></section></main>'''
    fullschema={'@context':'https://schema.org','@graph':[BASE,{'@type':'WebSite','name':'Compassion Care Transport','telephone':'+1-214-566-3869','email':'Compassioncaretransport@yahoo.com','url':ORIGIN+'/'},{'@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in faqs]}]}
    fullschema['@graph'].append({'@type':'OfferCatalog','@id':ORIGIN+'/#transportation-services','name':'Compassion Care transportation services','itemListElement':[{'@type':'OfferCatalog','name':service['title'],'itemListElement':[{'@type':'Service','@id':ORIGIN+'/services/'+service['slug']+'/#service','name':service['title'],'url':ORIGIN+'/services/'+service['slug']+'/','provider':{'@id':ORIGIN+'/#organization'},'areaServed':'Dallas–Fort Worth, Texas'}]} for service in SERVICES]})
    fullschema['@graph']+=[{'@type':'ItemList','name':'Transportation services','itemListElement':[{'@type':'ListItem','position':i+1,'name':v['title'],'url':ORIGIN+'/services/'+v['slug']+'/'} for i,v in enumerate(SERVICES)]}]+[item for v in SERVICES for item in video_schema(v)]
    if (ASSETS/'company-explainer.mp4').exists():
        from datetime import datetime,timezone
        fullschema['@graph'].append({'@type':'VideoObject','@id':ORIGIN+'/#company-explainer','name':'Compassion Care Transport services and pickup locations','description':'Seven non-emergency transportation services in Dallas–Fort Worth, with pickup and drop-off at hospitals, nursing homes, doctors’ offices, clinics and homes.','thumbnailUrl':[ORIGIN+'/assets/explainer-poster.jpg'],'contentUrl':ORIGIN+'/assets/company-explainer.mp4','duration':'PT15S','uploadDate':datetime.fromtimestamp((ASSETS/'company-explainer.mp4').stat().st_mtime,timezone.utc).isoformat(),'publisher':{'@id':ORIGIN+'/#organization'}})
    (OUT/'index.html').write_text(doc('DFW Non-Emergency Medical Transportation | Compassion Care','Request non-emergency medical transportation in Dallas–Fort Worth for wheelchair rides, appointments and discharge. Call Compassion Care at 214-566-3869.','/',content.replace('</main>', '''<section id="our-story" class="story container"><div class="section-intro"><h2>Every mile has a purpose.</h2><p>Compassion Care, in 15 seconds.</p></div><video class="story-video" data-story controls muted playsinline preload="metadata" poster="/assets/explainer-poster.jpg" aria-label="15-second animated introduction to Compassion Care Transport"><source src="/assets/company-explainer.mp4" type="video/mp4"></video><div class="service-recap"><p class="eyebrow">SEVEN WAYS WE HELP YOU GET THERE</p><ol><li><a href="#service-ambulatory" class="recap-link"><span class="recap-number">01</span><span>Ambulatory transport</span><span class="recap-arrow" aria-hidden="true">↗</span></a></li><li><a href="#service-wheelchair" class="recap-link"><span class="recap-number">02</span><span>Wheelchair transport</span><span class="recap-arrow" aria-hidden="true">↗</span></a></li><li><a href="#service-hospital" class="recap-link"><span class="recap-number">03</span><span>Hospital discharges</span><span class="recap-arrow" aria-hidden="true">↗</span></a></li><li><a href="#service-doctor" class="recap-link"><span class="recap-number">04</span><span>Doctor appointments</span><span class="recap-arrow" aria-hidden="true">↗</span></a></li><li><a href="#service-dialysis" class="recap-link"><span class="recap-number">05</span><span>Dialysis transport</span><span class="recap-arrow" aria-hidden="true">↗</span></a></li><li><a href="#service-rehabilitation" class="recap-link"><span class="recap-number">06</span><span>Rehabilitation visits</span><span class="recap-arrow" aria-hidden="true">↗</span></a></li><li><a href="#service-facility" class="recap-link"><span class="recap-number">07</span><span>Assisted living & nursing facilities</span><span class="recap-arrow" aria-hidden="true">↗</span></a></li></ol><div class="destination-recap"><p class="eyebrow">FROM YOUR DOOR TO THE NEXT STEP</p><p>Homes. Hospitals. Clinics.<br>Doctors’ offices. Care facilities.</p></div></div><a class="button" href="#request">Plan your next ride</a></section></main>'''),fullschema))
    trip_needs={
      'ambulatory':['Walking aids and boarding assistance','Steps or access at each address','Required arrival and return arrangements'],
      'wheelchair':['Wheelchair type and access requirements','Pickup and destination entrance details','Assistance needs and required arrival'],
      'hospital':['Discharge ready time and coordinating contact','Home or receiving facility destination','Mobility needs and handoff arrangements'],
      'doctor':['Appointment location and required arrival','Walking or wheelchair assistance','Return ride and companion arrangements'],
      'dialysis':['Treatment days and required arrival times','Expected return arrangements','Changes in mobility or recurring schedule'],
      'rehabilitation':['Therapy dates and required arrival times','Walking aids or wheelchair requirements','Return arrangements and access needs'],
      'facility':['Resident mobility and boarding needs','Facility and receiving contact','Pickup access, handoff and return arrangements']
    }
    search_titles={
        'ambulatory':'Ambulatory Transportation in DFW | Compassion Care',
        'wheelchair':'Wheelchair Transportation in DFW | Compassion Care',
        'hospital':'Hospital Discharge Rides in DFW | Compassion Care',
        'doctor':'Doctor Appointment Rides in DFW | Compassion Care',
        'dialysis':'Dialysis Transportation in DFW | Compassion Care',
        'rehabilitation':'Rehabilitation Appointment Rides in DFW | Compassion Care',
        'facility':'Assisted Living & Facility Rides in DFW | Compassion Care'}
    search_descriptions={s['key']:'Plan '+s['title'].lower()+' in Dallas–Fort Worth with Compassion Care. Discuss pickup, access and return needs: 214-566-3869.' for s in SERVICES}
    for s in SERVICES:
        path='/services/'+s['slug']+'/'
        body='<main id="main" class="container service-page"><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/#services">Transportation</a></nav><h1>'+esc(s['title'])+'</h1><p class="lead">'+esc(s['summary'])+'</p>'+film(s)+'<section><h2>Planning your trip</h2><p>'+esc(s['detail'])+'</p></section><section><h2>'+esc(s['question'])+'</h2><p>'+esc(s['answer'])+'</p></section><div class="actions"><a class="button request-service" data-service="'+esc(s['title'])+'" href="/#request">Request this service</a><a href="/#services">Explore all services</a></div></main>'
        body=body.replace('<div class="actions">',education(s)+'<div class="actions">',1)
        body=body.replace('<h1>','<p class="eyebrow">DALLAS–FORT WORTH AREA</p><h1>',1)
        body=body.replace('<div class="actions">','<section class="trip-checklist"><h2>Details to have ready</h2><ul>'+''.join('<li>'+esc(v)+'</li>' for v in trip_needs[s['key']])+'</ul></section><section><h2>How to arrange a ride</h2><p>Choose '+esc(s['title'].lower())+' and prepare the trip details. The transportation team must review your request, vehicle suitability and availability before confirming pickup. A calendar appointment or prepared request alone does not confirm transportation.</p></section><div class="actions">')
        schema={'@context':'https://schema.org','@graph':[BASE,{'@type':'Service','@id':ORIGIN+path+'#service','url':ORIGIN+path,'name':s['title'],'description':s['summary'],'areaServed':{'@type':'Place','name':'Dallas–Fort Worth, Texas'},'provider':{'@id':ORIGIN+'/#organization'}},{'@type':'FAQPage','mainEntity':[{'@type':'Question','name':s['question'],'acceptedAnswer':{'@type':'Answer','text':s['answer']}}]},{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':ORIGIN+'/'},{'@type':'ListItem','position':2,'name':s['title'],'item':ORIGIN+path}]}]}
        schema['@graph']+=video_schema(s)
        for item in schema['@graph']:
            if item.get('@type')=='FAQPage':item['mainEntity'] += [{'@type':'Question','name':faq['q'],'acceptedAnswer':{'@type':'Answer','text':faq['a']}} for faq in s['faqs']]
        p=OUT/'services'/s['slug'];p.mkdir(parents=True,exist_ok=True)
        (p/'index.html').write_text(doc(search_titles[s['key']],search_descriptions[s['key']],path,body,schema))
    (OUT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+ORIGIN+'/sitemap.xml\nSitemap: '+ORIGIN+'/video-sitemap.xml\n')
    urls=['/']+['/services/'+s['slug']+'/' for s in SERVICES]
    (OUT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+ORIGIN+p+'</loc></url>' for p in urls)+'</urlset>')

if __name__=='__main__':
    import sys
    if '--full' in sys.argv: finish_page()
    print('Built hero' if '--full' not in sys.argv else 'Built landing page and seven service pages')

if __name__ == "__main__":
    for page in OUT.rglob("*.html"):
        text=page.read_text()
        for key,url in VIDEO_SOURCES.items():
            text=text.replace("/assets/"+key+".mp4",url)
        page.write_text(text)

if __name__ == "__main__":
    from xml.etree.ElementTree import Element,SubElement,ElementTree,register_namespace
    register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    register_namespace('video', 'http://www.google.com/schemas/sitemap-video/1.1')
    sm='http://www.sitemaps.org/schemas/sitemap/0.9';vn='http://www.google.com/schemas/sitemap-video/1.1'
    sitemap=Element('{'+sm+'}urlset'); by_path={}
    videos=[(s['key'],'/services/'+s['slug']+'/',s['title'],s['summary'],s['key']+'.webp') for s in SERVICES]+[('hero','/','Compassion Care Transport overview','Non-emergency transportation journeys across Dallas–Fort Worth.','hero.webp'),('company-explainer','/','Compassion Care services explained','Seven non-emergency transportation services and company contact details.','explainer-poster.jpg')]
    for key,path,title,desc,poster in videos:
        if path not in by_path:
            by_path[path]=SubElement(sitemap,'{'+sm+'}url');SubElement(by_path[path],'{'+sm+'}loc').text=ORIGIN+path
        entry=by_path[path];video=SubElement(entry,'{'+vn+'}video')
        for name,value in [('thumbnail_loc',ORIGIN+'/assets/'+poster),('title',title),('description',desc),('content_loc',VIDEO_SOURCES.get(key,ORIGIN+'/assets/'+key+'.mp4'))]:SubElement(video,'{'+vn+'}'+name).text=value
    ElementTree(sitemap).write(OUT/'video-sitemap.xml',encoding='utf-8',xml_declaration=True)
