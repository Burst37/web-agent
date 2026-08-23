---
name: sa-local-seo-geo
display_name: "SPACE AGE — Local Business SEO + AI Search (GEO)"
version: "2.0"
last_updated: "2026-05"
description: >
  Production-grade Local SEO + Generative Engine Optimization (GEO) skill for Space Age AI Solutions
  lead generation pipeline. Injects into every cinematic website build targeting local businesses.
  Covers Google local pack rankings AND AI citation visibility across ChatGPT, Perplexity,
  Google AI Overviews, Gemini, and Claude. Based on Google's official May 15, 2026 AI Optimization
  Guide plus Whitespark 2026 Local Search Ranking Factors. Replaces the legacy local-business-seo
  skill. TRIGGER on: any local business site build, "SEO", "rank on Google", "show up in AI",
  "Google Business", "schema", "local citations", "AI search", "GEO", or any lead gen pipeline build.
pipeline_position: "Phase 4 — fires after cinematic-website-builder, before Vercel deploy"
---

# SA-LOCAL-SEO-GEO SKILL
## Space Age AI Solutions — Local Business Search + AI Visibility Layer
### v2.0 | May 2026 | Supersedes local-business-seo v1.0

> In 2026, ranking on Google is half the job.
> The other half: being recommended when someone asks ChatGPT, Perplexity, or Gemini.
> Most local businesses are invisible in AI answers even when they rank well in Google.
> This skill closes both gaps simultaneously.

---

## THE REALITY OF SEARCH IN 2026

```
TRADITIONAL GOOGLE SEARCH         AI SEARCH (GEO)
─────────────────────────────────────────────────────────────
User types query → sees list       User asks question → gets one answer
You compete for position 1-10      You either get cited or you don't
Algorithm = keywords + backlinks   Algorithm = authority + entity clarity
Traffic: high click-through        Traffic: brand mention / zero-click
Optimization: on-page + links      Optimization: content quality + citations
```

**Key stat (2026):**
Over 60% of all search interactions now involve an AI-generated component.
ChatGPT alone drives nearly 88% of all AI referral traffic, with over 810 million daily users. Google AI Overviews now appear in over 25% of all searches.

**The local business gap:**
A dental clinic with strong map pack visibility can be completely absent from ChatGPT answers if its entity information isn't structured for AI extraction — your Google Business Profile can be perfect, your reviews positive, your NAP data correct, and you still won't appear when someone asks AI for a recommendation in your city.

---

## GOOGLE'S OFFICIAL POSITION (MAY 15, 2026)

On May 15, 2026, Google published its first official guide to optimizing for AI Search. The short answer: most GEO hype isn't necessary. What actually matters is the same foundational SEO you already know, plus one core factor that AI makes more important than ever: content only you can write.

### What Google Explicitly Debunked
Four common GEO tactics are now officially dead:
- llms.txt files do nothing for Google AI Overviews
- Content "chunking" for AI extraction isn't required
- Special schema isn't required for AI search visibility (still earns rich results in regular Search)
- Inauthentic mention-building doesn't help — spam systems block what AI features depend on

### What Google Confirmed Actually Works
Three confirmed signals:
- Non-commodity, first-hand experience content is the single biggest visibility lever
- Multimodal content (images and video) gets surfaced in AI responses
- Technical hygiene (indexable, crawlable, semantic HTML) is the floor

---

## THE DUAL OPTIMIZATION FRAMEWORK

Every site this skill touches must satisfy BOTH tracks simultaneously:

```
TRACK 1: LOCAL SEO (Google Map Pack + Organic)
├── NAP consistency
├── Google Business Profile optimization
├── LocalBusiness schema JSON-LD
├── Service area pages
├── Local keyword density
└── Citation building across directories

TRACK 2: GEO (AI Citation Visibility)
├── First-hand experience content
├── Entity clarity across the web
├── Multi-platform citation consistency
├── E-E-A-T signals
├── Conversational FAQ content
└── Multimodal assets (images + video)
```

---

## PHASE 1 — TECHNICAL FOUNDATION (On-Page)

### 1A. Complete LocalBusiness Schema JSON-LD

Every site gets this block injected in `<head>`. No exceptions.
Fill ALL fields — incomplete schema is worse than no schema for AI parsing.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",

  /* IDENTITY — must match EXACTLY across all platforms */
  "name": "{{business_name}}",
  "legalName": "{{legal_business_name}}",
  "description": "{{150-word_first_person_description}}",
  "foundingDate": "{{year}}",

  /* CONTACT — NAP locked */
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{street}}",
    "addressLocality": "{{city}}",
    "addressRegion": "{{state_abbreviation}}",
    "postalCode": "{{zip}}",
    "addressCountry": "US"
  },
  "telephone": "{{+1XXXXXXXXXX}}",
  "email": "{{email}}",
  "url": "{{https://domain.com}}",

  /* LOCATION SIGNALS */
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{lat}}",
    "longitude": "{{lng}}"
  },
  "hasMap": "{{google_maps_url}}",
  "areaServed": [
    {
      "@type": "City",
      "name": "{{primary_city}}",
      "containedInPlace": {"@type": "State", "name": "{{state}}"}
    },
    {
      "@type": "City",
      "name": "{{secondary_city}}"
    }
  ],

  /* BUSINESS DETAILS */
  "priceRange": "{{$-$$$$}}",
  "currenciesAccepted": "USD",
  "paymentAccepted": "Cash, Credit Card, Check",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "08:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": "09:00",
      "closes": "14:00"
    }
  ],

  /* SERVICES — list every service explicitly */
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "{{service_1}}",
          "description": "{{service_1_description}}"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "{{service_2}}",
          "description": "{{service_2_description}}"
        }
      }
    ]
  },

  /* TRUST SIGNALS */
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{4.8}}",
    "reviewCount": "{{47}}",
    "bestRating": "5",
    "worstRating": "1"
  },

  /* SOCIAL + IDENTITY VERIFICATION */
  "sameAs": [
    "{{google_business_profile_url}}",
    "{{yelp_url}}",
    "{{facebook_url}}",
    "{{instagram_url}}",
    "{{linkedin_url}}",
    "{{bing_places_url}}"
  ],

  /* MEDIA */
  "image": [
    "{{hero_image_url}}",
    "{{storefront_image_url}}",
    "{{team_image_url}}"
  ],
  "logo": "{{logo_url}}"
}
</script>
```

### 1B. FAQ Schema (GEO Citation Trigger)

AI systems break complex queries into sub-queries when searching for answers. Make sure you have content that ranks for shorter sub-queries. Think about what fragments of a long question you would search for yourself, and make sure your content addresses each one.

Inject FAQ schema on every page. Questions must be conversational — written the way someone would ask an AI, not typed into a search bar.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does {{service}} cost in {{city}}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{Specific, first-hand answer with real price ranges from your experience working in this market. Include specific variables that affect pricing. Do not write generic copy.}}"
      }
    },
    {
      "@type": "Question",
      "name": "How long does {{service}} take in {{city}}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{Specific timeline from real project experience. Include variables.}}"
      }
    },
    {
      "@type": "Question",
      "name": "What should I look for when hiring a {{business_type}} in {{city}}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{Genuine advice based on industry experience. This is the content AI cites.}}"
      }
    },
    {
      "@type": "Question",
      "name": "Are you licensed and insured in {{state}}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{Direct, specific answer with license numbers if applicable.}}"
      }
    },
    {
      "@type": "Question",
      "name": "Do you serve {{secondary_city}} and surrounding areas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{Specific service area answer with named neighborhoods/cities.}}"
      }
    }
  ]
}
</script>
```

### 1C. Website + BreadcrumbList + Review Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{business_name}}",
  "url": "{{https://domain.com}}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{{https://domain.com}}?s={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

---

## PHASE 2 — NAP CONSISTENCY ENFORCEMENT

**The AI trust mechanism:**
AI search engines treat citations as confirmation signals. When an AI system answers a local query, it evaluates citation consistency across multiple sources to determine which businesses it can safely recommend.

Businesses with 10 accurate, high-authority citations consistently outrank competitors carrying 200 low-quality inconsistent ones. Citation accuracy is now essential for visibility across both traditional Google search and AI-powered discovery tools.

### NAP Format Lock
Define this once. Use it everywhere — website, all directories, all schema:

```
LOCKED NAP FORMAT:
Business Name: [Exactly as registered — no variations]
Address: [Full street + suite/unit if applicable]
City, State ZIP: [Always in this format]
Phone: [(XXX) XXX-XXXX or +1XXXXXXXXXX — pick one, never mix]
Website: [https://domain.com — always with https, no trailing slash]
```

### Priority Citation Platforms (AI Visibility Stack)

**Tier 1 — Direct AI Data Sources (build first):**
| Platform | Why It Matters |
|---|---|
| Google Business Profile | Powers Google AI Overviews + Gemini local answers |
| Bing Places | ChatGPT primarily uses Bing's index — Bing Places is essential for ChatGPT local visibility |
| Apple Maps Connect | Powers Siri + Apple AI |
| Yelp | Perplexity pulls heavily from Yelp data |
| Facebook Business | Cross-platform entity confirmation |

**Tier 2 — Industry Authority (builds AI citation probability):**
| Platform | Best For |
|---|---|
| Angi / HomeAdvisor | Home services |
| Houzz | Interior design, contractors |
| Healthgrades / Zocdoc | Medical/dental |
| Avvo / Justia | Legal |
| TripAdvisor | Hospitality, restaurants |
| BBB | General business trust signal |

**Tier 3 — General Directories:**
Manta · Citysearch · Foursquare · MapQuest · YellowPages · SuperPages

---

## PHASE 3 — FIRST-HAND EXPERIENCE CONTENT (THE GEO LEVER)

A small dental clinic publishing real patient financing questions, recovery timelines, treatment comparisons, pricing explanations, and local insurance insights may become highly quotable in AI healthcare queries. Founder-led content explaining real decisions, specific mistakes, or exact customer problems also performs well. Small businesses can compete by publishing what only they know from lived experience.

### Content That Gets AI Citations vs. Content That Doesn't

```
GETS CITED BY AI:                    DOESN'T GET CITED:
────────────────────────────────────────────────────────────
"In Mesquite TX, most lawn care      "We provide quality lawn care
jobs run $150-300 depending on       services at competitive prices."
lot size and grass type. Here's
what I've seen after 200+ jobs..."

Specific pricing with variables      Vague pricing mentions
Named neighborhoods served           General city claims
"Based on my 8 years..."             No experience signals
Answers to questions clients ask     Keyword-stuffed paragraphs
Before/after project outcomes        Generic service descriptions
Honest pros/cons of different        One-sided marketing copy
  approaches
```

### Content Blueprint Per Service Page

Every service page must include:
```
□ Service definition (plain language, not jargon)
□ What the process looks like step by step
□ Real pricing range with variables that affect it
□ Timeline from start to finish
□ 3 things that can go wrong + how we prevent them
□ Why choose us vs. competitors (specific, not generic)
□ Local factors specific to [city] (weather, regulations, etc.)
□ 5 FAQ entries in conversational question format
□ 1 real project story (before/after, specific outcome)
□ Service area coverage with named cities/neighborhoods
```

---

## PHASE 4 — MULTIMODAL ASSETS

AI Mode's multimodal capabilities mean you should optimize beyond text. Include descriptive alt text for images, create video content with searchable transcripts, develop visual data representations such as charts and infographics, ensure audio content has proper metadata, and structure multimedia assets for discoverability. Diverse content formats increase citation opportunities.

### Image Requirements
```html
<!-- Every image on site must have: -->
<img
  src="{{descriptive-filename-not-IMG_1234.jpg}}"
  alt="{{Joe's Plumbing technician installing water heater in Mesquite TX home}}"
  title="{{Water Heater Installation — Mesquite TX}}"
  width="{{width}}"
  height="{{height}}"
  loading="lazy"
/>

<!-- Filename rules: -->
<!-- ✅ mesquite-tx-plumber-water-heater-install.jpg -->
<!-- ❌ IMG_20260519_143022.jpg -->
<!-- ❌ image1.jpg -->
```

### Video Integration (GEO Multiplier)
A strong page should no longer be treated as copy alone. It should be treated as an information asset. Ask what the user would benefit from seeing, not just reading.

```html
<!-- Embed any video with full schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "{{How We Install a Water Heater in Mesquite TX}}",
  "description": "{{First-person walkthrough of our water heater installation process.}}",
  "thumbnailUrl": "{{thumbnail_url}}",
  "uploadDate": "{{2026-05-20}}",
  "duration": "PT{{4}}M{{32}}S",
  "contentUrl": "{{video_url}}",
  "embedUrl": "{{youtube_embed_url}}",
  "publisher": {
    "@type": "Organization",
    "name": "{{business_name}}",
    "logo": {"@type": "ImageObject", "url": "{{logo_url}}"}
  }
}
</script>
```

---

## PHASE 5 — REVIEW STRATEGY (AI Trust Multiplier)

Businesses with strong review profiles have approximately 3x higher citation probability on ChatGPT. AI engines evaluate review volume, recency, average rating, and sentiment.

### Review Platform Priority
```
1. Google Business Profile   ← Google AI Overviews primary source
2. Yelp                      ← Perplexity primary source
3. Facebook                  ← Entity confirmation across AI systems
4. Industry-specific         ← Healthgrades / Angi / Houzz etc.
5. Bing                      ← ChatGPT primary source
```

### Review Response Injection (Content Signal)
Every review response should include:
- Business name
- Service performed
- Location (city)
- Thank you + specific mention of the job

This creates additional indexed content that reinforces entity signals.

---

## PHASE 6 — GOOGLE BUSINESS PROFILE (GBP) OPTIMIZATION

Complete business information, accurate categories, Q&A section content, review quality and quantity, regular posts, photos, and consistent NAP data all contribute to GBP performance for AI visibility. GBP is essential for Google AI but requires multi-platform presence for all AI systems.

### GBP Checklist
```
□ Business name exactly matches website + schema
□ Primary category: most specific available
□ Secondary categories: 2-5 relevant additional
□ Description: 750 chars, first-person, service + city + differentiator
□ Hours: complete + holiday hours set
□ Phone: matches NAP exactly
□ Website URL: exact canonical URL
□ Service area: add specific cities/zip codes (not just radius)
□ Services: list every service with description
□ Products: add if applicable with prices
□ Attributes: select all applicable (women-owned, veteran-owned, etc.)
□ Photos: minimum 15 — exterior, interior, team, work, before/after
□ Q&A section: pre-populate with 5+ common questions + owner answers
□ Posts: weekly cadence (offer, update, event rotating)
□ Messaging: enable + set auto-reply
```

---

## PHASE 7 — TECHNICAL SEO CHECKLIST

### On-Page Technical Requirements
```
□ Page title: [Primary Keyword] in [City] | [Business Name] (60 chars max)
□ Meta description: First-person, includes service + city + CTA (155 chars)
□ H1: One per page, includes primary keyword + city
□ H2-H4: Service sections, FAQ headers, process steps
□ Canonical tag: <link rel="canonical" href="{{page_url}}">
□ Robots meta: <meta name="robots" content="index, follow">
□ Hreflang: if multiple service area pages
□ XML sitemap: generated + submitted to Google Search Console
□ robots.txt: allows all crawl bots including GPTBot, ClaudeBot, PerplexityBot
□ HTTPS: required
□ Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms
□ Mobile responsive: tested on real devices
□ Page speed: Lighthouse > 90
```

### robots.txt — Allow AI Crawlers
```
# robots.txt
User-agent: *
Allow: /

# Explicitly allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: bingbot
Allow: /

Sitemap: https://{{domain.com}}/sitemap.xml
```

### Site Speed Enforcement
```html
<!-- Preconnect for CDN fonts (Fontsource only) -->
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>

<!-- Resource hints -->
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">

<!-- Critical CSS inline, non-critical deferred -->
<!-- Images: lazy load below fold, eager load hero -->
<img src="hero.jpg" loading="eager" fetchpriority="high" ...>
<img src="below-fold.jpg" loading="lazy" ...>
```

---

## PHASE 8 — ENTITY AUTHORITY BUILDING

**Why this matters for GEO:**
GEO, AEO, and AI Search Optimization all refer to optimizing your online presence to improve how your brand appears in AI-generated responses. AI systems evaluate source credibility when deciding which pages to cite.

### Entity Signals to Build
```
□ Wikipedia: Create page if eligible (established businesses 5+ years)
□ Wikidata: Entity entry with verified facts
□ Google Knowledge Panel: Claim via Google Search Console
□ Industry association listings: Chamber of Commerce, trade orgs
□ Press coverage: local news, industry publications
□ Podcast appearances: business owner expertise signals
□ Guest posts: local blogs, city publications
□ BBB accreditation
□ LinkedIn company page (fully complete)
□ GitHub (if tech business)
```

---

## SCHEMA INJECTION CODE BLOCK (COMPLETE TEMPLATE)

Drop this into every build. Replace all `{{placeholders}}`.

```html
<!-- ============================
     SPACE AGE SEO/GEO INJECTION
     Local Business + AI Visibility
     v2.0 May 2026
     ============================ -->

<!-- PRIMARY BUSINESS SCHEMA -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "{{BUSINESS_NAME}}",
  "description": "{{FIRST_PERSON_DESCRIPTION_150_WORDS}}",
  "url": "{{HTTPS_URL}}",
  "telephone": "{{PHONE}}",
  "email": "{{EMAIL}}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET}}",
    "addressLocality": "{{CITY}}",
    "addressRegion": "{{STATE}}",
    "postalCode": "{{ZIP}}",
    "addressCountry": "US"
  },
  "geo": {"@type": "GeoCoordinates", "latitude": "{{LAT}}", "longitude": "{{LNG}}"},
  "areaServed": [{"@type": "City", "name": "{{PRIMARY_CITY}}"}],
  "priceRange": "{{PRICE_RANGE}}",
  "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "18:00"}],
  "aggregateRating": {"@type": "AggregateRating", "ratingValue": "{{RATING}}", "reviewCount": "{{COUNT}}"},
  "sameAs": ["{{GBP_URL}}", "{{YELP_URL}}", "{{FACEBOOK_URL}}", "{{BING_URL}}"],
  "image": ["{{HERO_IMAGE_URL}}"],
  "logo": "{{LOGO_URL}}"
}
</script>

<!-- FAQ SCHEMA -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "{{Q1_CONVERSATIONAL}}", "acceptedAnswer": {"@type": "Answer", "text": "{{A1_FIRST_PERSON_SPECIFIC}}"}},
    {"@type": "Question", "name": "{{Q2_CONVERSATIONAL}}", "acceptedAnswer": {"@type": "Answer", "text": "{{A2_FIRST_PERSON_SPECIFIC}}"}},
    {"@type": "Question", "name": "{{Q3_CONVERSATIONAL}}", "acceptedAnswer": {"@type": "Answer", "text": "{{A3_FIRST_PERSON_SPECIFIC}}"}},
    {"@type": "Question", "name": "{{Q4_CONVERSATIONAL}}", "acceptedAnswer": {"@type": "Answer", "text": "{{A4_FIRST_PERSON_SPECIFIC}}"}},
    {"@type": "Question", "name": "{{Q5_CONVERSATIONAL}}", "acceptedAnswer": {"@type": "Answer", "text": "{{A5_FIRST_PERSON_SPECIFIC}}"}}
  ]
}
</script>

<!-- WEBSITE SCHEMA -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{BUSINESS_NAME}}",
  "url": "{{HTTPS_URL}}"
}
</script>

<!-- META TAGS -->
<title>{{SERVICE}} in {{CITY}}, {{STATE}} | {{BUSINESS_NAME}}</title>
<meta name="description" content="{{FIRST_PERSON_155_CHAR_WITH_CTA}}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{{PAGE_URL}}">

<!-- OG TAGS (social + AI context) -->
<meta property="og:title" content="{{BUSINESS_NAME}} — {{SERVICE}} in {{CITY}}">
<meta property="og:description" content="{{DESCRIPTION}}">
<meta property="og:image" content="{{OG_IMAGE_URL}}">
<meta property="og:url" content="{{PAGE_URL}}">
<meta property="og:type" content="business.business">
<meta property="og:locale" content="en_US">
```

---

## AI CITATION MONITORING

How to check if this is working:

```
MANUAL TESTING (do monthly):
1. Open ChatGPT → Ask: "Best [service] in [city]"
2. Open Perplexity → Same query
3. Open Google AI Overviews → Same query
4. Open Gemini → Same query

Document: Does the business appear? What is the citation source?

TARGET OUTCOME:
□ Appears in Google Map Pack (top 3)
□ Cited in Google AI Overviews
□ Listed in ChatGPT recommendations
□ Referenced by Perplexity with citation link
```

---

## PIPELINE INTEGRATION

### Inputs This Skill Receives
```yaml
from_lead_to_brief:
  business_name: required
  business_type: required
  city: required
  state: required
  phone: required
  address: if available
  services: list of 3-10 services
  website_url: new site URL

from_build_brief:
  target_keywords: list
  service_area: primary + secondary cities
  existing_reviews: count + average rating
```

### Outputs This Skill Produces
```yaml
seo_geo_package:
  schema_injection_block: complete HTML/JSON-LD block
  meta_tags: title + description + canonical + OG
  robots_txt: complete file content
  sitemap_structure: page hierarchy
  content_brief: first-hand content requirements per page
  citation_checklist: prioritized platform list
  gbp_checklist: complete optimization list
  monitoring_schedule: monthly check cadence
```

---

## NEVER DO

```
❌ NEVER use generic meta descriptions ("We provide quality services...")
❌ NEVER leave alt text empty or "image1"
❌ NEVER block AI crawlers in robots.txt
❌ NEVER use inconsistent NAP formats across platforms
❌ NEVER write FAQ answers in third person ("The company provides...")
❌ NEVER use llms.txt — Google's official guide confirms it does nothing
❌ NEVER "chunk" content artificially for AI — not required per Google 2026 guide
❌ NEVER use generic schema without filling ALL placeholder fields
❌ NEVER launch a site without at least Tier 1 citations submitted
❌ NEVER duplicate page titles or meta descriptions across pages
```

---

## SKILL CONNECTIONS

```
UPSTREAM:
  lead-to-brief → sends business data + service area
  cinematic-website-builder → sends completed HTML for injection

DOWNSTREAM:
  vercel deploy → fires after this skill completes injection

PARALLEL:
  sa-email-architect → email campaign targeting same service area
  vapi-orchestrator → voice agent uses same FAQ content
  outreach-copywriter → shares first-hand content for email copy
```

---

*SA-Local-SEO-GEO Skill v2.0 — Space Age AI Solutions*
*Sources: Google AI Optimization Guide May 15 2026 (official), Whitespark 2026 Local Search*
*Ranking Factors, eSEOspace GEO Guide 2026, LLMrefs GEO 2026, AiBizit Local AI Search,*
*Logik Digital AI SEO for Local Business, Wellows Local Citations AI Search,*
*stackmatix.com Structured Data AI Search, ALM Corp AI Search Optimization Guide*
*Built: May 2026*
