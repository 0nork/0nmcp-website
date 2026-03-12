/**
 * web0n Site Builder — Full Static Website Generator
 *
 * Takes a project brief and generates 5 complete, professional HTML pages:
 * Home, Services, Contact, Booking, Pricing
 *
 * Output: Record<string, string> — page name → full HTML document
 */

// ==================== TYPES ====================

export interface SiteConfig {
  businessName: string
  tagline?: string
  businessType?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  brandColors: { primary: string; secondary: string; accent: string }
  logoUrl?: string
  services: Array<string | { name: string; description?: string }>
  googlePlaceId?: string
  googleData?: {
    rating?: number
    reviews?: number
    openingHours?: string[]
    photos?: string[]
  }
  specialRequests?: string
  pages: string[]
}

// ==================== COLOR UTILS ====================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16) || 0,
    g: parseInt(h.substring(2, 4), 16) || 0,
    b: parseInt(h.substring(4, 6), 16) || 0,
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount
  )
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}

function isLight(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

function getServiceName(s: string | { name: string; description?: string }): string {
  return typeof s === 'string' ? s : s.name
}

function getServiceDesc(s: string | { name: string; description?: string }): string | undefined {
  return typeof s === 'string' ? undefined : s.description
}

// ==================== CSS GENERATOR ====================

function generateCSS(c: SiteConfig): string {
  const primary = c.brandColors?.primary || '#2563eb'
  const secondary = c.brandColors?.secondary || '#1e40af'
  const accent = c.brandColors?.accent || '#3b82f6'
  const primaryText = isLight(primary) ? '#111827' : '#ffffff'
  const accentText = isLight(accent) ? '#111827' : '#ffffff'

  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --primary:${primary};--primary-light:${lighten(primary, 0.85)};--primary-dark:${darken(primary, 0.2)};
  --secondary:${secondary};--accent:${accent};--accent-light:${lighten(accent, 0.9)};
  --primary-text:${primaryText};--accent-text:${accentText};
  --text:#111827;--text-secondary:#4b5563;--text-muted:#9ca3af;
  --bg:#ffffff;--bg-alt:#f9fafb;--bg-card:#ffffff;
  --border:#e5e7eb;--shadow:0 1px 3px rgba(0,0,0,0.1);--shadow-lg:0 10px 25px rgba(0,0,0,0.1);
  --radius:12px;--radius-sm:8px;
  --font:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  --font-display:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  --max-w:1200px;
}
html{scroll-behavior:smooth}
body{font-family:var(--font);color:var(--text);background:var(--bg);line-height:1.6;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
a{color:var(--primary);text-decoration:none;transition:color 0.2s}
a:hover{color:var(--primary-dark)}

/* NAV */
.nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.nav-inner{max-width:var(--max-w);margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;height:64px}
.nav-logo{font-size:1.35rem;font-weight:700;color:var(--primary);text-decoration:none;font-family:var(--font-display)}
.nav-links{display:flex;gap:0.25rem;list-style:none}
.nav-links a{padding:0.5rem 0.875rem;border-radius:var(--radius-sm);color:var(--text-secondary);font-size:0.9rem;font-weight:500;transition:all 0.2s}
.nav-links a:hover,.nav-links a.active{background:var(--primary-light);color:var(--primary)}
.nav-cta{padding:0.5rem 1.25rem;background:var(--primary);color:var(--primary-text);border-radius:var(--radius-sm);font-weight:600;font-size:0.875rem;transition:all 0.2s;text-decoration:none}
.nav-cta:hover{background:var(--primary-dark);color:var(--primary-text);transform:translateY(-1px);box-shadow:var(--shadow)}
.nav-toggle{display:none;background:none;border:none;cursor:pointer;padding:0.5rem}
.nav-toggle span{display:block;width:24px;height:2px;background:var(--text);margin:5px 0;transition:0.3s}

/* HERO */
.hero{padding:6rem 1.5rem 5rem;background:linear-gradient(135deg,var(--primary),var(--secondary));color:var(--primary-text);text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 50%,rgba(255,255,255,0.1),transparent 60%)}
.hero-inner{max-width:800px;margin:0 auto;position:relative;z-index:1}
.hero h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:800;line-height:1.15;margin-bottom:1rem;font-family:var(--font-display);letter-spacing:-0.02em}
.hero p{font-size:clamp(1rem,2vw,1.2rem);opacity:0.9;margin-bottom:2rem;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.7}
.hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.75rem;border-radius:var(--radius-sm);font-weight:600;font-size:0.95rem;cursor:pointer;transition:all 0.2s;border:none;text-decoration:none;font-family:var(--font)}
.btn-primary{background:var(--primary);color:var(--primary-text)}
.btn-primary:hover{background:var(--primary-dark);color:var(--primary-text);transform:translateY(-1px);box-shadow:var(--shadow-lg)}
.btn-outline{background:transparent;border:2px solid var(--primary-text);color:var(--primary-text)}
.btn-outline:hover{background:var(--primary-text);color:var(--primary)}
.btn-accent{background:var(--accent);color:var(--accent-text)}
.btn-accent:hover{background:${darken(accent, 0.15)};color:var(--accent-text);transform:translateY(-1px)}
.btn-white{background:#fff;color:var(--primary)}
.btn-white:hover{background:var(--primary-light);transform:translateY(-1px);box-shadow:var(--shadow-lg)}

/* SECTIONS */
.section{padding:5rem 1.5rem}
.section-alt{background:var(--bg-alt)}
.section-inner{max-width:var(--max-w);margin:0 auto}
.section-header{text-align:center;margin-bottom:3rem}
.section-header h2{font-size:clamp(1.5rem,3.5vw,2.25rem);font-weight:700;margin-bottom:0.75rem;font-family:var(--font-display);color:var(--text);letter-spacing:-0.01em}
.section-header p{color:var(--text-secondary);font-size:1.05rem;max-width:600px;margin:0 auto;line-height:1.7}

/* CARDS */
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:2rem;transition:all 0.3s}
.card:hover{box-shadow:var(--shadow-lg);transform:translateY(-4px);border-color:var(--primary)}
.card-icon{width:48px;height:48px;border-radius:var(--radius-sm);background:var(--primary-light);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;font-size:1.5rem}
.card h3{font-size:1.1rem;font-weight:600;margin-bottom:0.5rem;font-family:var(--font-display)}
.card p{color:var(--text-secondary);font-size:0.925rem;line-height:1.6}

/* STEPS */
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem;counter-reset:step}
.step{text-align:center;padding:2rem 1.5rem;position:relative}
.step::before{counter-increment:step;content:counter(step);width:48px;height:48px;border-radius:50%;background:var(--primary);color:var(--primary-text);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.2rem;margin:0 auto 1rem}
.step h3{font-size:1.05rem;font-weight:600;margin-bottom:0.5rem}
.step p{color:var(--text-secondary);font-size:0.9rem;line-height:1.6}

/* CONTACT */
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
.contact-info{display:flex;flex-direction:column;gap:1.5rem}
.contact-item{display:flex;gap:1rem;align-items:flex-start}
.contact-item-icon{width:44px;height:44px;border-radius:var(--radius-sm);background:var(--primary-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.2rem}
.contact-item h4{font-size:0.95rem;font-weight:600;margin-bottom:0.15rem}
.contact-item p{color:var(--text-secondary);font-size:0.9rem}
.contact-form{display:flex;flex-direction:column;gap:1rem}
.form-group{display:flex;flex-direction:column;gap:0.35rem}
.form-group label{font-size:0.85rem;font-weight:500;color:var(--text-secondary)}
.form-group input,.form-group textarea,.form-group select{padding:0.7rem 0.875rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:0.925rem;font-family:var(--font);transition:border-color 0.2s;background:var(--bg);color:var(--text)}
.form-group input:focus,.form-group textarea:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px ${lighten(primary, 0.85)}}
.form-group textarea{min-height:120px;resize:vertical}

/* MAP */
.map-container{border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);margin-top:2rem}
.map-container iframe{width:100%;height:350px;border:0}

/* HOURS */
.hours-list{display:flex;flex-direction:column;gap:0.5rem}
.hours-item{display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);font-size:0.9rem}
.hours-item:last-child{border-bottom:none}

/* PRICING */
.pricing-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
.pricing-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:2.5rem 2rem;text-align:center;transition:all 0.3s}
.pricing-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-4px)}
.pricing-card.featured{border-color:var(--primary);position:relative}
.pricing-card.featured::before{content:'Popular';position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--primary);color:var(--primary-text);padding:0.25rem 1rem;border-radius:999px;font-size:0.75rem;font-weight:600}
.pricing-card h3{font-size:1.15rem;font-weight:600;margin-bottom:0.5rem}
.pricing-card .price{font-size:2rem;font-weight:800;color:var(--primary);margin:1rem 0}
.pricing-card .price span{font-size:0.9rem;font-weight:400;color:var(--text-muted)}
.pricing-card ul{list-style:none;text-align:left;margin:1.5rem 0;display:flex;flex-direction:column;gap:0.6rem}
.pricing-card li{font-size:0.9rem;color:var(--text-secondary);padding-left:1.5rem;position:relative}
.pricing-card li::before{content:'\\2713';position:absolute;left:0;color:var(--primary);font-weight:700}

/* CTA BANNER */
.cta-banner{padding:4rem 1.5rem;background:linear-gradient(135deg,var(--primary),var(--secondary));color:var(--primary-text);text-align:center}
.cta-banner h2{font-size:clamp(1.5rem,3vw,2rem);font-weight:700;margin-bottom:0.75rem;font-family:var(--font-display)}
.cta-banner p{opacity:0.9;margin-bottom:2rem;font-size:1.05rem}

/* FOOTER */
.footer{background:#111827;color:#d1d5db;padding:3rem 1.5rem 2rem}
.footer-inner{max-width:var(--max-w);margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:2rem}
.footer h4{color:#fff;font-size:0.95rem;font-weight:600;margin-bottom:1rem}
.footer p,.footer a{font-size:0.875rem;color:#9ca3af;line-height:1.7}
.footer a:hover{color:#fff}
.footer-links{list-style:none;display:flex;flex-direction:column;gap:0.5rem}
.footer-bottom{max-width:var(--max-w);margin:2rem auto 0;padding-top:1.5rem;border-top:1px solid #374151;text-align:center;font-size:0.8rem;color:#6b7280}

/* BADGE */
.badge{display:inline-flex;align-items:center;gap:0.35rem;padding:0.3rem 0.75rem;border-radius:999px;font-size:0.8rem;font-weight:500;background:var(--primary-light);color:var(--primary)}
.badge-accent{background:var(--accent-light);color:var(--accent)}

/* RATING */
.rating{display:flex;align-items:center;gap:0.5rem;margin:1rem 0}
.stars{color:#f59e0b;font-size:1.1rem;letter-spacing:2px}
.rating-text{font-size:0.9rem;color:var(--text-secondary)}

/* RESPONSIVE */
@media(max-width:768px){
  .nav-links{display:none;position:absolute;top:64px;left:0;right:0;background:#fff;border-bottom:1px solid var(--border);flex-direction:column;padding:1rem;box-shadow:var(--shadow-lg)}
  .nav-links.open{display:flex}
  .nav-toggle{display:block}
  .nav-cta{display:none}
  .hero{padding:4rem 1.5rem 3.5rem}
  .contact-grid{grid-template-columns:1fr}
  .footer-inner{grid-template-columns:1fr}
  .card-grid{grid-template-columns:1fr}
  .pricing-grid{grid-template-columns:1fr}
}
@media(max-width:480px){
  .section{padding:3rem 1rem}
  .hero{padding:3rem 1rem 2.5rem}
  .hero-btns{flex-direction:column;align-items:center}
}
`
}

// ==================== LAYOUT WRAPPER ====================

function wrapLayout(c: SiteConfig, pageTitle: string, content: string, css: string): string {
  const title = pageTitle === 'Home'
    ? `${c.businessName}${c.tagline ? ' — ' + c.tagline : ''}`
    : `${pageTitle} | ${c.businessName}`

  const fullAddress = [c.address, c.city, c.state, c.zip].filter(Boolean).join(', ')
  const description = c.tagline || `${c.businessName} — Professional ${c.businessType || 'business'} services.`

  const navLinks = [
    { name: 'Home', href: 'index.html' },
    { name: 'Services', href: 'services.html' },
    { name: 'Pricing', href: 'pricing.html' },
    { name: 'Booking', href: 'booking.html' },
    { name: 'Contact', href: 'contact.html' },
  ].filter(link => {
    const slug = link.name.toLowerCase()
    return c.pages.includes(slug) || slug === 'home'
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${css.replace(/\n\s*/g, '')}</style>
<style>body{font-family:'Inter',var(--font)}</style>
</head>
<body>

<!-- Navigation -->
<nav class="nav">
  <div class="nav-inner">
    <a href="index.html" class="nav-logo">${esc(c.businessName)}</a>
    <button class="nav-toggle" onclick="document.querySelector('.nav-links').classList.toggle('open')" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links">
      ${navLinks.map(l => `<li><a href="${l.href}"${l.name === pageTitle ? ' class="active"' : ''}>${l.name}</a></li>`).join('\n      ')}
    </ul>
    <a href="contact.html" class="nav-cta">Get in Touch</a>
  </div>
</nav>

${content}

<!-- Footer -->
<footer class="footer">
  <div class="footer-inner">
    <div>
      <h4>${esc(c.businessName)}</h4>
      <p>${esc(c.tagline || description)}</p>
      ${fullAddress ? `<p style="margin-top:0.5rem">${esc(fullAddress)}</p>` : ''}
    </div>
    <div>
      <h4>Quick Links</h4>
      <ul class="footer-links">
        ${navLinks.map(l => `<li><a href="${l.href}">${l.name}</a></li>`).join('\n        ')}
      </ul>
    </div>
    <div>
      <h4>Contact</h4>
      <ul class="footer-links">
        ${c.phone ? `<li><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></li>` : ''}
        ${c.email ? `<li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ''}
        ${fullAddress ? `<li>${esc(fullAddress)}</li>` : ''}
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    &copy; ${new Date().getFullYear()} ${esc(c.businessName)}. All rights reserved.
  </div>
</footer>

</body>
</html>`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ==================== PAGE GENERATORS ====================

function generateHomePage(c: SiteConfig): string {
  const services = (c.services || []).slice(0, 6)
  const hasRating = c.googleData?.rating && c.googleData.rating > 0
  const typeLabel = c.businessType || 'your trusted local business'

  return `
<!-- Hero -->
<section class="hero">
  <div class="hero-inner">
    ${c.logoUrl ? `<img src="${esc(c.logoUrl)}" alt="${esc(c.businessName)} logo" style="height:64px;margin:0 auto 1.5rem;border-radius:8px">` : ''}
    <h1>${esc(c.businessName)}</h1>
    <p>${esc(c.tagline || `Welcome to ${c.businessName} — ${typeLabel} dedicated to quality service and exceptional results.`)}</p>
    ${hasRating ? `<div class="rating" style="justify-content:center"><span class="stars">${'&#9733;'.repeat(Math.round(c.googleData!.rating!))}</span><span class="rating-text">${c.googleData!.rating} stars${c.googleData?.reviews ? ` (${c.googleData.reviews} reviews)` : ''}</span></div>` : ''}
    <div class="hero-btns">
      <a href="booking.html" class="btn btn-white">Book Now</a>
      <a href="services.html" class="btn btn-outline">Our Services</a>
    </div>
  </div>
</section>

<!-- About -->
<section class="section">
  <div class="section-inner">
    <div class="section-header">
      <h2>Why Choose ${esc(c.businessName)}</h2>
      <p>We're committed to delivering outstanding ${esc(typeLabel)} services to our community.</p>
    </div>
    <div class="steps">
      <div class="step">
        <h3>Quality Service</h3>
        <p>Every interaction is handled with care and attention to detail, ensuring you get the best experience possible.</p>
      </div>
      <div class="step">
        <h3>Trusted Experts</h3>
        <p>Our experienced team brings expertise and dedication to every project, every time.</p>
      </div>
      <div class="step">
        <h3>Customer First</h3>
        <p>Your satisfaction is our priority. We listen, adapt, and deliver results that exceed expectations.</p>
      </div>
    </div>
  </div>
</section>

${services.length > 0 ? `
<!-- Featured Services -->
<section class="section section-alt">
  <div class="section-inner">
    <div class="section-header">
      <h2>What We Offer</h2>
      <p>Explore our range of professional services designed to meet your needs.</p>
    </div>
    <div class="card-grid">
      ${services.map((s, i) => {
        const name = getServiceName(s)
        const desc = getServiceDesc(s)
        const icons = ['&#9733;', '&#9830;', '&#9829;', '&#9824;', '&#10004;', '&#9827;']
        return `<div class="card">
        <div class="card-icon">${icons[i % icons.length]}</div>
        <h3>${esc(name)}</h3>
        <p>${esc(desc || `Professional ${name.toLowerCase()} services tailored to your specific requirements.`)}</p>
      </div>`
      }).join('\n      ')}
    </div>
    <div style="text-align:center;margin-top:2.5rem">
      <a href="services.html" class="btn btn-primary">View All Services</a>
    </div>
  </div>
</section>
` : ''}

<!-- CTA -->
<section class="cta-banner">
  <h2>Ready to Get Started?</h2>
  <p>Contact us today to learn how we can help you.</p>
  <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
    <a href="booking.html" class="btn btn-white">Book an Appointment</a>
    ${c.phone ? `<a href="tel:${esc(c.phone)}" class="btn btn-outline">Call ${esc(c.phone)}</a>` : ''}
  </div>
</section>
`
}

function generateServicesPage(c: SiteConfig): string {
  const services = c.services || []

  return `
<!-- Hero -->
<section class="hero" style="padding:4rem 1.5rem 3.5rem">
  <div class="hero-inner">
    <h1>Our Services</h1>
    <p>Discover the full range of professional services we offer at ${esc(c.businessName)}.</p>
  </div>
</section>

<section class="section">
  <div class="section-inner">
    ${services.length > 0 ? `
    <div class="card-grid">
      ${services.map((s, i) => {
        const name = getServiceName(s)
        const desc = getServiceDesc(s)
        const icons = ['&#9733;', '&#9830;', '&#9829;', '&#9824;', '&#10004;', '&#9827;', '&#10010;', '&#9752;']
        return `<div class="card">
        <div class="card-icon">${icons[i % icons.length]}</div>
        <h3>${esc(name)}</h3>
        <p>${esc(desc || `Our ${name.toLowerCase()} service is designed to deliver exceptional results. Contact us to learn more about how we can help.`)}</p>
        <a href="contact.html" style="display:inline-block;margin-top:1rem;font-size:0.875rem;font-weight:600;color:var(--primary)">Learn more &rarr;</a>
      </div>`
      }).join('\n      ')}
    </div>
    ` : `
    <div style="text-align:center;padding:3rem">
      <h3>Services coming soon</h3>
      <p style="color:var(--text-secondary)">Contact us to learn about our current offerings.</p>
    </div>
    `}
  </div>
</section>

<section class="cta-banner">
  <h2>Need Something Specific?</h2>
  <p>We'd love to discuss how our services can be tailored to your needs.</p>
  <a href="contact.html" class="btn btn-white">Contact Us</a>
</section>
`
}

function generateContactPage(c: SiteConfig): string {
  const fullAddress = [c.address, c.city, c.state, c.zip].filter(Boolean).join(', ')
  const mapQuery = c.googlePlaceId
    ? `place_id:${c.googlePlaceId}`
    : encodeURIComponent(fullAddress || c.businessName)

  return `
<section class="hero" style="padding:4rem 1.5rem 3.5rem">
  <div class="hero-inner">
    <h1>Contact Us</h1>
    <p>We'd love to hear from you. Reach out anytime.</p>
  </div>
</section>

<section class="section">
  <div class="section-inner">
    <div class="contact-grid">
      <div class="contact-info">
        ${c.phone ? `
        <div class="contact-item">
          <div class="contact-item-icon">&#9742;</div>
          <div>
            <h4>Phone</h4>
            <p><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></p>
          </div>
        </div>` : ''}

        ${c.email ? `
        <div class="contact-item">
          <div class="contact-item-icon">&#9993;</div>
          <div>
            <h4>Email</h4>
            <p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
          </div>
        </div>` : ''}

        ${fullAddress ? `
        <div class="contact-item">
          <div class="contact-item-icon">&#9873;</div>
          <div>
            <h4>Address</h4>
            <p>${esc(fullAddress)}</p>
          </div>
        </div>` : ''}

        ${c.googleData?.openingHours ? `
        <div style="margin-top:1rem">
          <h4 style="font-size:0.95rem;font-weight:600;margin-bottom:0.75rem">Business Hours</h4>
          <div class="hours-list">
            ${c.googleData.openingHours.map(h => {
              const [day, ...times] = h.split(': ')
              return `<div class="hours-item"><span style="font-weight:500">${esc(day || h)}</span><span>${esc(times.join(': ') || '')}</span></div>`
            }).join('\n            ')}
          </div>
        </div>` : ''}
      </div>

      <form class="contact-form" onsubmit="event.preventDefault();alert('Thank you! We\\'ll be in touch soon.')">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required placeholder="Your name">
          </div>
          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone" placeholder="Your phone">
          </div>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label for="subject">Subject</label>
          <input type="text" id="subject" name="subject" placeholder="How can we help?">
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" required placeholder="Tell us about your needs..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">Send Message</button>
      </form>
    </div>

    ${fullAddress || c.googlePlaceId ? `
    <div class="map-container">
      <iframe src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapQuery}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>` : ''}
  </div>
</section>
`
}

function generateBookingPage(c: SiteConfig): string {
  const typeLabel = c.businessType || 'service'

  return `
<section class="hero" style="padding:4rem 1.5rem 3.5rem">
  <div class="hero-inner">
    <h1>Book an Appointment</h1>
    <p>Schedule your next ${esc(typeLabel)} appointment with ${esc(c.businessName)}.</p>
  </div>
</section>

<section class="section">
  <div class="section-inner" style="max-width:700px">
    <div style="text-align:center;margin-bottom:3rem">
      <div style="width:80px;height:80px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:2rem">&#128197;</div>
      <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:0.75rem">Ready to Book?</h2>
      <p style="color:var(--text-secondary);max-width:500px;margin:0 auto">Choose the most convenient way to schedule your appointment with us.</p>
    </div>

    <div class="card-grid" style="grid-template-columns:1fr 1fr">
      ${c.phone ? `
      <div class="card" style="text-align:center">
        <div class="card-icon" style="margin:0 auto 1rem;font-size:1.8rem;width:56px;height:56px">&#9742;</div>
        <h3>Call Us</h3>
        <p>Speak directly with our team to find the perfect time.</p>
        <a href="tel:${esc(c.phone)}" class="btn btn-primary" style="margin-top:1rem;width:100%;justify-content:center">${esc(c.phone)}</a>
      </div>` : ''}

      <div class="card" style="text-align:center">
        <div class="card-icon" style="margin:0 auto 1rem;font-size:1.8rem;width:56px;height:56px">&#9993;</div>
        <h3>Email Us</h3>
        <p>Send us a message and we'll get back to you promptly.</p>
        <a href="${c.email ? `mailto:${esc(c.email)}?subject=Booking Request` : 'contact.html'}" class="btn btn-accent" style="margin-top:1rem;width:100%;justify-content:center">${c.email ? 'Send Email' : 'Contact Form'}</a>
      </div>
    </div>

    ${c.googleData?.openingHours ? `
    <div style="margin-top:3rem">
      <h3 style="text-align:center;font-size:1.1rem;font-weight:600;margin-bottom:1.5rem">Available Hours</h3>
      <div class="card">
        <div class="hours-list">
          ${c.googleData.openingHours.map(h => {
            const [day, ...times] = h.split(': ')
            return `<div class="hours-item"><span style="font-weight:500">${esc(day || h)}</span><span>${esc(times.join(': ') || '')}</span></div>`
          }).join('\n          ')}
        </div>
      </div>
    </div>` : ''}

    <div style="text-align:center;margin-top:2.5rem;padding:2rem;background:var(--bg-alt);border-radius:var(--radius)">
      <p style="color:var(--text-secondary);font-size:0.95rem">Need to reschedule or cancel? Contact us at least 24 hours in advance and we'll be happy to accommodate.</p>
    </div>
  </div>
</section>
`
}

function generatePricingPage(c: SiteConfig): string {
  const services = c.services || []
  // Group services into tiers for display
  const tier1 = services.slice(0, Math.ceil(services.length / 3))
  const tier2 = services.slice(Math.ceil(services.length / 3), Math.ceil(services.length * 2 / 3))
  const tier3 = services.slice(Math.ceil(services.length * 2 / 3))

  return `
<section class="hero" style="padding:4rem 1.5rem 3.5rem">
  <div class="hero-inner">
    <h1>Pricing</h1>
    <p>Transparent, competitive pricing for all our services.</p>
  </div>
</section>

<section class="section">
  <div class="section-inner">
    <div class="section-header">
      <h2>Our Services & Pricing</h2>
      <p>Contact us for a personalized quote tailored to your specific needs.</p>
    </div>

    ${services.length > 2 ? `
    <div class="pricing-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="pricing-card">
        <h3>Essential</h3>
        <div class="price">Contact Us</div>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem">Perfect for getting started</p>
        <ul>
          ${tier1.map(s => `<li>${esc(getServiceName(s))}</li>`).join('\n          ')}
        </ul>
        <a href="contact.html" class="btn btn-accent" style="width:100%;justify-content:center;margin-top:auto">Get a Quote</a>
      </div>
      <div class="pricing-card featured">
        <h3>Professional</h3>
        <div class="price">Contact Us</div>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem">Our most popular option</p>
        <ul>
          ${tier1.concat(tier2).map(s => `<li>${esc(getServiceName(s))}</li>`).join('\n          ')}
        </ul>
        <a href="contact.html" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:auto">Get a Quote</a>
      </div>
      <div class="pricing-card">
        <h3>Complete</h3>
        <div class="price">Contact Us</div>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem">Everything we offer</p>
        <ul>
          ${services.map(s => `<li>${esc(getServiceName(s))}</li>`).join('\n          ')}
        </ul>
        <a href="contact.html" class="btn btn-accent" style="width:100%;justify-content:center;margin-top:auto">Get a Quote</a>
      </div>
    </div>
    ` : `
    <div class="card-grid" style="max-width:600px;margin:0 auto">
      ${services.map(s => {
        const name = getServiceName(s)
        const desc = getServiceDesc(s)
        return `<div class="card" style="text-align:center">
        <h3>${esc(name)}</h3>
        ${desc ? `<p>${esc(desc)}</p>` : ''}
        <div class="price" style="font-size:1.5rem;font-weight:700;color:var(--primary);margin:1rem 0">Contact for Pricing</div>
        <a href="contact.html" class="btn btn-primary" style="width:100%;justify-content:center">Get a Quote</a>
      </div>`
      }).join('\n      ')}
    </div>
    `}

    <div style="text-align:center;margin-top:3rem;padding:2rem;background:var(--bg-alt);border-radius:var(--radius)">
      <h3 style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem">Need a Custom Package?</h3>
      <p style="color:var(--text-secondary);margin-bottom:1rem">We offer flexible pricing and custom packages. Let us know what you need.</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <a href="contact.html" class="btn btn-primary">Request a Quote</a>
        ${c.phone ? `<a href="tel:${esc(c.phone)}" class="btn btn-accent">Call ${esc(c.phone)}</a>` : ''}
      </div>
    </div>
  </div>
</section>
`
}

// ==================== MAIN GENERATOR ====================

export function generateSite(brief: Record<string, unknown>): Record<string, string> {
  const business = (brief.business || {}) as Record<string, unknown>
  const brand = (brief.brand || {}) as Record<string, unknown>
  const gData = (brief.googleData || {}) as Record<string, unknown>

  // Parse address components from brief
  const addressStr = (business.address as string) || ''
  const addressParts = addressStr.split(',').map(p => p.trim())

  const config: SiteConfig = {
    businessName: (business.name as string) || 'My Business',
    tagline: (brand.tagline as string) || undefined,
    businessType: (business.type as string) || undefined,
    phone: (business.phone as string) || undefined,
    email: (business.email as string) || undefined,
    address: addressParts[0] || undefined,
    city: addressParts[1] || undefined,
    state: addressParts[2] || undefined,
    zip: addressParts[3] || undefined,
    brandColors: {
      primary: ((brand.colors as Record<string, string>)?.primary) || '#2563eb',
      secondary: ((brand.colors as Record<string, string>)?.secondary) || '#1e40af',
      accent: ((brand.colors as Record<string, string>)?.accent) || '#3b82f6',
    },
    logoUrl: (brand.logoUrl as string) || undefined,
    services: ((brief.services || []) as (string | { name: string; description?: string })[]),
    googlePlaceId: (business.googlePlaceId as string) || undefined,
    googleData: gData ? {
      rating: gData.rating as number | undefined,
      reviews: gData.reviews as number | undefined,
      openingHours: gData.openingHours as string[] | undefined,
      photos: gData.photos as string[] | undefined,
    } : undefined,
    specialRequests: (brief.specialRequests as string) || undefined,
    pages: (brief.pages as string[]) || ['home', 'services', 'contact', 'booking', 'pricing'],
  }

  const css = generateCSS(config)

  const pages: Record<string, string> = {
    'index.html': wrapLayout(config, 'Home', generateHomePage(config), css),
    'services.html': wrapLayout(config, 'Services', generateServicesPage(config), css),
    'contact.html': wrapLayout(config, 'Contact', generateContactPage(config), css),
    'booking.html': wrapLayout(config, 'Booking', generateBookingPage(config), css),
    'pricing.html': wrapLayout(config, 'Pricing', generatePricingPage(config), css),
  }

  return pages
}

/**
 * Generate site directly from raw project data (DB columns)
 */
export function generateSiteFromProject(project: Record<string, unknown>): Record<string, string> {
  const config: SiteConfig = {
    businessName: (project.business_name as string) || 'My Business',
    tagline: (project.tagline as string) || undefined,
    businessType: (project.business_type as string) || undefined,
    phone: (project.phone as string) || undefined,
    email: (project.email as string) || undefined,
    address: (project.address as string) || undefined,
    city: (project.city as string) || undefined,
    state: (project.state as string) || undefined,
    zip: (project.zip as string) || undefined,
    brandColors: (project.brand_colors as SiteConfig['brandColors']) || {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6',
    },
    logoUrl: (project.logo_url as string) || undefined,
    services: (project.services as SiteConfig['services']) || [],
    googlePlaceId: (project.google_place_id as string) || undefined,
    googleData: (project.google_data as SiteConfig['googleData']) || undefined,
    specialRequests: (project.special_requests as string) || undefined,
    pages: (project.pages as string[]) || ['home', 'services', 'contact', 'booking', 'pricing'],
  }

  const css = generateCSS(config)

  return {
    'index.html': wrapLayout(config, 'Home', generateHomePage(config), css),
    'services.html': wrapLayout(config, 'Services', generateServicesPage(config), css),
    'contact.html': wrapLayout(config, 'Contact', generateContactPage(config), css),
    'booking.html': wrapLayout(config, 'Booking', generateBookingPage(config), css),
    'pricing.html': wrapLayout(config, 'Pricing', generatePricingPage(config), css),
  }
}
